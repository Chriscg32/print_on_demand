import sys
import os

# Add the butterflyblue-backend directory to the Python path
sys.path.insert(0, os.path.abspath('butterflyblue-backend'))

from app import create_app
app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)