cat > butterflyblue-backend/app/middleware/auth.py << 'EOL'
from functools import wraps
from flask import request, jsonify
import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
from app.config import Config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token missing'}), 401
            
        try:
            payload = jwt.decode(
                token, 
                Config.SECRET_KEY, 
                algorithms=["HS256"],
                options={"require_sub": True}
            )
            user_id = payload['sub']
        except ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 401
            
        return f(user_id, *args, **kwargs)
    
    return decorated
EOL

# Format and verify
black butterflyblue-backend/app/middleware/auth.py
python -m py_compile butterflyblue-backend/app/middleware/auth.py