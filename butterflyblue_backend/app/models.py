from flask_login import UserMixin
from . import db  # Assuming db is initialized in your app package

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
class DesignProduct(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    printify_product_id = db.Column(db.String(50))
    shopify_product_id = db.Column(db.String(50))
    design_data = db.Column(db.JSON)
    status = db.Column(db.String(20), default='draft')
    created_at = db.Column(db.DateTime, default=db.func.now())
    updated_at = db.Column(db.DateTime, default=db.func.now(), onupdate=db.func.now())