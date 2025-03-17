from flask import Flask, jsonify

# Create the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    return "Hello from ButterflyBlue API!"

@app.route('/api/products/')
def products():
    products = [
        {
            "id": 1,
            "name": "Test Product",
            "description": "A test product",
            "price": 19.99
        }
    ]
    return jsonify(products)

if __name__ == '__main__':
    app.run(debug=True)
