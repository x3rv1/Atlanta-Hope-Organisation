# app/models.py
# SQLAlchemy database models. Defines models for User, Project, Donation, Supporter, and MpesaTransaction.

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    raised_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='active')  # active, completed, suspended
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationship to donations
    donations = db.relationship('Donation', backref='project', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'target_amount': self.target_amount,
            'raised_amount': self.raised_amount,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Donation(db.Model):
    __tablename__ = 'donations'
    
    id = db.Column(db.Integer, primary_key=True)
    donor_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'id': self.id,
            'donor_name': self.donor_name,
            'amount': self.amount,
            'project_id': self.project_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Supporter(db.Model):
    __tablename__ = 'supporters'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    logo_url = db.Column(db.String(255), nullable=False)
    contribution_description = db.Column(db.Text, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'logo_url': self.logo_url,
            'contribution_description': self.contribution_description
        }

class MpesaTransaction(db.Model):
    __tablename__ = 'mpesa_transactions'
    
    checkout_request_id = db.Column(db.String(100), primary_key=True)
    donor_name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    status = db.Column(db.String(20), default='pending') # pending, completed, failed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    def to_dict(self):
        return {
            'checkout_request_id': self.checkout_request_id,
            'donor_name': self.donor_name,
            'amount': self.amount,
            'project_id': self.project_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
