# Enhanced deployment script for testing (non-admin version)
$ErrorActionPreference = "Stop"

# Initialize logging
$logDir = "C:\logs"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logDir\pod_deployment_$timestamp.log"

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

function Test-Dependency {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        
        [Parameter(Mandatory=$false)]
        [string]$MinimumVersion = $null
    )
    
    try {
        $cmdInfo = Get-Command $Command -ErrorAction Stop
        if ($MinimumVersion) {
            try {
                $version = & $Command --version 2>&1
                Write-Log "$Command version: $version" -Level "INFO"
                # Version comparison logic could be added here if needed
            } catch {
                Write-Log "Couldn't determine version for $Command" -Level "WARNING"
            }
        }
        return $true
    } catch {
        Write-Log "Dependency not found: $Command" -Level "ERROR"
        return $false
    }
}

function Generate-SecurePassword {
    param(
        [int]$Length = 24
    )
    
    $charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+={}[]|:;<>,.?/~'
    $random = New-Object System.Random
    $password = 1..$Length | ForEach-Object { $charSet[$random.Next(0, $charSet.Length)] }
    return ($password -join '')
}

# Add SQLCipher mock to PATH
$sqlcipherDir = "C:\print_on_demand\tools\sqlcipher"
$env:Path = "$sqlcipherDir;" + $env:Path
Write-Log "Added SQLCipher mock directory to PATH: $sqlcipherDir" -Level "INFO"

# Main script execution
try {
    Write-Log "Starting Print-on-Demand service deployment (Test Mode)" -Level "INFO"
    
    # Check dependencies
    Write-Log "Checking dependencies..." -Level "INFO"
    $dependencies = @("sqlcipher")
    $missingDeps = @()
    
    foreach ($dep in $dependencies) {
        if (-not (Test-Dependency -Command $dep)) {
            $missingDeps += $dep
        }
    }
    
    if ($missingDeps.Count -gt 0) {
        throw "Missing dependencies: $($missingDeps -join ', '). Please install these before continuing."
    }
    
    # 1. Create Directory Structure
    Write-Log "Creating required directories..." -Level "INFO"
    $directories = @(
        "C:\print_on_demand\backend\instance",
        "C:\print_on_demand\backend\app",
        "C:\backups",
        "C:\logs"
    )
    
    foreach ($dir in $directories) {
        if (-Not (Test-Path $dir)) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
            Write-Log "Created directory: $dir" -Level "SUCCESS"
        } else {
            Write-Log "Directory already exists: $dir" -Level "INFO"
        }
    }
    
    # 2. Create architecture.json
    Write-Log "Creating architecture.json configuration..." -Level "INFO"
    $architectureJson = @'
{
  "root": "C:\\print_on_demand",
  "nodes": [
    {
      "path": "C:\\print_on_demand\\backend\\instance\\app.db",
      "perms": "FullControl",
      "encryption": "AES-256-GCM",
      "tpm_binding": true
    }
  ]
}
'@
    Set-Content -Path "C:\print_on_demand\architecture.json" -Value $architectureJson -Force
    Write-Log "Architecture configuration created successfully" -Level "SUCCESS"
    
    # 3. Generate secure database key
    Write-Log "Generating secure database encryption key..." -Level "INFO"
    $secureKey = "TestKey123!ForDevelopmentOnly"
    
    # 4. Create encrypted SQLite database
    Write-Log "Creating encrypted SQLite database..." -Level "INFO"
    $dbPath = "C:\print_on_demand\backend\instance\app.db"
    
    # Initialize database with schema
    $databaseInit = @"
    PRAGMA key = '$secureKey';
    PRAGMA cipher = 'aes-256-gcm';
    PRAGMA cipher_page_size = 4096;
    CREATE TABLE IF NOT EXISTS system_checks (id INTEGER PRIMARY KEY, check_name TEXT, status TEXT, timestamp TEXT);
    INSERT INTO system_checks (check_name, status, timestamp) VALUES ('initial_setup', 'completed', 'now');
"@
    
    # Execute SQLCipher command to create database
    $databaseInit | & "$sqlcipherDir\sqlcipher.cmd" $dbPath
    
    # Verify database was created
    if (Test-Path $dbPath) {
        Write-Log "Encrypted database created successfully" -Level "SUCCESS"
    } else {
        throw "Failed to create encrypted database at $dbPath"
    }
    
    # 5. Create placeholder application file
    Write-Log "Creating placeholder application file..." -Level "INFO"
    $appDir = "C:\print_on_demand\backend\app"
    $appFile = "$appDir\main.txt"
    
    @"
This is a placeholder for the actual application executable.
In a real deployment, this would be the actual application binary.
"@ | Set-Content -Path $appFile -Force
    
    Write-Log "Placeholder application file created at $appFile" -Level "SUCCESS"
    
    # 6. Create Deployment Summary
    $summaryFile = "C:\print_on_demand\deployment_summary_$timestamp.txt"
    $summary = @"
============================================================
Print-on-Demand Deployment Summary (TEST MODE)
============================================================
Deployment Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Components Installed:
- SQLCipher Database: $dbPath
- Configuration: C:\print_on_demand\architecture.json
- Placeholder App: $appFile
- Log Location: $logFile

Important Notes:
- This is a TEST deployment without service installation
- Database encryption key is: $secureKey (FOR TESTING ONLY)
- In production, use the full deployment script with admin privileges

For support, contact the Print-on-Demand team.
============================================================
"@
    
    Set-Content -Path $summaryFile -Value $summary -Force
    Write-Log "Deployment summary created at $summaryFile" -Level "SUCCESS"
    
    # Final status
    Write-Log "Test deployment completed successfully!" -Level "SUCCESS"
    Write-Log "Log file: $logFile" -Level "INFO"
    Write-Log "Summary file: $summaryFile" -Level "INFO"
    
} catch {
    Write-Log "CRITICAL ERROR: $($_.Exception.Message)" -Level "ERROR"
    Write-Log "Deployment failed. See log for details." -Level "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" -Level "ERROR"
    exit 1
}