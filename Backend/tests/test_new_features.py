import pytest
from app.models import User, Project, Blog, CalendarEvent

def test_project_details(client, db):
    proj = Project(title="Water Project", description="Details test", target_amount=5000.0)
    db.session.add(proj)
    db.session.commit()

    blog = Blog(title="Water Blog", content="Blog content", project_id=proj.id)
    db.session.add(blog)
    db.session.commit()

    response = client.get(f'/api/projects/{proj.id}')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['data']['title'] == "Water Project"
    assert len(json_data['data']['blogs']) == 1
    assert json_data['data']['blogs'][0]['title'] == "Water Blog"

def test_admin_signup_pending_flow(client, db):
    # Register normal user
    r_user = client.post('/api/auth/register', json={
        "name": "Normal User",
        "email": "norm@example.com",
        "password": "password123",
        "role": "user"
    })
    assert r_user.status_code == 201
    assert r_user.get_json()['data']['user']['status'] == 'approved'

    # Register admin (should be pending)
    r_admin = client.post('/api/auth/register', json={
        "name": "Pending Admin",
        "email": "pending@example.com",
        "password": "password123",
        "role": "admin"
    })
    assert r_admin.status_code == 201
    assert r_admin.get_json()['data']['user']['status'] == 'pending'

    # Login attempt by pending admin should be rejected
    l_admin = client.post('/api/auth/login', json={
        "email": "pending@example.com",
        "password": "password123"
    })
    assert l_admin.status_code == 401
    assert "pending approval" in l_admin.get_json()['error']

def test_blog_endpoints(client, db, auth_headers):
    # Public get blogs
    res = client.get('/api/blogs')
    assert res.status_code == 200

    # Admin create blog
    admin_hdr = auth_headers(role='admin')
    res_create = client.post('/api/blogs', json={
        "title": "New Innovation",
        "content": "Full story here"
    }, headers=admin_hdr)
    assert res_create.status_code == 201
    blog_id = res_create.get_json()['data']['id']

    # Get single blog
    res_single = client.get(f'/api/blogs/{blog_id}')
    assert res_single.status_code == 200
    assert res_single.get_json()['data']['title'] == "New Innovation"

def test_calendar_endpoints(client, db, auth_headers):
    admin_hdr = auth_headers(role='admin')
    res_create = client.post('/api/calendar', json={
        "title": "Community Workshop",
        "start_time": "2026-09-01T10:00:00",
        "end_time": "2026-09-01T12:00:00",
        "location": "Atlanta Hall"
    }, headers=admin_hdr)
    assert res_create.status_code == 201

    res_get = client.get('/api/calendar')
    assert res_get.status_code == 200
    assert len(res_get.get_json()['data']) == 1
