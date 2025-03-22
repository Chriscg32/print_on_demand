# PowerShell script to install all required dependencies
Write-Host "Installing required dependencies for testing..." -ForegroundColor Cyan

# Install Babel and related packages
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/plugin-transform-runtime @babel/plugin-proposal-class-properties babel-jest

# Install testing libraries
npm install --save-dev jest-environment-jsdom identity-obj-proxy react-test-renderer

# Install jest-axe for accessibility testing
npm install --save-dev jest-axe

# Create necessary directories
if (-not (Test-Path "__mocks__")) {
    New-Item -ItemType Directory -Path "__mocks__"
}

Write-Host "All dependencies installed successfully!" -ForegroundColor Green
Write-Host "You can now run tests with: ./run-tests.ps1" -ForegroundColor Yellow