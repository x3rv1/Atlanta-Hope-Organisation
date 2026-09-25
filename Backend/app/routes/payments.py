# app/routes/payments.py
# Payments Blueprint routes. Integrates Safaricom M-Pesa OAuth tokens, STK Push triggers, and async transaction verification callbacks.

import base64
import logging
from datetime import datetime, timezone
import requests
from requests.auth import HTTPBasicAuth
from flask import Blueprint, request, jsonify, current_app
from app.models import db, Project, Donation, MpesaTransaction
from app.utils import success_response, error_response, validate_required_fields

payments_bp = Blueprint('payments', __name__)
logger = logging.getLogger(__name__)

def generate_access_token():
    consumer_key = current_app.config.get('MPESA_CONSUMER_KEY')
    consumer_secret = current_app.config.get('MPESA_CONSUMER_SECRET')
    auth_url = current_app.config.get('MPESA_AUTH_URL')
    
    if not consumer_key or not consumer_secret:
        raise ValueError("M-Pesa Consumer Key or Secret not configured in settings")
        
    try:
        response = requests.get(auth_url, auth=HTTPBasicAuth(consumer_key, consumer_secret), timeout=10)
        response.raise_for_status()
        return response.json()['access_token']
    except Exception as e:
        logger.error(f"Failed to generate Safaricom access token: {str(e)}")
        raise

def format_phone_number(phone):
    # Standard Safaricom formatting (2547XXXXXXXX or 2541XXXXXXXX)
    phone = str(phone).strip().replace('+', '')
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('7') or phone.startswith('1'):
        phone = '254' + phone
    return phone

@payments_bp.route('/mpesa/stkpush', methods=['POST'])
def mpesa_stkpush():
    data = request.get_json(silent=True) or {}
    
    raw_phone = data.get('phone') or data.get('phoneNumber')
    if not raw_phone:
        return error_response("Phone number is required", 400)
        
    phone = format_phone_number(raw_phone)
    donor_name = data.get('donor_name') or data.get('donorName') or 'Anonymous Donor'
    
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return error_response("Amount must be positive", 400)
    except (ValueError, TypeError):
        return error_response("Amount must be a valid number", 400)
        
    project_id = data.get('project_id') or data.get('projectId')
    if project_id:
        project = db.session.get(Project, project_id)
        if not project:
            return error_response("Project not found", 400)
        if project.status != 'active':
            return error_response(f"Cannot donate to project because its status is '{project.status}'", 400)
    else:
        project = Project.query.filter_by(status='active').first()
        if not project:
            project = Project.query.first()
            if not project:
                project = Project(
                    title="General Hope Fund",
                    description="General organizational support and community outreach.",
                    target_amount=1000000.0,
                    raised_amount=0.0,
                    status="active"
                )
                db.session.add(project)
                db.session.commit()
        project_id = project.id
        
    # Safaricom configurations
    shortcode = current_app.config.get('MPESA_SHORTCODE')
    passkey = current_app.config.get('MPESA_PASSKEY')
    callback_url = current_app.config.get('MPESA_CALLBACK_URL')
    stk_url = current_app.config.get('MPESA_STK_PUSH_URL')
    
    if not all([shortcode, passkey, callback_url, stk_url]):
        return error_response("M-Pesa STK Push configurations are incomplete", 500)
        
    try:
        access_token = generate_access_token()
    except Exception as e:
        return error_response(f"Authentication with Safaricom failed: {str(e)}", 500)
        
    # Generate timestamp (format: YYYYMMDDHHmmss)
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Generate Password
    password_str = f"{shortcode}{passkey}{timestamp}"
    password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        'BusinessShortCode': int(shortcode),
        'Password': password,
        'Timestamp': timestamp,
        'TransactionType': 'CustomerPayBillOnline',
        'Amount': int(amount), # Cast to int as Safaricom prefers integer values for STK push
        'PartyA': int(phone),
        'PartyB': int(shortcode),
        'PhoneNumber': int(phone),
        'CallBackURL': callback_url,
        'AccountReference': 'AtlantaHope',
        'TransactionDesc': f'Donation to project {project_id}'
    }
    
    try:
        response = requests.post(stk_url, json=payload, headers=headers, timeout=15)
        res_data = response.json()
        
        # Safaricom STK push response validation
        if response.status_code == 200 and res_data.get('ResponseCode') == '0':
            checkout_request_id = res_data['CheckoutRequestID']
            
            # Save transaction as pending in DB
            txn = MpesaTransaction(
                checkout_request_id=checkout_request_id,
                donor_name=donor_name,
                phone_number=phone,
                amount=amount,
                project_id=project_id,
                status='pending'
            )
            db.session.add(txn)
            db.session.commit()
            
            return jsonify(res_data), 200
        else:
            logger.error(f"Safaricom STK push request rejected: {res_data}")
            return error_response("Safaricom rejected the STK push request", 400, details=res_data)
            
    except Exception as e:
        db.session.rollback()
        logger.error(f"M-Pesa STK push error: {str(e)}")
        return error_response(f"Payment request failed: {str(e)}", 500)

