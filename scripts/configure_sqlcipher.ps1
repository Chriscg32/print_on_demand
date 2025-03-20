# Initialize TPM
Initialize-Tpm -AllowClear -Force
$tpmKey = New-TpmEndorsementKey -OwnerAuthorization (ConvertTo-SecureString -String $env:TPM_OWNER_PWD -AsPlainText -Force)

# SQLCipher TPM Binding
Add-Type -Path "Microsoft.SqlServer.Tpm.dll"
Initialize-SqlCipher -DatabasePath "C:\print_on_demand\backend\instance\app.db" -TpmKey $tpmKey -Algorithm XTS-AES-256