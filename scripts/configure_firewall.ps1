# Open firewall for HTTPS over port 443
function Open-FirewallPort {
    param (
        [int]$Port = 443,
        [string]$Name = "HTTPS-In",
        [string]$Description = "Allow HTTPS traffic in."
    )
    Write-Host "Configuring firewall rule for $Name on port $Port..."
    New-NetFirewallRule -DisplayName $Name -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Description $Description -EdgeTraversalPolicy Allow
}

# Example usage
Open-FirewallPort