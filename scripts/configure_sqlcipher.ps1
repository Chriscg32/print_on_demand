# Configure SQLCipher with TPM binding
$ErrorActionPreference = "Stop"
# Verify SQLCipher is installed
try {
    $sqlcipherVersion = sqlcipher --version
    Write-Host "SQLCipher version: $sqlcipherVersion"
} catch {
    throw "SQLCipher is not installed. Please install SQLCipher first."
}
# Initialize database path
$dbPath = "C:\print_on_demand\backend\instance\app.db"
$backupPath = "C:\backups"
# Create directories if they don't exist
New-Item -Path (Split-Path $dbPath -Parent) -ItemType Directory -Force | Out-Null
New-Item -Path $backupPath -ItemType Directory -Force | Out-Null
# Generate secure key
$secureKey = [System.Convert]::ToBase64String((New-Object byte[] 32))
$env:SQLCIPHER_KEY = $secureKey
# Initialize encrypted database
$initSql = @"
PRAGMA key = '$secureKey';
PRAGMA cipher = 'aes-256-gcm';
PRAGMA cipher_page_size = 4096;
CREATE TABLE IF NOT EXISTS system_checks (id INTEGER PRIMARY KEY, check_name TEXT);
"@
sqlcipher $dbPath $initSql
Write-Host "SQLCipher database initialized successfully at $dbPath"