# butterflyblue-backend/app/routes/products.py
from flask import Blueprint, jsonify, request
from app.models import Product
from app import db
from app.middleware.auth import token_required

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])

@products_bp.route('/', methods=['POST'])
@token_required
def create_product(current_user):
    if not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    data = request.get_json()
    product = Product(
        name=data['name'],
        price=data['price'],
        description=data.get('description', '')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201