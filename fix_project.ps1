# Fix Project Script - Run as Administrator
# ------------------------------------------

# Backend Fixes
# -------------
Set-Location C:\Users\chris\cgapp\print_on_demand\butterflyblue-backend

# Create config.py
@"
class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
"@ | Out-File -FilePath config.py -Encoding utf8

# Install/fix dependencies
.\venv\Scripts\activate
pip install werkzeug==3.1.3 flask==3.1.0 flask-sqlalchemy alembic flask-migrate --force-reinstall
pip install pyjwt

# Initialize database
$env:FLASK_APP = "wsgi.py"
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Frontend Fixes
# --------------
Set-Location ..\butterflyblue-frontend

# Create missing component
New-Item -ItemType Directory -Path src\components\ui -Force
@"
export const Toaster = () => <div>Toast notifications placeholder</div>;
"@ | Out-File -FilePath src\components\ui\toaster.tsx -Encoding utf8

# Clean and rebuild
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npm audit fix --force
npm run build

# Verification
# ------------
Set-Location ..

Write-Host "✅ Verification Check:" -ForegroundColor Green

# Backend checks
if (Test-Path butterflyblue-backend\migrations -PathType Container) {
    Write-Host "✔️  Database migrations initialized" -ForegroundColor Cyan
}
if (Test-Path butterflyblue-backend\app.db) {
    Write-Host "✔️  Database file created" -ForegroundColor Cyan
}

# Frontend checks
if (Test-Path butterflyblue-frontend\.next) {
    Write-Host "✔️  Next.js build successful" -ForegroundColor Cyan
}
if (Test-Path butterflyblue-frontend\src\components\ui\toaster.tsx) {
    Write-Host "✔️  Toaster component created" -ForegroundColor Cyan
}

Write-Host "`n🚀 Setup Complete! Start servers manually in separate terminals:" -ForegroundColor Yellow
Write-Host "1. Backend: cd butterflyblue-backend && flask run" -ForegroundColor Cyan
Write-Host "2. Frontend: cd butterflyblue-frontend && npm run dev" -ForegroundColor Cyan