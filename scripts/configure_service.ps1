# Create Restricted Service Account
New-LocalUser -Name "POD-SvcAcct" -NoPassword -UserMayNotChangePassword -AccountNeverExpires
Set-LocalUser -Name "POD-SvcAcct" -PasswordNeverExpires $true

# Secure Service Installation
$serviceParams = @{
  Name = "POD-CryptoService"
  BinaryPathName = "C:\app\main.exe --tpm-protected"
  Credential = (Get-Credential -UserName "POD-SvcAcct" -Message "Enter service account password")
  StartupType = "Automatic"
  DisplayName = "Print-on-Demand Cryptographic Service"
}
New-Service @serviceParams