# Install NuGet Package Provider
Write-Host "Installing NuGet Package Provider..."
Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force

# Install NistCompliance Module
Write-Host "Installing NistCompliance Module..."
Install-Module -Name NistCompliance -Scope CurrentUser -Force

# Verification of installation
Write-Host "Verifying NistCompliance Module Installation..."
if (Get-Module -ListAvailable -Name NistCompliance) {
    Write-Host "NistCompliance Module installed successfully."
} else {
    Write-Error "NistCompliance Module installation failed."
}