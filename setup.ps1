

# Project structure
$directories = @("src/components", "app/routes", "scripts", "tests")
foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "Created: $dir"
    }
}

# Environment file
@"
VITE_API_URL=http://localhost:5000/api
VITE_PRINTIFY_TOKEN=your_token_here
SECRET_KEY=$((New-Guid).Guid)
DATABASE_URL=sqlite:///app.db
SHOP_ID=your_shop_id_here
"@ | Out-File .env -Encoding ASCII

Write-Host "✅ Setup complete! Run these next:"
Write-Host "1. cd src && npm install"
Write-Host "2. cd ../app && pip install -r requirements.txt"
EOF