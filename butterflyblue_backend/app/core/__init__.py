from flask import Flask
from flask_migrate import Migrate
from app.core import db

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    
    # Initialize extensions FIRST
    db.init_app(app)
    migrate = Migrate(app, db)  # Required for 'flask db' commands
    
    # Import routes AFTER initialization
    with app.app_context():
        from app.routes.base_routes import bp  # Corrected import path
        app.register_blueprint(bp)
    
    return app