# app/services/auth_service.py
# AuthService logic. Decouples registration operations, password hashing validation, and JWT authentication token generation.

from app.models import db, User
from flask_jwt_extended import create_access_token
from app.utils import validate_email

class AuthService:
    @staticmethod
    def register_user(name, email, password, role='user'):
        if not name or not email or not password:
            return None, "Name, email, and password are required"
            
        if not validate_email(email):
            return None, "Invalid email format"
            
        if role not in ['user', 'admin']:
            return None, "Invalid role. Role must be 'user' or 'admin'"
            
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return None, "User with this email already exists"
            
        user = User(name=name, email=email, role=role)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error during registration: {str(e)}"

    @staticmethod
    def login_user(email, password):
        if not email or not password:
            return None, "Email and password are required"
            
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return None, "Invalid email or password"
            
        # Create JWT access token with role and name in additional claims
        additional_claims = {
            "role": user.role,
            "name": user.name
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        
        return {
            "user": user.to_dict(),
            "access_token": access_token
        }, None
