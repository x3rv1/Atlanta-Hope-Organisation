# app/routes/supporters.py
# Supporters Blueprint routes. Handles fetching all organization supporters and admin-secured supporter registration.

from flask import Blueprint, request
from app.services.supporter_service import SupporterService
from app.utils import success_response, error_response, validate_required_fields, admin_required

supporters_bp = Blueprint('supporters', __name__)

@supporters_bp.route('', methods=['GET'])
def get_supporters():
    supporters = SupporterService.get_all_supporters()
    return success_response(supporters)

@supporters_bp.route('', methods=['POST'])
@admin_required()
def create_supporter():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['company_name', 'logo_url', 'contribution_description'])
    if not is_valid:
        return error_response(err, 400)
        
    supporter, create_err = SupporterService.create_supporter(
        company_name=data['company_name'],
        logo_url=data['logo_url'],
        contribution_description=data['contribution_description']
    )
    
    if create_err:
        return error_response(create_err, 400)
        
    return success_response(supporter, "Supporter added successfully", 201)
