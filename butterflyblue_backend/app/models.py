from flask_login import UserMixin
from . import db  # Assuming db is initialized in your app package

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    # Add other fields as needed

class DesignProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Add your existing design product fields here