# Phase 1: Cryptographic Integrity
Test-Path "C:\print_on_demand\backend\instance\app.db" -ErrorAction Stop
sqlite3.exe "C:\print_on_demand\backend\instance\app.db" "PRAGMA cipher_integrity_check;"

# Phase 2: Service Isolation
Get-CimInstance -ClassName Win32_Service -Filter "Name='POD-CryptoService'" |
  ForEach-Object { 
    if ($_.StartName -ne "POD-SvcAcct") { 
      throw "Service account compromise detected" 
    }
  }

# Phase 3: Attack Surface Validation
Start-Process -FilePath "powershell" -ArgumentList "-File .\scripts\simulate_sqli.ps1"
Start-Sleep -Seconds 30
Get-WinEvent -LogName "Microsoft-Windows-Threat-Intelligence" -MaxEvents 100 | 
  Where-Object { $_.Id -eq 4625 } | 
  Export-Csv -Path ".\security_incidents.csv"