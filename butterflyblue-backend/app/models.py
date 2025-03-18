from flask_login import UserMixin
from . import db  # Make sure this imports your SQLAlchemy instance

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    # Add other fields as needed

class DesignProduct(db.Model):
    __tablename__ = 'design_products'
    id = db.Column(db.Integer, primary_key=True)
    printify_product_id = db.Column(db.String(50))
    shopify_product_id = db.Column(db.String(50))
    design_data = db.Column(db.JSON)
    status = db.Column(db.String(20), default='draft')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())