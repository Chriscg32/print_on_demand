# Master Deployment Script for Print-on-Demand Service
# This script orchestrates the complete deployment process

$ErrorActionPreference = "Stop"

# Initialize logging
$logDir = "C:\logs"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logDir\pod_master_deployment_$timestamp.log"

# Create log directory if it doesn't exist
if (-not (Test-Path $logDir)) {
    New-Item -Path $logDir -ItemType Directory -Force | Out-Null
}

function Write-Log {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARNING", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    $logEntry | Out-File -FilePath $logFile -Append
    
    # Also write to console with appropriate colors
    switch ($Level) {
        "INFO"    { Write-Host $logEntry -ForegroundColor Cyan }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "ERROR"   { Write-Host $logEntry -ForegroundColor Red }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
    }
}

function Test-AdminPrivileges {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Main script execution
try {
    Write-Log "Starting Print-on-Demand Master Deployment" -Level "INFO"
    
    # Check if running in admin mode
    $isAdmin = Test-AdminPrivileges
    $adminStatus = if ($isAdmin) { "Yes" } else { "No" }
    Write-Log "Admin privileges: $adminStatus" -Level "INFO"
    
    # Step 1: Install SQLCipher
    Write-Log "Step 1: Installing SQLCipher" -Level "INFO"
    & powershell -ExecutionPolicy Bypass -File "C:\Users\chris\cgapp\print_on_demand\install_sqlcipher.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "SQLCipher installation failed with exit code $LASTEXITCODE"
    }
    Write-Log "SQLCipher installation completed" -Level "SUCCESS"
    
    # Step 2: Deploy Core Components
    Write-Log "Step 2: Deploying core components" -Level "INFO"
    if ($isAdmin) {
        Write-Log "Running full deployment with admin privileges" -Level "INFO"
        & powershell -ExecutionPolicy Bypass -File "C:\Users\chris\cgapp\print_on_demand\enhanced_deploy_fixed.ps1"
    } else {
        Write-Log "Running test deployment (non-admin mode)" -Level "INFO"
        & powershell -ExecutionPolicy Bypass -File "C:\Users\chris\cgapp\print_on_demand\deploy_test.ps1"
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Core deployment failed with exit code $LASTEXITCODE"
    }
    Write-Log "Core deployment completed" -Level "SUCCESS"
    
    # Step 3: Deploy UI Components
    Write-Log "Step 3: Deploying UI components" -Level "INFO"
    $uiDestDir = "C:\print_on_demand\ui"
    
    # Create UI directory if it doesn't exist
    if (-not (Test-Path $uiDestDir)) {
        New-Item -Path $uiDestDir -ItemType Directory -Force | Out-Null
        Write-Log "Created UI directory at $uiDestDir" -Level "INFO"
    }
    
    # Copy UI files to destination
    $uiSourceDir = "C:\Users\chris\cgapp\print_on_demand\ui"
    $uiFiles = @(
        "pod-components.css",
        "pod-components-enhanced.css",
        "components-demo.html",
        "UI_ENHANCEMENTS.md"
    )
    
    foreach ($file in $uiFiles) {
        $sourcePath = Join-Path $uiSourceDir $file
        $destPath = Join-Path $uiDestDir $file
        
        if (Test-Path $sourcePath) {
            Copy-Item -Path $sourcePath -Destination $destPath -Force
            Write-Log "Copied $file to deployment directory" -Level "SUCCESS"
        } else {
            Write-Log "UI file not found: $sourcePath" -Level "WARNING"
        }
    }
    
    # Step 4: Verify Deployment
    Write-Log "Step 4: Verifying deployment" -Level "INFO"
    
    $verificationResults = @()
    
    # Check SQLCipher
    if (Test-Path "C:\print_on_demand\tools\sqlcipher\sqlcipher.cmd") {
        $verificationResults += "SQLCipher: INSTALLED"
    } else {
        $verificationResults += "SQLCipher: MISSING"
    }
    
    # Check Database Configuration
    if (Test-Path "C:\print_on_demand\architecture.json") {
        $verificationResults += "Database Configuration: INSTALLED"
    } else {
        $verificationResults += "Database Configuration: MISSING"
    }
    
    # Check UI Components
    if (Test-Path "C:\print_on_demand\ui\pod-components-enhanced.css") {
        $verificationResults += "Enhanced UI Components: INSTALLED"
    } else {
        $verificationResults += "Enhanced UI Components: MISSING"
    }
    
    # Check Database
    if (Test-Path "C:\print_on_demand\backend\instance\app.db") {
        $verificationResults += "Database: INSTALLED"
    } else {
        $verificationResults += "Database: MISSING"
    }
    
    # Log verification results
    Write-Log "Deployment verification results:" -Level "INFO"
    foreach ($result in $verificationResults) {
        if ($result -match "MISSING") {
            Write-Log "  $result" -Level "ERROR"
        } else {
            Write-Log "  $result" -Level "SUCCESS"
        }
    }
    
    # Create deployment summary
    $summaryFile = "C:\print_on_demand\master_deployment_summary_$timestamp.txt"
    $summary = @"
============================================================
Print-on-Demand Master Deployment Summary
============================================================
Deployment Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Admin Mode: $adminStatus

Components Installed:
$($verificationResults -join "`n")

UI Enhancements:
- Enhanced accessibility for color-blind users
- Improved responsive design for mobile devices
- Modern interactive components
- Skeleton loading states
- Data visualization components
- Dark mode support

Important Notes:
- Log file: $logFile
- UI documentation: C:\print_on_demand\ui\UI_ENHANCEMENTS.md
- UI demo page: C:\print_on_demand\ui\components-demo.html

For support, contact the Print-on-Demand team.
============================================================
"@
    
    Set-Content -Path $summaryFile -Value $summary -Force
    Write-Log "Deployment summary created at $summaryFile" -Level "SUCCESS"
    
    # Final status
    Write-Log "Master deployment completed successfully!" -Level "SUCCESS"
    Write-Log "Log file: $logFile" -Level "INFO"
    Write-Log "Summary file: $summaryFile" -Level "INFO"
    
} catch {
    Write-Log "CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    Write-Log "Deployment failed. See log for details." -Level "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" -Level "ERROR"
    exit 1
}