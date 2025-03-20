from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app(config_class='config.Config'):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    
    db.init_app(app)
    
    from app.routes import main_blueprint
    app.register_blueprint(main_blueprint)
    
    return app
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    # CORS configuration
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
