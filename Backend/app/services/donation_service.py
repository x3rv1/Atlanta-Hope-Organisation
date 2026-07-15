# app/services/donation_service.py
# DonationService logic. Handles recording donations, mapping projects, and dynamically incrementing project raised amounts.

from app.models import db, Donation, Project
from app.services.project_service import ProjectService

class DonationService:
    @staticmethod
    def get_all_donations():
        donations = Donation.query.all()
        return [donation.to_dict() for donation in donations]

    @staticmethod
    def create_donation(donor_name, amount, project_id):
        if not donor_name:
            return None, "Donor name is required"
            
        try:
            amount = float(amount)
            if amount <= 0:
                return None, "Donation amount must be a positive number"
        except (ValueError, TypeError):
            return None, "Donation amount must be a valid number"
            
        # Get and validate project
        project, err = ProjectService.get_project_by_id(project_id)
        if err:
            return None, err
            
        if project.status != 'active':
            return None, f"Cannot donate to this project because its status is '{project.status}'"
            
        # Register the donation
        donation = Donation(
            donor_name=donor_name,
            amount=amount,
            project_id=project_id
        )
        
        # Increment raised amount
        project.raised_amount += amount
        
        try:
            db.session.add(donation)
            db.session.commit()
            return donation.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
