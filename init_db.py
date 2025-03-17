import sys
import os
import time

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from models import Product

# Wait for PostgreSQL to be ready
time.sleep(2)

app = create_app()

with app.app_context():
    # Drop all tables first to avoid conflicts
    db.drop_all()
    
    # Create all tables
    db.create_all()
    
    print("Database tables created successfully!")
    
    # Add a test product
    test_product = Product(
        name="Test Product",
        price=19.99,
        description="A test product"
    )
    
    # Add and commit
    db.session.add(test_product)
    db.session.commit()
    
    print("Test product added successfully!")
