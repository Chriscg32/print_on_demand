import sys
import os
# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'butterflyblue-backend'))

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()