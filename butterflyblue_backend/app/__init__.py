# butterflyblue-backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from config import Config

# Initialize extensions
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    Migrate(app, db)
    
    # Import routes after db initialization
    from app.routes.products import products_bp
    app.register_blueprint(products_bp)
    
    return app
