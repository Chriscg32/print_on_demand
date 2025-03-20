from flask_app.models.user import User

__all__ = ['User']
# butterflyblue_backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    db.init_app(app)
    
    with app.app_context():
        from .routes import api_bp
        app.register_blueprint(api_bp)
        
    return app
