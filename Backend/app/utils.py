# app/utils.py
# Helper utilities. Provides functions for field validation, standard success/error responses, and authorization checks.

import re
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt

def validate_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_regex, email))

def validate_required_fields(data, fields):
    if not data:
        return False, "Request body is empty"
    missing = [field for field in fields if field not in data or data[field] is None or (isinstance(data[field], str) and not data[field].strip())]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

def success_response(data, message=None, status_code=200):
    response = {'success': True}
    if message:
        response['message'] = message
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message, status_code=400, details=None):
    response = {'success': False, 'error': message}
    if details:
        response['details'] = details
    return jsonify(response), status_code

def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(f"Authentication failed: {str(e)}", 401)
            claims = get_jwt()
            if claims.get("role") != "admin":
                return error_response("Admin privilege required", 403)
            return fn(*args, **kwargs)
        return decorator
    return wrapper
