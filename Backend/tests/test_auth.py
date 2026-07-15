# tests/test_auth.py
# Auth Unit Tests. Verifies registration rules, credentials verification, validation formats, and JWT generation logic.

import json

def test_register_user_success(client):
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "password123"
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['data']['email'] == "jane@example.com"
    assert data['data']['role'] == "user"

def test_register_duplicate_email(client):
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "password123"
    }
    client.post('/api/auth/register', json=payload)
    # Second time
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "already exists" in data['error']

def test_register_invalid_email(client):
    payload = {
        "name": "Jane Doe",
        "email": "jane-invalid-email",
        "password": "password123"
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "Invalid email format" in data['error']

def test_register_missing_fields(client):
    payload = {
        "email": "jane@example.com",
        "password": "password123"
    }
    response = client.post('/api/auth/register', json=payload)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "Missing required fields" in data['error']

def test_login_success(client):
    # First register
    register_payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password": "password123"
    }
    client.post('/api/auth/register', json=register_payload)
    
    # Login
    login_payload = {
        "email": "jane@example.com",
        "password": "password123"
    }
    response = client.post('/api/auth/login', json=login_payload)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'access_token' in data['data']
    assert data['data']['user']['email'] == "jane@example.com"

def test_login_invalid_credentials(client):
    payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post('/api/auth/login', json=payload)
    assert response.status_code == 401
    data = response.get_json()
    assert data['success'] is False
    assert "Invalid email or password" in data['error']
