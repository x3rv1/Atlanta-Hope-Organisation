# seed.py
# Database seed script. Clears and populates the database with sample administrators, users, projects, blogs, supporters, donations, and calendar events.

import os
from datetime import datetime, timedelta, timezone
from app import create_app
from app.models import db, User, Project, Blog, CalendarEvent, Donation, Supporter

def seed_data():
    app = create_app('development')
    with app.app_context():
        print("Recreating database tables...")
        db.drop_all()
        db.create_all()
        
        print("Seeding Users...")
        # Approved admin
        admin = User(name="Hope Admin", email="admin@atlantahope.org", role="admin", status="approved")
        admin.set_password("admin123")
        db.session.add(admin)
        
        # Pending admin request
        pending_admin = User(name="Sarah Jenkins (Pending)", email="sarah.admin@atlantahope.org", role="admin", status="pending")
        pending_admin.set_password("admin123")
        db.session.add(pending_admin)

        # Approved normal user
        user = User(name="John Doe", email="user@atlantahope.org", role="user", status="approved")
        user.set_password("user123")
        db.session.add(user)
        
        print("Seeding Projects...")
        project1 = Project(
            title="Clean Water Initiative",
            description="Providing high-grade bio-sand filters and clean drinking water access to rural communities in Kenya and Georgia.",
            target_amount=15000.0,
            raised_amount=4500.0,
            image_url="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        project2 = Project(
            title="Youth Literacy & STEM Lab",
            description="Funding computers, books, audio-visual gear, and tutoring for youth after-school enrichment programs.",
            target_amount=8000.0,
            raised_amount=5200.0,
            image_url="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
            status="active"
        )
        project3 = Project(
            title="Community Food Drive",
            description="Providing hot nutritious meals and family emergency food packages in downtown Atlanta.",
            target_amount=5000.0,
            raised_amount=5000.0,
            image_url="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
            status="completed"
        )
        db.session.add_all([project1, project2, project3])
        db.session.commit()
        
        print("Seeding Blogs...")
        blog1 = Blog(
            title="Clean Water Reaches 500 Families",
            content="Our latest shipment of water filters arrived safely last week! Thanks to generous donor contributions, over 500 families now have access to clean, pathogen-free water. Local community champions were trained on maintaining the filtration systems.",
            excerpt="Our latest shipment of water filters arrived safely last week! Over 500 families now have access to clean water.",
            image_url="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=800&q=80",
            author="Director Marcus Vance",
            project_id=project1.id
        )
        blog2 = Blog(
            title="Literacy Lab Opens Its Doors",
            content="We officially launched the Youth Literacy & STEM Lab yesterday. Students received new laptop tablets, reading modules, and coding workbooks. Seeing the excitement on their faces was truly inspiring.",
            excerpt="Students received new laptop tablets, reading modules, and coding workbooks at our new lab facility.",
            image_url="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
            author="Elena Rostova",
            project_id=project2.id
        )
        blog3 = Blog(
            title="5,000 Hot Meals Delivered This Quarter",
            content="Thanks to our Westside volunteers and kitchen team, we hit a major milestone of delivering 5,000 warm meals to local shelter partners across Atlanta.",
            excerpt="Thanks to our volunteers, we hit a major milestone of delivering 5,000 warm meals to local shelter partners.",
            image_url="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
            author="Atlanta Hope Team",
            project_id=project3.id
        )
        db.session.add_all([blog1, blog2, blog3])

        print("Seeding Calendar Events...")
        now = datetime.now(timezone.utc)
        event1 = CalendarEvent(
            title="Annual Charity Gala & Auction",
            description="Join us for an inspiring evening celebrating our community partners, volunteers, and supporters.",
            start_time=now + timedelta(days=5, hours=18),
            end_time=now + timedelta(days=5, hours=22),
            location="Atlanta Grand Ballroom"
        )
        event2 = CalendarEvent(
            title="Westside Food Distribution Drive",
            description="Volunteers gather to unpack, pack, and distribute emergency grocery crates to local families.",
            start_time=now + timedelta(days=12, hours=9),
            end_time=now + timedelta(days=12, hours=14),
            location="Atlanta Hope Community Center"
        )
        event3 = CalendarEvent(
            title="Youth Literacy Workshop",
            description="Interactive reading circle and hands-on coding tutorial session for elementary school children.",
            start_time=now + timedelta(days=18, hours=15),
            end_time=now + timedelta(days=18, hours=17),
            location="Downtown Innovation Hub"
        )
        db.session.add_all([event1, event2, event3])
        
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
        donation1 = Donation(donor_name="Alice Smith", amount=2500.0, project_id=project1.id)
        donation2 = Donation(donor_name="Bob Jones", amount=2000.0, project_id=project1.id)
        donation3 = Donation(donor_name="Charlie Brown", amount=3200.0, project_id=project2.id)
        donation4 = Donation(donor_name="David Miller", amount=2000.0, project_id=project2.id)
        donation5 = Donation(donor_name="Grace Foundation", amount=5000.0, project_id=project3.id)
        
        db.session.add_all([donation1, donation2, donation3, donation4, donation5])
        db.session.commit()
        
        print("Database seeded successfully with all initial sample data!")

if __name__ == '__main__':
    seed_data()
