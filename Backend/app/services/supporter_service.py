# app/services/supporter_service.py
# SupporterService logic. Manages fetching organization supporters and recording new sponsor companies.

from app.models import db, Supporter

class SupporterService:
    @staticmethod
    def get_all_supporters():
        supporters = Supporter.query.all()
        return [supporter.to_dict() for supporter in supporters]

    @staticmethod
    def create_supporter(company_name, logo_url, contribution_description):
        if not company_name or not logo_url or not contribution_description:
            return None, "All fields (company_name, logo_url, contribution_description) are required"
            
        supporter = Supporter(
            company_name=company_name,
            logo_url=logo_url,
            contribution_description=contribution_description
        )
        
        try:
            db.session.add(supporter)
            db.session.commit()
            return supporter.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Database error: {str(e)}"
