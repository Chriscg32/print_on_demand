import sys
import os

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'butterflyblue-backend'))

from app import create_app, db

app = create_app()

with app.app_context():
    # Create all tables
    db.create_all()
    
    # Print confirmation
    print("Database tables created successfully!")
    
    # Import models after creating tables
    from app.models import Product
    
    # Add a test product
    test_product = Product(
        name='Test Product',
        price=19.99,
        description='A test product'
    )
    
    # Add and commit
    db.session.add(test_product)
    db.session.commit()
    
    print("Test product added successfully!")
