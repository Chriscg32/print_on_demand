mkdir -p butterflyblue-frontend/src/{components/Register,pages/Index}



[A[A[A[A[A[A[A[A[A[A[A[A[A[A[A[B[B[B[B[B[B[B[B[B[B[B[Bmkdir -p butterflyblue-backend/app/{routes/register,routes/index,templates}
# Register route
cat > butterflyblue-backend/app/routes/register/routes.py << EOF
from flask import Blueprint, render_template

bp = Blueprint('register', __name__)

@bp.route('/register', methods=['GET', 'POST'])
def register():
    return render_template('register.html')
EOF

# Index route
cat > butterflyblue-backend/app/routes/index/routes.py << EOF
from flask import Blueprint, render_template

bp = Blueprint('index', __name__)

@bp.route('/')
def index():
    return render_template('index.html')
EOF# register.html
cat > butterflyblue-backend/app/templates/register.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register</title>
</head>
<body>
    <h1>Registration Page</h1>
</body>
</html>
EOF

# index.html
cat > butterflyblue-backend/app/templates/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Home</title>
</head>
<body>
    <h1>Welcome</h1>
</body>
</html>
EOF# Register component
cat > butterflyblue-frontend/src/components/Register/Register.jsx << EOF
import React from 'react'

export default function Register() {
    return (
        <div>
            <h1>Registration Page</h1>
        </div>
    )
}
EOF

# Index page
cat > butterflyblue-frontend/src/pages/Index/Index.jsx << EOF
import React from 'react'

export default function Index() {
    return (
        <div>
            <h1>Home Page</h1>
        </div>
    )
}
EOF# Check directory structure
find . -type d | grep -E "routes|templates|components|pages"

# Verify file contents
cat butterflyblue-backend/app/routes/register/routes.py
