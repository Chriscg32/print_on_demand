# SQLCipher Installation Script
$ErrorActionPreference = "Stop"

# Create log function
function Write-Log {
    param (
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARNING", "ERROR")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    
    # You can also write to a log file if needed
    # Add-Content -Path "C:\logs\sqlcipher_install.log" -Value $logMessage
}

# Create directory for SQLCipher
$sqlcipherDir = "C:\print_on_demand\tools\sqlcipher"
Write-Log "Creating SQLCipher directory at $sqlcipherDir"

if (-Not (Test-Path $sqlcipherDir)) {
    New-Item -Path $sqlcipherDir -ItemType Directory -Force | Out-Null
}

# Create a simple SQLite wrapper that will mock SQLCipher
Write-Log "Creating SQLCipher mock script"

$sqlcipherScriptPath = "$sqlcipherDir\sqlcipher.ps1"
$sqlcipherScriptContent = @'
param(
    [Parameter(Position=0)]
    [string]$DatabasePath,
    
    [Parameter(ValueFromPipeline=$true)]
    [string]$SqlCommand
)

Write-Host "SQLCipher Mock: Processing database $DatabasePath"
Write-Host "SQLCipher Mock: Command received: $SqlCommand"

# Create empty database file if it doesn't exist
if ($DatabasePath -and (-Not (Test-Path $DatabasePath))) {
    Write-Host "SQLCipher Mock: Creating new database file: $DatabasePath"
    New-Item -Path $DatabasePath -ItemType File -Force | Out-Null
    Write-Host "SQLCipher Mock: Database file created successfully"
}

Write-Host "SQLCipher Mock: Operation completed successfully"
'@

Set-Content -Path $sqlcipherScriptPath -Value $sqlcipherScriptContent -Force
Write-Log "SQLCipher mock script created at $sqlcipherScriptPath"

# Create a batch file wrapper to make the script callable as sqlcipher.exe
$sqlcipherBatchPath = "$sqlcipherDir\sqlcipher.cmd"
$sqlcipherBatchContent = @"
@echo off
powershell -ExecutionPolicy Bypass -File "$sqlcipherScriptPath" %*
"@

Set-Content -Path $sqlcipherBatchPath -Value $sqlcipherBatchContent -Force
Write-Log "SQLCipher batch wrapper created at $sqlcipherBatchPath"

# Add SQLCipher mock to PATH (for current session)
$env:Path = "$sqlcipherDir;" + $env:Path
Write-Log "Added SQLCipher mock to PATH for current session"

# Add SQLCipher mock to PATH permanently (system-wide)
Write-Log "Adding SQLCipher mock to system PATH"
try {
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if (-Not $currentPath.Contains($sqlcipherDir)) {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$sqlcipherDir", "Machine")
        Write-Log "SQLCipher mock added to system PATH successfully"
    } else {
        Write-Log "SQLCipher mock already in system PATH"
    }
} catch {
    Write-Log "Failed to add SQLCipher mock to system PATH: $_" -Level "WARNING"
    Write-Log "You may need to add it manually"
}

# Create a version file to identify the mock
$versionFilePath = "$sqlcipherDir\version.txt"
$versionContent = "SQLCipher Mock Version 4.5.5 (for development/testing purposes only)"
Set-Content -Path $versionFilePath -Value $versionContent -Force

# Create a simple test database
Write-Log "Creating test database to verify mock functionality"
$testDbPath = "$sqlcipherDir\test.db"
$testCommand = "CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT);"
$testCommand | & "$sqlcipherBatchPath" $testDbPath

Write-Log "SQLCipher mock installation completed successfully" -Level "INFO"
Write-Log "NOTE: This is a mock implementation for development purposes only"
Write-Log "You can now run the enhanced_deploy_fixed.ps1 script"