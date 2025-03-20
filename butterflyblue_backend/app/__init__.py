# app/__init__.py
from flask import Flask
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///instance/app.db'
    
    # Initialize extensions
    from .models import db  # Create this file if missing
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Register blueprints/routes
    from .routes import bp
    app.register_blueprint(bp)
    
    return app