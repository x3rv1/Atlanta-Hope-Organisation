# app/routes/projects.py
# Projects Blueprint routes. Handles fetching all projects and admin-secured project creation.

from flask import Blueprint, request
from app.services.project_service import ProjectService
from app.utils import success_response, error_response, validate_required_fields, admin_required

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['GET'])
def get_projects():
    projects = ProjectService.get_all_projects()
    return success_response(projects)

@projects_bp.route('/<int:project_id>', methods=['GET'])
def get_project_details(project_id):
    project, err = ProjectService.get_project_details(project_id)
    if err:
        return error_response(err, 404)
    return success_response(project)

@projects_bp.route('', methods=['POST'])
@admin_required()
def create_project():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['title', 'description', 'target_amount'])
    if not is_valid:
        return error_response(err, 400)
        
    status = data.get('status', 'active')
    project, create_err = ProjectService.create_project(
        title=data['title'],
        description=data['description'],
        target_amount=data['target_amount'],
        status=status
    )
    
    if create_err:
        return error_response(create_err, 400)
        
    return success_response(project, "Project created successfully", 201)

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@admin_required()
def update_project(project_id):
    data = request.get_json(silent=True) or {}
    project, err = ProjectService.update_project(
        project_id=project_id,
        title=data.get('title'),
        description=data.get('description'),
        target_amount=data.get('target_amount'),
        status=data.get('status')
    )
    if err:
        return error_response(err, 400)
    return success_response(project, "Project updated successfully")

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@admin_required()
def delete_project(project_id):
    success, err = ProjectService.delete_project(project_id)
    if err:
        return error_response(err, 400)
    return success_response(None, "Project deleted successfully")

