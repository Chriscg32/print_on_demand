# Define the base directory
$baseDir = "C:\Users\chris\cgapp\print_on_demand"

# Function to run commands in a directory
function Run-InDirectory {
    param (
        [string]$directory,
        [string]$command
    )
    Push-Location $directory
    Invoke-Expression $command
    Pop-Location
}

# Prepare backend
$backendDir = Join-Path $baseDir "butterflyblue_backend"
Write-Host "Preparing backend..."
if (Test-Path (Join-Path $backendDir "requirements.txt")) {
    Run-InDirectory $backendDir "pip install -r requirements.txt"
} else {
    Write-Host "Error: requirements.txt not found in $backendDir. Please create it."
}
Run-InDirectory $backendDir "pytest"  # Run tests
Run-InDirectory $backendDir "flake8 ."  # Lint code

# Prepare frontend
$frontendDir = Join-Path $baseDir "POD-2024-06"
Write-Host "Preparing frontend..."
Run-InDirectory $frontendDir "npm install"  # Install dependencies
Run-InDirectory $frontendDir "npm test"  # Run tests
Run-InDirectory $frontendDir "npm run lint"  # Lint code
Run-InDirectory $frontendDir "npm run build"  # Build frontend

Write-Host "Deployment readiness tasks completed."