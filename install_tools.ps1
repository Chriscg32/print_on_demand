# Ensure the script runs with administrative privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Please run this script as an Administrator."
    exit
}

# Set execution policy to allow script execution
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass -Force

# Step 1: Install Chocolatey if not already installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
} else {
    Write-Host "Chocolatey is already installed."
}

# Step 2: Install build dependencies using Chocolatey
Write-Host "Installing dependencies via Chocolatey..."
choco install visualstudio2019buildtools -y --params "--add Microsoft.VisualStudio.Workload.VCTools --includeRecommended" --force
choco install openssl -y --force

# Step 3: Download SQLCipher source code
Write-Host "Downloading SQLCipher source code..."
$sqlcipherUrl = "https://github.com/sqlcipher/sqlcipher/archive/refs/tags/v4.6.0.zip"
$sqlcipherZip = "C:\sqlcipher.zip"
$sqlcipherSrcDir = "C:\sqlcipher-src"
Invoke-WebRequest -Uri $sqlcipherUrl -OutFile $sqlcipherZip
Write-Host "Extracting SQLCipher source code..."
Expand-Archive -Path $sqlcipherZip -DestinationPath $sqlcipherSrcDir -Force
$sqlcipherExtractedDir = "$sqlcipherSrcDir\sqlcipher-4.6.0"

# Step 4: Build SQLCipher with explicit environment setup
Write-Host "Building SQLCipher..."
$vsDevCmdPath = "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\Tools\VsDevCmd.bat"
if (-not (Test-Path $vsDevCmdPath)) {
    Write-Host "Visual Studio Build Tools not found at expected path. Please adjust the path or ensure installation."
    exit
}

$buildBatContent = @"
@echo off
call "$vsDevCmdPath" -arch=amd64 -host_arch=amd64 -winsdk=10.0.22621.0
where nmake
if %errorlevel% neq 0 echo nmake not found & exit /b 1
cd /d $sqlcipherExtractedDir
nmake /f Makefile.msc sqlite3.exe
"@
$buildBatPath = "C:\build_sqlcipher.bat"
Set-Content -Path $buildBatPath -Value $buildBatContent
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $buildBatPath -Wait -NoNewWindow

# Verify build output
$sqlite3Exe = "$sqlcipherExtractedDir\sqlite3.exe"
if (-not (Test-Path $sqlite3Exe)) {
    Write-Host "Failed to build sqlite3.exe. Check build logs for errors."
    exit
}

# Step 5: Copy sqlite3.exe to the target directory
Write-Host "Copying sqlite3.exe to C:\sqlcipher..."
$sqlcipherTargetDir = "C:\sqlcipher"
New-Item -Path $sqlcipherTargetDir -ItemType Directory -Force
Copy-Item -Path $sqlite3Exe -Destination "$sqlcipherTargetDir\sqlite3.exe" -Force

# Step 6: Add C:\sqlcipher to the system PATH
Write-Host "Updating system PATH..."
$currentPath = [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine)
if ($currentPath -notlike "*C:\sqlcipher*") {
    $newPath = "$currentPath;C:\sqlcipher"
    [Environment]::SetEnvironmentVariable("Path", $newPath, [System.EnvironmentVariableTarget]::Machine)
    $env:Path = $newPath
    Write-Host "C:\sqlcipher added to system PATH."
} else {
    Write-Host "C:\sqlcipher is already in the system PATH."
}

Write-Host "SQLCipher installation complete."