# app/routes/auth.py
# Authentication Blueprint routes. Handles user signup registration and JWT login endpoints.

from flask import Blueprint, request
from app.services.auth_service import AuthService
from app.utils import success_response, error_response, validate_required_fields

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['name', 'email', 'password'])
    if not is_valid:
        return error_response(err, 400)
        
    role = data.get('role', 'user')
    user, register_err = AuthService.register_user(
        name=data['name'],
        email=data['email'],
        password=data['password'],
        role=role
    )
    
    if register_err:
        return error_response(register_err, 400)
        
    return success_response(user, "User registered successfully", 201)

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
