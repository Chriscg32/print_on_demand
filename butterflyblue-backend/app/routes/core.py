from flask import Blueprint
bp = Blueprint("core", __name__)

@bp.route("/")
def home():
    return {"message": "Welcome to ButterflyBlue API"}

@bp.route("/health")
def health_check():
    return {"status": "healthy"}
