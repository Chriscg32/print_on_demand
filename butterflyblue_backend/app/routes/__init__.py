from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configure the app
    database_url = os.environ.get("DATABASE_URL")
    logger.info(f"Using database URL: {database_url}")
    
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://")
        app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
        logger.warning("DATABASE_URL not found, using SQLite instead")
    
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    
    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    try:
        # Register blueprints
        from routes import api_bp
        app.register_blueprint(api_bp, url_prefix="/api")
        logger.info("Registered API blueprint")
    except Exception as e:
        logger.error(f"Error registering blueprint: {str(e)}")
    
    # Create a route for the root URL
    @app.route("/")
    def index():
        return "Welcome to ButterflyBlue API"
    
    # Error handler for 500 errors
    @app.errorhandler(500)
    def handle_500(error):
        logger.error(f"500 error: {str(error)}")
        return jsonify({"error": "Internal Server Error", "message": str(error)}), 500
    
    return app