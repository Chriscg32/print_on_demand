from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
import os

# Create extensions
db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Configure the app
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    if app.config['SQLALCHEMY_DATABASE_URI'].startswith('postgres://'):
        app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace('postgres://', 'postgresql://')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Import and register blueprints
    from app.routes.products import products_bp
    app.register_blueprint(products_bp, url_prefix='/api')
    
    # Create a route for the root URL
    @app.route('/')
    def index():
        return "Welcome to ButterflyBlue API"
    
    return app