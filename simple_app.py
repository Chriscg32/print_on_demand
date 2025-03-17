from flask import Flask, jsonify, send_from_directory

# Create the Flask application
app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

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
