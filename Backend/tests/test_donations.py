import json

def test_get_donations_unauthorized(client):
    response = client.get('/api/donations')
    assert response.status_code == 401

def test_get_donations_forbidden_for_user(client, auth_headers):
    headers = auth_headers(role='user')
    response = client.get('/api/donations', headers=headers)
    assert response.status_code == 403

def test_get_donations_success_for_admin(client, auth_headers):
    headers = auth_headers(role='admin')
    response = client.get('/api/donations', headers=headers)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['data'] == []

def test_create_donation_unauthorized(client):
    payload = {
        "donor_name": "Bob",
        "amount": 100.0,
        "project_id": 1
    }
    response = client.post('/api/donations', json=payload)
    assert response.status_code == 401

def test_create_donation_success_and_updates_raised_amount(client, auth_headers):
    # Create project first
    admin_headers = auth_headers(role='admin')
    project_payload = {
        "title": "Clean Water",
        "description": "Provide clean water",
        "target_amount": 10000.0
    }
    project_resp = client.post('/api/projects', json=project_payload, headers=admin_headers)
    project_id = project_resp.get_json()['data']['id']
    
    # Make donation
    user_headers = auth_headers(role='user')
    donation_payload = {
        "donor_name": "Alice Cooper",
        "amount": 250.0,
        "project_id": project_id
    }
    donation_resp = client.post('/api/donations', json=donation_payload, headers=user_headers)
    assert donation_resp.status_code == 201
    
    donation_data = donation_resp.get_json()
    assert donation_data['success'] is True
    assert donation_data['data']['amount'] == 250.0
    
    # Verify project's raised_amount is updated
    project_get_resp = client.get('/api/projects')
    projects_list = project_get_resp.get_json()['data']
    assert len(projects_list) == 1
    assert projects_list[0]['raised_amount'] == 250.0

def test_create_donation_project_not_found(client, auth_headers):
    user_headers = auth_headers(role='user')
    payload = {
        "donor_name": "Bob",
        "amount": 100.0,
        "project_id": 9999 # Non-existent project
    }
    response = client.post('/api/donations', json=payload, headers=user_headers)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "Project not found" in data['error']

def test_create_donation_invalid_project_status(client, auth_headers):
    # Create project with 'completed' status
    admin_headers = auth_headers(role='admin')
    project_payload = {
        "title": "Completed Project",
        "description": "Already finished",
        "target_amount": 10000.0,
        "status": "completed"
    }
    project_resp = client.post('/api/projects', json=project_payload, headers=admin_headers)
    project_id = project_resp.get_json()['data']['id']
    
    # Make donation
    user_headers = auth_headers(role='user')
    donation_payload = {
        "donor_name": "Bob",
        "amount": 100.0,
        "project_id": project_id
    }
    response = client.post('/api/donations', json=donation_payload, headers=user_headers)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "Cannot donate to this project" in data['error']
