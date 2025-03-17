from flask import Blueprint, jsonify

routes_bp = Blueprint('routes', __name__)

@routes_bp.route('/')
def index():
    return "Welcome to ButterflyBlue API"

@routes_bp.route('/api/products/')
def get_products():
    products = [
        {
            "id": 1,
            "name": "Test Product",
            "description": "A test product",
            "price": 19.99
        }
    ]
    return jsonify(products)
