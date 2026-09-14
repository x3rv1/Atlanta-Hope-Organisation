# app/routes/calendar.py
# Calendar Blueprint routes. View and admin CRUD endpoints for calendar events.

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.services.calendar_service import CalendarService
from app.utils import success_response, error_response, validate_required_fields, admin_required

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('', methods=['GET'])
def get_events():
    events = CalendarService.get_all_events()
    return success_response(events)

@calendar_bp.route('/<int:event_id>', methods=['GET'])
def get_event(event_id):
    event, err = CalendarService.get_event_by_id(event_id)
    if err:
        return error_response(err, 404)
    return success_response(event)

@calendar_bp.route('', methods=['POST'])
@admin_required()
def create_event():
    data = request.get_json(silent=True)
    is_valid, err = validate_required_fields(data, ['title', 'start_time', 'end_time'])
    if not is_valid:
        return error_response(err, 400)

    event, create_err = CalendarService.create_event(
        title=data['title'],
        start_time=data['start_time'],
        end_time=data['end_time'],
        description=data.get('description'),
        location=data.get('location')
    )
    if create_err:
        return error_response(create_err, 400)
    return success_response(event, "Calendar event created successfully", 201)

@calendar_bp.route('/<int:event_id>', methods=['PUT'])
@admin_required()
def update_event(event_id):
    data = request.get_json(silent=True) or {}
    event, err = CalendarService.update_event(
        event_id=event_id,
        title=data.get('title'),
        start_time=data.get('start_time'),
        end_time=data.get('end_time'),
        description=data.get('description'),
        location=data.get('location')
    )
    if err:
        return error_response(err, 400)
    return success_response(event, "Calendar event updated successfully")

@calendar_bp.route('/<int:event_id>', methods=['DELETE'])
@admin_required()
def delete_event(event_id):
    success, err = CalendarService.delete_event(event_id)
    if err:
        return error_response(err, 400)
    return success_response(None, "Calendar event deleted successfully")
