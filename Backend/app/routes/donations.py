# app/routes/donations.py
# Donations Blueprint routes. Handles admin-restricted fetch of all donations and authenticated donation submissions.

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.services.donation_service import DonationService
from app.utils import success_response, error_response, validate_required_fields, admin_required

donations_bp = Blueprint('donations', __name__)

@donations_bp.route('', methods=['GET'])
@admin_required()
def get_donations():
    donations = DonationService.get_all_donations()
    return success_response(donations)

@donations_bp.route('', methods=['POST'])
@jwt_required()
def create_donation():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['donor_name', 'amount', 'project_id'])
    if not is_valid:
        return error_response(err, 400)
        
    donation, create_err = DonationService.create_donation(
        donor_name=data['donor_name'],
        amount=data['amount'],
        project_id=data['project_id']
    )
    
    if create_err:
        return error_response(create_err, 400)
        
    return success_response(donation, "Donation processed successfully", 201)
