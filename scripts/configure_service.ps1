# Script to configure the Print-on-Demand Cryptographic Service
# Requires administrative privileges to run

# Error handling
$ErrorActionPreference = "Stop"
$logFile = "C:\logs\pod_service_setup.log"

# Create log directory if it doesn't exist
if (-not (Test-Path "C:\logs")) {
    New-Item -Path "C:\logs" -ItemType Directory -Force | Out-Null
}

function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logFile -Append
    Write-Host $message
}

try {
    Write-Log "Starting service configuration..."
    
    # Check for administrative privileges
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        throw "This script requires administrative privileges. Please run as administrator."
    }
    
    # Create Restricted Service Account
    Write-Log "Creating service account 'POD-SvcAcct'..."
    if (-not (Get-LocalUser -Name "POD-SvcAcct" -ErrorAction SilentlyContinue)) {
        New-LocalUser -Name "POD-SvcAcct" -NoPassword -UserMayNotChangePassword -AccountNeverExpires
        Set-LocalUser -Name "POD-SvcAcct" -PasswordNeverExpires $true
        Write-Log "Service account created successfully."
    } else {
        Write-Log "Service account already exists. Updating settings..."
        Set-LocalUser -Name "POD-SvcAcct" -PasswordNeverExpires $true -UserMayNotChangePassword $true -AccountNeverExpires $true
    }
    
    # Add to appropriate groups
    Write-Log "Adding service account to required groups..."
    Add-LocalGroupMember -Group "Performance Log Users" -Member "POD-SvcAcct" -ErrorAction SilentlyContinue
    
    # Verify application path exists
    $appPath = "C:\app\main.exe"
    if (-not (Test-Path $appPath)) {
        Write-Log "WARNING: Application path $appPath does not exist. Service may fail to start."
    }
    
    # Check if service already exists
    if (Get-Service -Name "POD-CryptoService" -ErrorAction SilentlyContinue) {
        Write-Log "Service already exists. Stopping and removing..."
        Stop-Service -Name "POD-CryptoService" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Remove-Service -Name "POD-CryptoService" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Secure Service Installation
    Write-Log "Installing service..."
    $serviceParams = @{
        Name = "POD-CryptoService"
        BinaryPathName = "$appPath --tpm-protected"
        Credential = (Get-Credential -UserName "POD-SvcAcct" -Message "Enter service account password")
        StartupType = "Automatic"
        DisplayName = "Print-on-Demand Cryptographic Service"
        Description = "Handles cryptographic operations for the Print-on-Demand system with TPM protection"
    }
    New-Service @serviceParams
    
    # Set additional service properties
    Write-Log "Configuring service recovery options..."
    $service = Get-WmiObject -Class Win32_Service -Filter "Name='POD-CryptoService'"
    $service.Change($null, $null, $null, $null, $null, $null, $null, $null, $null, $null, $null)
    
    # Configure service recovery options
    sc.exe failure "POD-CryptoService" reset= 86400 actions= restart/60000/restart/60000/restart/60000
    
    # Set service permissions
    Write-Log "Setting service permissions..."
    $sddl = "D:(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)(A;;CR;;;AU)(A;;CCLCSWRPWPDTLOCRRC;;;PU)"
    sc.exe sdset "POD-CryptoService" $sddl
    
    # Start the service
    Write-Log "Starting service..."
    Start-Service -Name "POD-CryptoService"
    
    # Verify service is running
    $serviceStatus = Get-Service -Name "POD-CryptoService"
    if ($serviceStatus.Status -eq "Running") {
        Write-Log "Service successfully installed and started."
    } else {
        Write-Log "WARNING: Service installed but not running. Status: $($serviceStatus.Status)"
    }
    
    Write-Log "Service configuration completed successfully."
} catch {
    Write-Log "ERROR: $($_.Exception.Message)"
    Write-Log "Service configuration failed."
    exit 1
}
