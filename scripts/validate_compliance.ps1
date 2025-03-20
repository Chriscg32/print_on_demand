# NIST Control Validation
Install-Module -Name NistCompliance -Force
$nistReport = Test-NistControls -ControlIds @("AC-3", "SC-12", "SI-7") -OutputLevel Moderate -Verbose
Export-Clixml -Path ".\nist_compliance_report.xml"

# GDPR Pseudonymization Check
Invoke-RestMethod -Uri "https://localhost/api/users/123" | 
  Where-Object { $_.email -match "^[a-f0-9]{32}@example\.com$" } | 
  Export-Clixml -Path ".\gdpr_compliance_evidence.xml"