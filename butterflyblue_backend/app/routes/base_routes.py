from flask import Blueprint
bp = Blueprint('main', __name__)

@bp.route('/health')
def health_check():
    return {'status': 'healthy'}
