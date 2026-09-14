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
            
        status = 'pending' if role == 'admin' else 'approved'
        user = User(name=name, email=email, role=role, status=status)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            
            additional_claims = {
                "role": user.role,
                "status": user.status,
                "name": user.name
            }
            access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
            
            return {
                "user": user.to_dict(),
                "access_token": access_token
            }, None
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
            
        if user.role == 'admin' and user.status == 'pending':
            return None, "Your admin registration request is pending approval by an administrator."
            
        if user.status == 'rejected':
            return None, "Your account request has been rejected."
            
        # Create JWT access token with role, status, and name in additional claims
        additional_claims = {
            "role": user.role,
            "status": user.status,
            "name": user.name
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        
        return {
            "user": user.to_dict(),
            "access_token": access_token
        }, None

    @staticmethod
    def get_me(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return None, "User not found"
        return user.to_dict(), None

    @staticmethod
    def get_pending_admins():
        users = User.query.filter_by(role='admin', status='pending').all()
        return [user.to_dict() for user in users]

    @staticmethod
    def approve_admin(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return None, "User not found"
        if user.role != 'admin':
            return None, "User is not an admin"
        user.status = 'approved'
        try:
            db.session.commit()
            return user.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def reject_admin(user_id):
        user = db.session.get(User, user_id)
        if not user:
            return None, "User not found"
        if user.role != 'admin':
            return None, "User is not an admin"
        user.status = 'rejected'
        try:
            db.session.commit()
            return user.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
