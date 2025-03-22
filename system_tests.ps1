# System Tests for Print-on-Demand Application
$ErrorActionPreference = "Stop"

function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Test-Database {
    Write-Log "Testing database connection..." -Level "INFO"
    
    $dbPath = "C:\print_on_demand\backend\instance\app.db"
    $dbKey = [Environment]::GetEnvironmentVariable("POD_DB_KEY", "Machine")
    
    if (-not (Test-Path $dbPath)) {
        Write-Log "Database file not found at $dbPath" -Level "ERROR"
        return $false
    }
    
    if (-not $dbKey) {
        Write-Log "Database encryption key not found in environment variables" -Level "ERROR"
        return $false
    }
    
    try {
        # Test database connection
        $query = "PRAGMA key = '$dbKey'; SELECT count(*) FROM system_checks;"
        $output = echo $query | sqlcipher $dbPath
        
        if ($output -match "[0-9]+") {
            Write-Log "Database connection successful" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "Database connection failed" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Database test error: $_" -Level "ERROR"
        return $false
    }
}

function Test-Service {
    Write-Log "Testing service status..." -Level "INFO"
    
    $serviceName = "POD-CryptoService"
    
    try {
        $service = Get-Service -Name $serviceName -ErrorAction Stop
        
        if ($service.Status -eq "Running") {
            Write-Log "Service is running properly" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "Service is not running (Status: $($service.Status))" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Service test error: $_" -Level "ERROR"
        return $false
    }
}

function Test-Firewall {
    Write-Log "Testing firewall configuration..." -Level "INFO"
    
    try {
        $rule = Get-NetFirewallRule -DisplayName "POD-API-Inbound" -ErrorAction Stop
        
        if ($rule) {
            Write-Log "Firewall rule exists" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "Firewall rule not found" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "Firewall test error: $_" -Level "ERROR"
        return $false
    }
}

function Test-Permissions {
    Write-Log "Testing file permissions..." -Level "INFO"
    
    $paths = @(
        "C:\print_on_demand\backend\instance",
        "C:\print_on_demand\backend\app",
        "C:\print_on_demand\secure"
    )
    
    $allPassed = $true
    
    foreach ($path in $paths) {
        try {
            $acl = Get-Acl -Path $path -ErrorAction Stop
            Write-Log "Permissions for $path: $($acl.AccessToString)" -Level "INFO"
            
            # Check if specific permissions exist - customize as needed
            if ($acl.AccessToString -match "Administrators") {
                Write-Log "Permissions for $path are correctly configured" -Level "SUCCESS"
            } else {
                Write-Log "Permissions for $path may not be correctly configured" -Level "WARNING"
                $allPassed = $false
            }
        } catch {
            Write-Log "Permission test error for $path: $_" -Level "ERROR"
            $allPassed = $false
        }
    }
    
    return $allPassed
}

function Test-NetworkConnectivity {
    Write-Log "Testing network connectivity..." -Level "INFO"
    
    try {
        # Test if port 5000 is listening
        $netstat = netstat -an | Select-String "TCP.*:5000.*LISTENING"
        
        if ($netstat) {
            Write-Log "Port 5000 is listening" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "Port 5000 is not listening" -Level "WARNING"
            return $false
        }
    } catch {
        Write-Log "Network connectivity test error: $_" -Level "ERROR"
        return $false
    }
}

# Run all tests
Write-Log "Starting system tests..." -Level "INFO"

$testResults = @{
    "Database" = Test-Database
    "Service" = Test-Service
    "Firewall" = Test-Firewall
    "Permissions" = Test-Permissions
    "NetworkConnectivity" = Test-NetworkConnectivity
}

# Display test summary
Write-Log "System Test Results:" -Level "INFO"
$passedTests = 0
$totalTests = $testResults.Count

foreach ($test in $testResults.GetEnumerator()) {
    $status = if ($test.Value) { "PASSED" } else { "FAILED" }
    $level = if ($test.Value) { "SUCCESS" } else { "ERROR" }
    
    Write-Log "  $($test.Key): $status" -Level $level
    
    if ($test.Value) {
        $passedTests++
    }
}

$successRate = [math]::Round(($passedTests / $totalTests) * 100)
Write-Log "Test Success Rate: $successRate% ($passedTests of $totalTests tests passed)" -Level "INFO"

# Return overall success (true if all tests passed)
$overallSuccess = ($passedTests -eq $totalTests)
Write-Log "Overall Test Result: $(if ($overallSuccess) { "PASSED" } else { "FAILED" })" -Level $(if ($overallSuccess) { "SUCCESS" } else { "ERROR" })

# Exit with appropriate code
if ($overallSuccess) {
    exit 0
} else {
    exit 1
}