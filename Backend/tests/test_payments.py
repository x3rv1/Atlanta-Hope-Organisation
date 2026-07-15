import json
from unittest.mock import patch, MagicMock
from app.models import db, Project, MpesaTransaction, Donation

def create_active_project(client, auth_headers):
    # Helper to create active project
    admin_headers = auth_headers(role='admin')
    payload = {
        "title": "Clean Water Fund",
        "description": "Clean water project description",
        "target_amount": 5000.0
    }
    resp = client.post('/api/projects', json=payload, headers=admin_headers)
    return resp.get_json()['data']['id']

@patch('app.routes.payments.requests.get')
@patch('app.routes.payments.requests.post')
def test_mpesa_stkpush_success(mock_post, mock_get, client, auth_headers):
    # Mock token generation response
    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = {"access_token": "mock_token_abc123"}
    mock_get.return_value = mock_token_resp
    
    # Mock stk push submission response
    mock_stk_resp = MagicMock()
    mock_stk_resp.status_code = 200
    mock_stk_resp.json.return_value = {
        "ResponseCode": "0",
        "CheckoutRequestID": "checkout_req_123",
        "ResponseDescription": "Success"
    }
    mock_post.return_value = mock_stk_resp
    
    project_id = create_active_project(client, auth_headers)
    
    payload = {
        "phone": "0712345678",
        "amount": 100.0,
        "donor_name": "David",
        "project_id": project_id
    }
    
    response = client.post('/api/payments/mpesa/stkpush', json=payload)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['CheckoutRequestID'] == "checkout_req_123"
    assert res_data['ResponseCode'] == "0"
    
    # Check if transaction was saved as pending in database
    with client.application.app_context():
        txn = db.session.get(MpesaTransaction, "checkout_req_123")
        assert txn is not None
        assert txn.donor_name == "David"
        assert txn.amount == 100.0
        assert txn.status == "pending"

def test_mpesa_stkpush_invalid_project(client):
    payload = {
        "phone": "0712345678",
        "amount": 100.0,
        "donor_name": "David",
        "project_id": 99999
    }
    response = client.post('/api/payments/mpesa/stkpush', json=payload)
    assert response.status_code == 400
    assert "Project not found" in response.get_json()['error']

def test_mpesa_callback_success(client, auth_headers):
    # Initialize database state: Project and pending MpesaTransaction
    project_id = create_active_project(client, auth_headers)
    
    with client.application.app_context():
        txn = MpesaTransaction(
            checkout_request_id="checkout_req_success",
            donor_name="David",
            amount=200.0,
            project_id=project_id,
            status="pending"
        )
        db.session.add(txn)
        db.session.commit()
        
    callback_payload = {
        "Body": {
            "stkCallback": {
                "CheckoutRequestID": "checkout_req_success",
                "ResultCode": 0,
                "ResultDesc": "The service request is processed successfully.",
                "CallbackMetadata": {
                    "Item": [
                        {"Name": "Amount", "Value": 200.0},
                        {"Name": "MpesaReceiptNumber", "Value": "NLJ7RT6123"}
                    ]
                }
            }
        }
    }
    
    response = client.post('/api/payments/callback', json=callback_payload)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['ResultCode'] == 0
    
    # Verify DB updates
    with client.application.app_context():
        # Check transaction state
        txn = db.session.get(MpesaTransaction, "checkout_req_success")
        assert txn.status == "completed"
        
        # Check donation recorded
        donations = Donation.query.filter_by(project_id=project_id).all()
        assert len(donations) == 1
        assert donations[0].donor_name == "David"
        assert donations[0].amount == 200.0
        
        # Check project raised_amount
        project = db.session.get(Project, project_id)
        assert project.raised_amount == 200.0

def test_mpesa_callback_failure(client, auth_headers):
    project_id = create_active_project(client, auth_headers)
    
    with client.application.app_context():
        txn = MpesaTransaction(
            checkout_request_id="checkout_req_fail",
            donor_name="David",
            amount=200.0,
            project_id=project_id,
            status="pending"
        )
        db.session.add(txn)
        db.session.commit()
        
    callback_payload = {
        "Body": {
            "stkCallback": {
                "CheckoutRequestID": "checkout_req_fail",
                "ResultCode": 1032,
                "ResultDesc": "Request cancelled by user."
            }
        }
    }
    
    response = client.post('/api/payments/callback', json=callback_payload)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['ResultCode'] == 0
    
    # Verify DB updates
    with client.application.app_context():
        # Check transaction state is failed
        txn = db.session.get(MpesaTransaction, "checkout_req_fail")
        assert txn.status == "failed"
        
        # Verify NO donation registered
        donations = Donation.query.filter_by(project_id=project_id).all()
        assert len(donations) == 0
        
        # Project raised_amount must remain 0
        project = db.session.get(Project, project_id)
        assert project.raised_amount == 0.0
