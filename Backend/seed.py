# seed.py
# Database seed script. Clears and populates the database with sample administrators, projects, supporters, and donations.

import os
from app import create_app
from app.models import db, User, Project, Donation, Supporter

def seed_data():
    app = create_app('development')
    with app.app_context():
        print("Recreating database tables...")
        db.drop_all()
        db.create_all()
        
        print("Seeding Users...")
        # Create admin
        admin = User(name="Hope Admin", email="admin@atlantahope.org", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        
        # Create user
        user = User(name="John Doe", email="user@atlantahope.org", role="user")
        user.set_password("user123")
        db.session.add(user)
        
        print("Seeding Projects...")
        project1 = Project(
            title="Clean Water Initiative",
            description="Providing filters and clean water access to rural communities in Kenya.",
            target_amount=15000.0,
            raised_amount=4500.0,
            status="active"
        )
        project2 = Project(
            title="Sunday School Supplies",
            description="Funding books, audio-visual gear, and crafts for the youth bible study program.",
            target_amount=3000.0,
            raised_amount=1200.0,
            status="active"
        )
        project3 = Project(
            title="Community Food Drive",
            description="Feeding local homeless families in downtown Atlanta.",
            target_amount=5000.0,
            raised_amount=5000.0,
            status="completed"
        )
        db.session.add_all([project1, project2, project3])
        # Commit projects to populate IDs
        db.session.commit()
        
        print("Seeding Supporters...")
        supporter1 = Supporter(
            company_name="Faith Builders Inc.",
            logo_url="https://images.unsplash.com/photo-1599305445671-ac291c95aba9?auto=format&fit=crop&q=80&w=200",
            contribution_description="Provided heavy timber materials and construction logistics support for projects."
        )
        supporter2 = Supporter(
            company_name="Hope Builders",
            logo_url="https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=200",
            contribution_description="Corporate matched donation partner matching all youth program contributions."
        )
        supporter3 = Supporter(
            company_name="Grace Foundation",
            logo_url="https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&q=80&w=200",
            contribution_description="Generous donor supporting all international water purification initiatives."
        )
        db.session.add_all([supporter1, supporter2, supporter3])
        
        print("Seeding Donations...")
        # Add donations to project1
        donation1 = Donation(donor_name="Alice Smith", amount=2500.0, project_id=project1.id)
        donation2 = Donation(donor_name="Bob Jones", amount=2000.0, project_id=project1.id)
        # Add donations to project2
        donation3 = Donation(donor_name="Charlie Brown", amount=1200.0, project_id=project2.id)
        # Add donations to project3
        donation4 = Donation(donor_name="Grace Foundation", amount=5000.0, project_id=project3.id)
        
        db.session.add_all([donation1, donation2, donation3, donation4])
        db.session.commit()
        
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()
