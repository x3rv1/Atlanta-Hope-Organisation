# tests/conftest.py
# Pytest configuration. Defines fixtures for testing DB session setups, clients, and automated JWT headers generation.

import pytest
from app import create_app
from app.models import db as _db, User
from flask_jwt_extended import create_access_token

@pytest.fixture(scope='session')
def app():
    app = create_app('testing')
    return app

@pytest.fixture(scope='function')
def db(app):
    with app.app_context():
        _db.create_all()
        yield _db
        _db.session.remove()
        _db.drop_all()

@pytest.fixture
def client(app, db):
    return app.test_client()

@pytest.fixture
def auth_headers(app):
    def _headers(role='user', email='test@example.com', name='Test User'):
        with app.app_context():
            additional_claims = {
                "role": role,
                "name": name
            }
            # We use an arbitrary user id for token signature
            access_token = create_access_token(identity="123", additional_claims=additional_claims)
            return {
                "Authorization": f"Bearer {access_token}"
            }
    return _headers
