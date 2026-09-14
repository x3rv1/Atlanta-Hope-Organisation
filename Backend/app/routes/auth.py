# app/routes/auth.py
# Authentication Blueprint routes. Handles user signup registration and JWT login endpoints.

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.auth_service import AuthService
from app.utils import success_response, error_response, validate_required_fields, admin_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['name', 'email', 'password'])
    if not is_valid:
        return error_response(err, 400)
        
    role = data.get('role', 'user')
    result, register_err = AuthService.register_user(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=role
    )
    
    if register_err:
        return error_response(register_err, 400)
        
    return success_response(result, "User registered successfully", 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['email', 'password'])
    if not is_valid:
        return error_response(err, 400)
        
    result, login_err = AuthService.login_user(data['email'], data['password'])
    if login_err:
        return error_response(login_err, 401)
        
    return success_response(result, "Logged in successfully")

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user, err = AuthService.get_me(user_id)
    if err:
        return error_response(err, 404)
    return success_response(user)

@auth_bp.route('/admin/requests', methods=['GET'])
@admin_required()
def get_admin_requests():
    requests = AuthService.get_pending_admins()
    return success_response(requests)

@auth_bp.route('/admin/requests/<int:user_id>/approve', methods=['POST', 'PUT'])
@admin_required()
def approve_admin_request(user_id):
    user, err = AuthService.approve_admin(user_id)
    if err:
        return error_response(err, 400)
    return success_response(user, "Admin request approved successfully")

@auth_bp.route('/admin/requests/<int:user_id>/reject', methods=['POST', 'PUT'])
@admin_required()
def reject_admin_request(user_id):
    user, err = AuthService.reject_admin(user_id)
    if err:
        return error_response(err, 400)
    return success_response(user, "Admin request rejected")

