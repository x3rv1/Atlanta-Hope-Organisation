# app/services/project_service.py
# ProjectService logic. Manages project records database operations, validation constraints, and retrieval queries.

from app.models import db, Project

class ProjectService:
    @staticmethod
    def get_all_projects():
        projects = Project.query.all()
        return [project.to_dict() for project in projects]

    @staticmethod
    def get_project_by_id(project_id):
        project = db.session.get(Project, project_id)
        if not project:
            return None, "Project not found"
        return project, None

    @staticmethod
    def get_project_details(project_id):
        project = db.session.get(Project, project_id)
        if not project:
            return None, "Project not found"
        
        data = project.to_dict()
        data['blogs'] = [blog.to_dict() for blog in project.blogs]
        data['donations'] = [donation.to_dict() for donation in project.donations]
        return data, None

    @staticmethod
    def create_project(title, description, target_amount, status='active', image_url=None):
        if not title or not description:
            return None, "Title and description are required"
            
        try:
            target_amount = float(target_amount)
            if target_amount <= 0:
                return None, "Target amount must be a positive number"
        except (ValueError, TypeError):
            return None, "Target amount must be a valid number"
            
        if status not in ['active', 'completed', 'suspended']:
            return None, "Invalid status. Must be 'active', 'completed', or 'suspended'"
            
        project = Project(
            title=title,
            description=description,
            target_amount=target_amount,
            image_url=image_url,
            status=status
        )
        
        try:
            db.session.add(project)
            db.session.commit()
            return project.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def update_project(project_id, title=None, description=None, target_amount=None, status=None, image_url=None):
        project = db.session.get(Project, project_id)
        if not project:
            return None, "Project not found"

        if title:
            project.title = title
        if description:
            project.description = description
        if image_url is not None:
            project.image_url = image_url
        if target_amount is not None:
            try:
                target_amount = float(target_amount)
                if target_amount <= 0:
                    return None, "Target amount must be positive"
                project.target_amount = target_amount
            except (ValueError, TypeError):
                return None, "Target amount must be a valid number"
        if status:
            if status not in ['active', 'completed', 'suspended']:
                return None, "Invalid status"
            project.status = status

        try:
            db.session.commit()
            return project.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"

    @staticmethod
    def delete_project(project_id):
        project = db.session.get(Project, project_id)
        if not project:
            return None, "Project not found"

        try:
            db.session.delete(project)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
