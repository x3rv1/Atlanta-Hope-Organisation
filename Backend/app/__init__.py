# app/__init__.py
# App factory setup. Initializes extensions (DB, migrations, JWT, CORS) and registers routes blueprints.

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from app.config import config_by_name
from app.models import db

migrate = Migrate()
jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configure CORS to allow React frontend requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    jwt.init_app(app)
    
    # Import and register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.projects import projects_bp
    from app.routes.donations import donations_bp
    from app.routes.supporters import supporters_bp
    from app.routes.payments import payments_bp
    from app.routes.blogs import blogs_bp
    from app.routes.calendar import calendar_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(donations_bp, url_prefix='/api/donations')
    app.register_blueprint(supporters_bp, url_prefix='/api/supporters')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(blogs_bp, url_prefix='/api/blogs')
    app.register_blueprint(calendar_bp, url_prefix='/api/calendar')
    
    @app.route('/')
    def home_api():
        return {
            "message": "Atlanta Hope Organisation API is running successfully.",
            "frontend_url": "http://localhost:5173",
            "status": "online"
        }, 200
        
    return app
