import sys
import os

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, 'butterflyblue-backend')

from app import create_app, db
from app.models import Product

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    
    # Add a test product
    test_product = Product(
        name='Test Product',
        price=19.99,
        description='A test product'
    )
    db.session.add(test_product)
    db.session.commit()
    
    print("Database initialized with test product")
