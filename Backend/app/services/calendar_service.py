# app/services/calendar_service.py
# CalendarService logic. Manages calendar events operations.

from datetime import datetime
from app.models import db, CalendarEvent

class CalendarService:
    @staticmethod
    def get_all_events():
        events = CalendarEvent.query.order_by(CalendarEvent.start_time.asc()).all()
        return [event.to_dict() for event in events]

    @staticmethod
    def get_event_by_id(event_id):
        event = db.session.get(CalendarEvent, event_id)
        if not event:
            return None, "Event not found"
        return event.to_dict(), None

    @staticmethod
    def create_event(title, start_time, end_time, description=None, location=None):
        if not title or not start_time or not end_time:
            return None, "Title, start time, and end time are required"

        try:
            if isinstance(start_time, str):
                start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            else:
                start_dt = start_time

            if isinstance(end_time, str):
                end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            else:
                end_dt = end_time
        except Exception:
            return None, "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"

        event = CalendarEvent(
            title=title,
            start_time=start_dt,
            end_time=end_dt,
            description=description,
            location=location
        )

        try:
            db.session.add(event)
            db.session.commit()
            return event.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def update_event(event_id, title=None, start_time=None, end_time=None, description=None, location=None):
        event = db.session.get(CalendarEvent, event_id)
        if not event:
            return None, "Event not found"

        if title:
            event.title = title
        if description is not None:
            event.description = description
        if location is not None:
            event.location = location

        if start_time:
            try:
                event.start_time = datetime.fromisoformat(start_time.replace('Z', '+00:00')) if isinstance(start_time, str) else start_time
            except Exception:
                return None, "Invalid start time date format"

        if end_time:
            try:
                event.end_time = datetime.fromisoformat(end_time.replace('Z', '+00:00')) if isinstance(end_time, str) else end_time
            except Exception:
                return None, "Invalid end time date format"

        try:
            db.session.commit()
            return event.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def delete_event(event_id):
        event = db.session.get(CalendarEvent, event_id)
        if not event:
            return None, "Event not found"

        try:
            db.session.delete(event)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
