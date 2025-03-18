# butterflyblue-backend/app/models.py
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    # Add other fields as needed

class DesignProduct(db.Model):
    # Keep your existing design product fields