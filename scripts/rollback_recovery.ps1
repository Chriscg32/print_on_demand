# Daily TPM-Sealed Backups
$backupHash = Get-ChildItem -Path "C:\print_on_demand\backend\instance\app.db" | 
  Get-FileHash -Algorithm SHA384 |
  Select-Object -ExpandProperty Hash

Protect-TpmData -Data $backupHash -OwnerAuthorization (ConvertTo-SecureString -String $env:TPM_OWNER_PWD -AsPlainText -Force) |
  Export-Clixml -Path ".\backup_seal.xml"

# Emergency Recovery
$sealedData = Import-Clixml -Path ".\backup_seal.xml"
Unprotect-TpmData -TpmData $sealedData -OwnerAuthorization (ConvertTo-SecureString -String $env:TPM_OWNER_PWD -AsPlainText -Force) |
  Set-Content -Path "C:\print_on_demand\backend\instance\app.db" -Encoding Byte