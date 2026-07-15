# tests/test_projects.py
# Projects Unit Tests. Verifies public list lookups, admin-restricted creation, role checks, and numeric bounds constraints.

import json

def test_get_projects_empty(client):
    response = client.get('/api/projects')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['data'] == []

def test_create_project_unauthorized(client):
    payload = {
        "title": "Clean Water",
        "description": "Provide clean water",
        "target_amount": 10000.0
    }
    response = client.post('/api/projects', json=payload)
    assert response.status_code == 401 # No JWT token

def test_create_project_forbidden_for_user(client, auth_headers):
    payload = {
        "title": "Clean Water",
        "description": "Provide clean water",
        "target_amount": 10000.0
    }
    headers = auth_headers(role='user')
    response = client.post('/api/projects', json=payload, headers=headers)
    assert response.status_code == 403 # Only admin can write

def test_create_project_success_for_admin(client, auth_headers):
    payload = {
        "title": "Clean Water",
        "description": "Provide clean water",
        "target_amount": 10000.0
    }
    headers = auth_headers(role='admin')
    response = client.post('/api/projects', json=payload, headers=headers)
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['data']['title'] == "Clean Water"
    assert data['data']['target_amount'] == 10000.0

def test_create_project_validation_failure(client, auth_headers):
    payload = {
        "title": "Clean Water",
        "description": "Provide clean water",
        "target_amount": -50.0 # Invalid target amount
    }
    headers = auth_headers(role='admin')
    response = client.post('/api/projects', json=payload, headers=headers)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "must be a positive number" in data['error']
