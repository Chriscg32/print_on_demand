# Check API and Service Status
function Check-ServiceStatus {
    param (
        [string]$serviceName,
        [int]$expectedPort
    )
  
    # Check if service is running
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq 'Running') {
        Write-Host "$serviceName is running."
    } else {
        Write-Error "$serviceName is not running."
        return
    }
  
    # Test API endpoint
    $response = Test-NetConnection -ComputerName 'localhost' -Port $expectedPort
    if ($response.TcpTestSucceeded) {
        Write-Host "API endpoint is accessible on port $expectedPort."
    } else {
        Write-Error "API endpoint is not accessible on port $expectedPort."
    }
}

# Example usage
Check-ServiceStatus -serviceName "YourWebService" -expectedPort 443