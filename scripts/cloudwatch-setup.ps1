# Install AWS CLI
winget install -e --id Amazon.AWSCLI

# Configure CloudWatch logs using environment variables
$env:AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY"
$env:AWS_SECRET_ACCESS_KEY="YOUR_SECRET_KEY" 
$env:AWS_DEFAULT_REGION="your-region"

# Inform user about the environment variable configuration
Write-Host "AWS credentials configured via environment variables for this session"
