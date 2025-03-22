# Deployment Readiness Check for Print-on-Demand Application
$ErrorActionPreference = "Stop"

function Write-Log {
    param (
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Check-Prerequisites {
    Write-Log "Checking prerequisites..." -Level "INFO"
    
    $prerequisites = @{
        "SQLCipher" = { Get-Command "sqlcipher.exe" -ErrorAction SilentlyContinue }
        "PowerShell 5.0+" = { $PSVersionTable.PSVersion.Major -ge 5 }
        "Administrator Rights" = { 
            ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        }
        "Required Directories" = {
            (Test-Path "C:\print_on_demand\backend\instance") -and
            (Test-Path "C:\print_on_demand\backend\app") -and
            (Test-Path "C:\backups")
        }
    }
    
    $allPassed = $true
    
    foreach ($prereq in $prerequisites.GetEnumerator()) {
        $result = & $prereq.Value
        
        if ($result) {
            Write-Log "  ✓ $($prereq.Key): OK" -Level "SUCCESS"
        } else {
            Write-Log "  ✗ $($prereq.Key): MISSING" -Level "ERROR"
            $allPassed = $false
        }
    }
    
    return $allPassed
}

function Check-Configuration {
    Write-Log "Checking configuration..." -Level "INFO"
    
    $configChecks = @{
        "Architecture File" = { Test-Path "C:\print_on_demand\architecture.json" }
        "Database Key" = { [Environment]::GetEnvironmentVariable("POD_DB_KEY", "Machine") -ne $null }
        "Secure Credentials" = { Test-Path "C:\print_on_demand\secure\service_credentials.xml" }
    }
    
    $allPassed = $true
    
    foreach ($check in $configChecks.GetEnumerator()) {
        $result = & $check.Value
        
        if ($result) {
            Write-Log "  ✓ $($check.Key): OK" -Level "SUCCESS"
        } else {
            Write-Log "  ✗ $($check.Key): MISSING" -Level "ERROR"
            $allPassed = $false
        }
    }
    
    return $allPassed
}

function Check-SecurityCompliance {
    Write-Log "Checking security compliance..." -Level "INFO"
    
    $securityChecks = @{
        "Firewall Rule" = { Get-NetFirewallRule -DisplayName "POD-API-Inbound" -ErrorAction SilentlyContinue }
        "Service Account" = { Get-LocalUser -Name "POD-SvcAcct" -ErrorAction SilentlyContinue }
        "Secure Directory Permissions" = {
            $acl = Get-Acl "C:\print_on_demand\secure" -ErrorAction SilentlyContinue
            $restrictedAccess = $acl.Access | Where-Object { $_.IdentityReference -notmatch "Administrators|SYSTEM" }
            $restrictedAccess.Count -eq 0
        }
    }
    
    $allPassed = $true
    
    foreach ($check in $securityChecks.GetEnumerator()) {
        try {
            $result = & $check.Value
            
            if ($result) {
                Write-Log "  ✓ $($check.Key): OK" -Level "SUCCESS"
            } else {
                Write-Log "  ✗ $($check.Key): FAILED" -Level "ERROR"
                $allPassed = $false
            }
        } catch {
            Write-Log "  ✗ $($check.Key): ERROR - $_" -Level "ERROR"
            $allPassed = $false
        }
    }
    
    return $allPassed
}

function Check-BackupAvailability {
    Write-Log "Checking backup availability..." -Level "INFO"
    
    try {
        $backups = Get-ChildItem "C:\backups" -Filter "app.db.backup_*.sql" -ErrorAction Stop
        
        if ($backups.Count -gt 0) {
            $latestBackup = $backups | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            Write-Log "  ✓ Latest backup available: $($latestBackup.Name) ($(Get-Date $latestBackup.LastWriteTime -Format 'yyyy-MM-dd HH:mm:ss'))" -Level "SUCCESS"
            return $true
        } else {
            Write-Log "  ✗ No database backups found" -Level "ERROR"
            return $false
        }
    } catch {
        Write-Log "  ✗ Error checking backups: $_" -Level "ERROR"
        return $false
    }
}

function Generate-ReadinessReport {
    param (
        [bool]$Prerequisites,
        [bool]$Configuration,
        [bool]$SecurityCompliance,
        [bool]$BackupAvailability
    )
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $reportPath = "C:\print_on_demand\deployment_readiness_$timestamp.txt"
    
    $report = @"
============================================================
Print-on-Demand Deployment Readiness Report
============================================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Readiness Checks:
- Prerequisites: $(if ($Prerequisites) { "PASSED" } else { "FAILED" })
- Configuration: $(if ($Configuration) { "PASSED" } else { "FAILED" })
- Security Compliance: $(if ($SecurityCompliance) { "PASSED" } else { "FAILED" })
- Backup Availability: $(if ($BackupAvailability) { "PASSED" } else { "FAILED" })

Overall Readiness: $(if ($Prerequisites -and $Configuration -and $SecurityCompliance -and $BackupAvailability) { "READY FOR DEPLOYMENT" } else { "NOT READY - ISSUES DETECTED" })

Recommendations:
$(if (-not $Prerequisites) { "- Fix missing prerequisites before proceeding`n" })
$(if (-not $Configuration) { "- Complete configuration setup before proceeding`n" })
$(if (-not $SecurityCompliance) { "- Address security compliance issues before proceeding`n" })
$(if (-not $BackupAvailability) { "- Create a database backup before proceeding`n" })
$(if ($Prerequisites -and $Configuration -and $SecurityCompliance -and $BackupAvailability) { "- Proceed with deployment`n" })

============================================================
"@
    
    Set-Content -Path $reportPath -Value $report -Force
    Write-Log "Readiness report generated at $reportPath" -Level "INFO"
    
    return $reportPath
}

# Run all readiness checks
Write-Log "Starting deployment readiness checks..." -Level "INFO"

$prerequisitesCheck = Check-Prerequisites
$configurationCheck = Check-Configuration
$securityComplianceCheck = Check-SecurityCompliance
$backupAvailabilityCheck = Check-BackupAvailability

# Generate report
$reportPath = Generate-ReadinessReport -Prerequisites $prerequisitesCheck -Configuration $configurationCheck -SecurityCompliance $securityComplianceCheck -BackupAvailability $backupAvailabilityCheck

# Determine overall readiness
$overallReadiness = $prerequisitesCheck -and $configurationCheck -and $securityComplianceCheck -and $backupAvailabilityCheck

if ($overallReadiness) {
    Write-Log "Deployment Readiness: READY" -Level "SUCCESS"
    Write-Log "All checks passed. System is ready for deployment." -Level "SUCCESS"
} else {
    Write-Log "Deployment Readiness: NOT READY" -Level "ERROR"
    Write-Log "Some checks failed. Please review the readiness report at $reportPath" -Level "ERROR"
}

# Return the overall readiness status (true/false)
return $overallReadiness