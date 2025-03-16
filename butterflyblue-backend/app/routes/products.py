from flask import Blueprint, jsonify, request
from app.models import Product
from app import db

products_bp = Blueprint('products', __name__)

@products_bp.route('/products/', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])

@products_bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict())