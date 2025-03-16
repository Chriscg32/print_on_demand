from flask import jsonify
from app import app  # Make sure your app is properly initialized

@app.route('/')
def index():
    return jsonify({"status": "API is running"})

@app.route('/healthcheck')
def healthcheck():
    return jsonify({"status": "healthy"})