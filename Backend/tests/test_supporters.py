import json

def test_get_supporters_empty(client):
    response = client.get('/api/supporters')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['data'] == []

def test_create_supporter_unauthorized(client):
    payload = {
        "company_name": "Acme Corp",
        "logo_url": "http://example.com/logo.png",
        "contribution_description": "Donated office supplies"
    }
    response = client.post('/api/supporters', json=payload)
    assert response.status_code == 401

def test_create_supporter_forbidden_for_user(client, auth_headers):
    payload = {
        "company_name": "Acme Corp",
        "logo_url": "http://example.com/logo.png",
        "contribution_description": "Donated office supplies"
    }
    headers = auth_headers(role='user')
    response = client.post('/api/supporters', json=payload, headers=headers)
    assert response.status_code == 403

def test_create_supporter_success_for_admin(client, auth_headers):
    payload = {
        "company_name": "Acme Corp",
        "logo_url": "http://example.com/logo.png",
        "contribution_description": "Donated office supplies"
    }
    headers = auth_headers(role='admin')
    response = client.post('/api/supporters', json=payload, headers=headers)
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['data']['company_name'] == "Acme Corp"
    assert data['data']['logo_url'] == "http://example.com/logo.png"

def test_create_supporter_missing_fields(client, auth_headers):
    payload = {
        "logo_url": "http://example.com/logo.png",
        "contribution_description": "Donated office supplies"
    }
    headers = auth_headers(role='admin')
    response = client.post('/api/supporters', json=payload, headers=headers)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "Missing required fields" in data['error']
