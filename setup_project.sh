#!/bin/bash

# Set project name and directories
PROJECT_NAME="print_on_demand"
PROJECT_DIR="$(pwd)/$PROJECT_NAME"
APP_DIR="$PROJECT_DIR/app"
INSTANCE_DIR="$PROJECT_DIR/instance"

# Create project structure
mkdir -p $APP_DIR
mkdir -p $INSTANCE_DIR

# Create Flask project files
FLASK_INIT_CONTENT="
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

from app import routes
"

ROUTES_CONTENT="
from flask import render_template
from app import app

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')
"

MODELS_CONTENT="
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
"

CONFIG_CONTENT="
class Config:
    SECRET_KEY = 'your_secret_key_here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
"

WSGI_CONTENT="
from app import app

if __name__ == "__main__":
    app.run(debug=True)
"

REQUIREMENTS_CONTENT="
Flask==2.0.2
Flask-SQLAlchemy==2.5.1
"

# Write the files
echo "$FLASK_INIT_CONTENT" > "$APP_DIR/__init__.py"
echo "$ROUTES_CONTENT" > "$APP_DIR/routes.py"
echo "$MODELS_CONTENT" > "$APP_DIR/models.py"
echo "$CONFIG_CONTENT" > "$INSTANCE_DIR/config.py"
echo "$WSGI_CONTENT" > "$PROJECT_DIR/wsgi.py"
echo "$REQUIREMENTS_CONTENT" > "$PROJECT_DIR/requirements.txt"

echo "Project structure created successfully."

# Initialize virtual environment and install dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r "$PROJECT_DIR/requirements.txt"

echo "Dependencies installed successfully."

# Initialize the database
python3 -c "from app import app, db; db.create_all()"
echo "Database initialized successfully."

# Run the Flask app
python3 wsgi.py