@payments_bp.route('/mpesa/status/<checkout_request_id>', methods=['GET'])
def get_mpesa_status(checkout_request_id):
    txn = db.session.get(MpesaTransaction, checkout_request_id)
    if not txn:
        return error_response("Transaction not found", 404)
        
    # If transaction is still pending, attempt a query to Safaricom STK Query API
    if txn.status == 'pending':
        shortcode = current_app.config.get('MPESA_SHORTCODE')
        passkey = current_app.config.get('MPESA_PASSKEY')
        stk_query_url = current_app.config.get('MPESA_STK_QUERY_URL', 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query')
        
        if shortcode and passkey and stk_query_url:
            try:
                access_token = generate_access_token()
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                password_str = f"{shortcode}{passkey}{timestamp}"
                password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')
                
                headers = {
                    'Authorization': f'Bearer {access_token}',
                    'Content-Type': 'application/json'
                }
                payload = {
                    'BusinessShortCode': int(shortcode),
                    'Password': password,
                    'Timestamp': timestamp,
                    'CheckoutRequestID': checkout_request_id
                }
                
                res = requests.post(stk_query_url, json=payload, headers=headers, timeout=10)
                if res.status_code == 200:
                    q_data = res.json()
                    res_code = str(q_data.get('ResultCode'))
                    res_desc = q_data.get('ResultDesc', '')
                    
                    if res_code == '0':
                        txn.status = 'completed'
                        txn.result_desc = res_desc
                        # Extract receipt if present
                        receipt = q_data.get('MpesaReceiptNumber')
                        if receipt:
                            txn.mpesa_receipt_number = receipt
                        
                        # Create donation if not exists
                        donation = Donation(
                            donor_name=txn.donor_name,
                            amount=txn.amount,
                            project_id=txn.project_id,
                            mpesa_receipt_number=txn.mpesa_receipt_number
                        )
                        db.session.add(donation)
                        
                        project = db.session.get(Project, txn.project_id)
                        if project:
                            project.raised_amount += txn.amount
                        db.session.commit()
                    elif res_code not in ['0', 'None'] and 'being processed' not in res_desc.lower():
                        txn.status = 'failed'
                        txn.result_desc = res_desc
                        db.session.commit()
            except Exception as e:
                logger.warning(f"STK Push status query failed for {checkout_request_id}: {str(e)}")

    return success_response(data=txn.to_dict())

@payments_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    callback_data = request.get_json(silent=True)
    if not callback_data or 'Body' not in callback_data:
        return jsonify({"ResultCode": 1, "ResultDesc": "Invalid callback structure"}), 400
        
    stk_callback = callback_data['Body'].get('stkCallback')
    if not stk_callback:
        return jsonify({"ResultCode": 1, "ResultDesc": "stkCallback is missing"}), 400
        
    checkout_request_id = stk_callback.get('CheckoutRequestID')
    result_code = stk_callback.get('ResultCode')
    result_desc = stk_callback.get('ResultDesc')
    
    # Look up the transaction in our database
    txn = db.session.get(MpesaTransaction, checkout_request_id)
    if not txn:
        logger.error(f"M-Pesa Callback checkout_request_id {checkout_request_id} not found in DB")
        return jsonify({"ResultCode": 0, "ResultDesc": "Transaction not found, logged"}), 200
        
    txn.result_desc = result_desc

    if result_code == 0:
        # Success payment
        txn.status = 'completed'
        
        # Extract metadata item (MpesaReceiptNumber)
        receipt_number = None
        callback_metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
        for item in callback_metadata:
            if item.get('Name') == 'MpesaReceiptNumber':
                receipt_number = item.get('Value')
                break
                
        txn.mpesa_receipt_number = receipt_number
        
        # Save to Donation Model
        donation = Donation(
            donor_name=txn.donor_name,
            amount=txn.amount,
            project_id=txn.project_id,
            mpesa_receipt_number=receipt_number
        )
        db.session.add(donation)
        
        # Update project raised_amount
        project = db.session.get(Project, txn.project_id)
        if project:
            project.raised_amount += txn.amount
            
        try:
            db.session.commit()
            logger.info(f"Payment successful: CheckoutRequestID {checkout_request_id} updated to completed. Receipt: {receipt_number}")
            return jsonify({"ResultCode": 0, "ResultDesc": "Callback processed successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error during M-Pesa callback process: {str(e)}")
            return jsonify({"ResultCode": 1, "ResultDesc": f"Database error: {str(e)}"}), 500
    else:
        # Failure payment (e.g. user cancelled, balance insufficient)
        txn.status = 'failed'
        logger.warning(f"Payment failed: CheckoutRequestID {checkout_request_id} failed with code {result_code}: {result_desc}")
        try:
            db.session.commit()
            return jsonify({"ResultCode": 0, "ResultDesc": "Callback failure logged successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error registering M-Pesa callback failure: {str(e)}")
            return jsonify({"ResultCode": 1, "ResultDesc": f"Database error: {str(e)}"}), 500
