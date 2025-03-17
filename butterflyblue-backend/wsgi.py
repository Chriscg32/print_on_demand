import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add project directories to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Create the Flask app
    from app import create_app
    app = create_app()
    logger.info("Flask app created successfully")
except Exception as e:
    logger.error(f"Error creating Flask app: {str(e)}")
    raise

if __name__ == "__main__":
    app.run()