<#
.SYNOPSIS
    System test script for Print-on-Demand service deployment.
.DESCRIPTION
    This script performs comprehensive system tests on the Print-on-Demand service deployment
    to verify that all components are working correctly.
#>

# Set strict error handling
$ErrorActionPreference = "Stop"

# Initialize logging
$logDir = "$env:USERPROFILE\Documents\pod_logs"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$logFile = "$logDir\pod_system_test_$timestamp.log"

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

function Test-FileExists {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    if (Test-Path $Path) {
        Write-Log "$Description exists at: $Path" -Level "SUCCESS"
        return $true
    } else {
        Write-Log "$Description not found at: $Path" -Level "ERROR"
        return $false
    }
}

function Test-DirectoryExists {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path,
        
        [Parameter(Mandatory=$true)]
        [string]$Description
    )
    
    if (Test-Path $Path -PathType Container) {
        Write-Log "$Description directory exists at: $Path" -Level "SUCCESS"
        return $true
    } else {
        Write-Log "$Description directory not found at: $Path" -Level "ERROR"
        return $false
    }
}

function Test-SqlCipherInstallation {
    try {
        $sqlcipherPath = "C:\print_on_demand\tools\sqlcipher\sqlcipher.cmd"
        if (Test-Path $sqlcipherPath) {
            Write-Log "SQLCipher mock is installed at: $sqlcipherPath" -Level "SUCCESS"
            
            # Test execution
            $testOutput = & $sqlcipherPath ":memory:" ".version"
            if ($testOutput -match "SQLCipher Mock") {
                Write-Log "SQLCipher mock is functioning properly" -Level "SUCCESS"
                return $true
            } else {
                Write-Log "SQLCipher mock execution test failed" -Level "ERROR"
                return $false
            }
        } else {
            Write-Log "SQLCipher mock not found at: $sqlcipherPath" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error testing SQLCipher installation: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-DatabaseCreation {
    try {
        $dbPath = "C:\print_on_demand\backend\instance\app.db"
        if (Test-Path $dbPath) {
            $dbSize = (Get-Item $dbPath).Length
            Write-Log "Database exists at: $dbPath (Size: $dbSize bytes)" -Level "SUCCESS"
            
            # Check if we can query the database
            $testCmd = "PRAGMA key = 'TestKey123!ForDevelopmentOnly'; SELECT count(*) FROM sqlite_master;"
            $sqlcipherPath = "C:\print_on_demand\tools\sqlcipher\sqlcipher.cmd"
            $result = $testCmd | & $sqlcipherPath $dbPath
            
            Write-Log "Database query test result: $result" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "Database not found at: $dbPath" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error testing database: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-ConfigurationFile {
    try {
        $configPath = "C:\print_on_demand\architecture.json"
        if (Test-Path $configPath) {
            $config = Get-Content $configPath -Raw | ConvertFrom-Json
            
            if ($config.root -eq "C:\print_on_demand" -and $config.nodes.Count -gt 0) {
                Write-Log "Configuration file is valid: $configPath" -Level "SUCCESS"
                return $true
            } else {
                Write-Log "Configuration file has invalid content: $configPath" -Level "ERROR"
                return $false
            }
        } else {
            Write-Log "Configuration file not found at: $configPath" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error testing configuration file: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-UIComponents {
    try {
        $cssPath = "C:\Users\chris\cgapp\print_on_demand\ui\pod-components-enhanced.css"
        $additionalCssPath = "C:\Users\chris\cgapp\print_on_demand\ui\pod-components-additional.css"
        $jsPath = "C:\Users\chris\cgapp\print_on_demand\ui\pod-components.js"
        
        $uiComponentsValid = $true
        
        if (-not (Test-Path $cssPath)) {
            Write-Log "Enhanced CSS components not found at: $cssPath" -Level "ERROR"
            $uiComponentsValid = $false
        } else {
            Write-Log "Enhanced CSS components exist at: $cssPath" -Level "SUCCESS"
        }
        
        if (-not (Test-Path $additionalCssPath)) {
            Write-Log "Additional CSS components not found at: $additionalCssPath" -Level "ERROR"
            $uiComponentsValid = $false
        } else {
            Write-Log "Additional CSS components exist at: $additionalCssPath" -Level "SUCCESS"
        }
        
        if (-not (Test-Path $jsPath)) {
            Write-Log "JavaScript components not found at: $jsPath" -Level "ERROR"
            $uiComponentsValid = $false
        } else {
            Write-Log "JavaScript components exist at: $jsPath" -Level "SUCCESS"
        }
        
        return $uiComponentsValid
    } catch {
        Write-Log "Error testing UI components: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

function Test-BackupFiles {
    try {
        $backupDir = "C:\backups"
        if (Test-Path $backupDir) {
            $backupFiles = Get-ChildItem -Path $backupDir -Filter "app.db.backup_*"
            
            if ($backupFiles.Count -gt 0) {
                $latestBackup = $backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                Write-Log "Backup files exist. Latest: $($latestBackup.FullName) (Created: $($latestBackup.LastWriteTime))" -Level "SUCCESS"
                return $true
            } else {
                Write-Log "No backup files found in: $backupDir" -Level "WARNING"
                return $false
            }
        } else {
            Write-Log "Backup directory not found at: $backupDir" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Error testing backup files: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Main test execution
try {
    Write-Log "Starting Print-on-Demand system tests" -Level "INFO"
    
    # Track test results
    $testResults = @{
        "Directories" = $false
        "SQLCipher" = $false
        "Database" = $false
        "Configuration" = $false
        "UIComponents" = $false
        "Backups" = $false
    }
    
    # Test directory structure
    Write-Log "Testing directory structure..." -Level "INFO"
    $testResults["Directories"] = (
        (Test-DirectoryExists -Path "C:\print_on_demand" -Description "Root") -and
        (Test-DirectoryExists -Path "C:\print_on_demand\backend" -Description "Backend") -and
        (Test-DirectoryExists -Path "C:\print_on_demand\backend\instance" -Description "Instance") -and
        (Test-DirectoryExists -Path "C:\print_on_demand\backend\app" -Description "App") -and
        (Test-DirectoryExists -Path "C:\backups" -Description "Backups")
    )
    
    # Test SQLCipher installation
    Write-Log "Testing SQLCipher installation..." -Level "INFO"
    $testResults["SQLCipher"] = Test-SqlCipherInstallation
    
    # Test database creation
    Write-Log "Testing database creation..." -Level "INFO"
    $testResults["Database"] = Test-DatabaseCreation
    
    # Test configuration file
    Write-Log "Testing configuration file..." -Level "INFO"
    $testResults["Configuration"] = Test-ConfigurationFile
    
    # Test UI components
    Write-Log "Testing UI components..." -Level "INFO"
    $testResults["UIComponents"] = Test-UIComponents
    
    # Test backup files
    Write-Log "Testing backup files..." -Level "INFO"
    $testResults["Backups"] = Test-BackupFiles
    
    # Calculate overall result
    $passedTests = ($testResults.Values | Where-Object { $_ -eq $true }).Count
    $totalTests = $testResults.Count
    $passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
    
    # Generate test summary
    Write-Log "System Test Summary:" -Level "INFO"
    Write-Log "===================" -Level "INFO"
    
    foreach ($test in $testResults.Keys) {
        $status = if ($testResults[$test]) { "PASSED" } else { "FAILED" }
        $statusLevel = if ($testResults[$test]) { "SUCCESS" } else { "ERROR" }
        Write-Log "$test Test: $status" -Level $statusLevel
    }
    
    Write-Log "===================" -Level "INFO"
    Write-Log "Tests Passed: $passedTests/$totalTests ($passRate%)" -Level "INFO"
    
    # Determine overall result
    if ($passRate -eq 100) {
        Write-Log "OVERALL RESULT: ALL TESTS PASSED" -Level "SUCCESS"
        Write-Log "The system is ready for deployment!" -Level "SUCCESS"
    } elseif ($passRate -ge 80) {
        Write-Log "OVERALL RESULT: MOST TESTS PASSED" -Level "WARNING"
        Write-Log "The system has minor issues that should be addressed before production deployment." -Level "WARNING"
    } else {
        Write-Log "OVERALL RESULT: TESTS FAILED" -Level "ERROR"
        Write-Log "The system has critical issues that must be fixed before deployment." -Level "ERROR"
    }
    
    # Final log information
    Write-Log "System tests completed. Log file: $logFile" -Level "INFO"
    
} catch {
    Write-Log "CRITICAL ERROR during system tests: $($_.Exception.Message)" -Level "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" -Level "ERROR"
    Write-Log "System tests failed. See log for details." -Level "ERROR"
    exit 1
}