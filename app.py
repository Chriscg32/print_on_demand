from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return "Welcome to ButterflyBlue API"

@app.route('/api/products/')
def products():
    # Return some dummy data for now
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
