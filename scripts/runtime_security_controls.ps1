# Runtime Security Controls Script
# This script implements dynamic CSP nonce generation and security headers

# Ensure the directory exists
if (-not (Test-Path -Path "C:\app")) {
    New-Item -Path "C:\app" -ItemType Directory -Force
}

# Dynamic CSP Nonce Generation
function New-CSPNonce {
    $randomBytes = New-Object byte[] 16
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $nonceBase64 = [Convert]::ToBase64String($randomBytes)
    $nonceBase64 | Out-File -FilePath "C:\app\nonce.bin"
    return $nonceBase64
}

# HTTP Header Injection Protection
function Set-SecurityHeaders {
    param (
        [Parameter(Mandatory=$true)]
        [System.Web.HttpResponse]$Response,
        
        [Parameter(Mandatory=$false)]
        [string]$NonceValue = (Get-Content -Path "C:\app\nonce.bin" -ErrorAction SilentlyContinue)
    )
    
    # Generate new nonce if none exists
    if ([string]::IsNullOrEmpty($NonceValue)) {
        $NonceValue = New-CSPNonce
    }
    
    # Set Content Security Policy with nonce
    $Response.Headers.Add(
        "Content-Security-Policy", 
        "default-src 'self'; script-src 'self' 'nonce-$NonceValue'; style-src 'self'; img-src 'self'; connect-src 'self'"
    )
    
    # Add other security headers
    $Response.Headers.Add("X-Content-Type-Options", "nosniff")
    $Response.Headers.Add("X-Frame-Options", "DENY")
    $Response.Headers.Add("X-XSS-Protection", "1; mode=block")
    $Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin")
    $Response.Headers.Add("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
}

# Example usage
# $nonce = New-CSPNonce
# Set-SecurityHeaders -Response $Response -NonceValue $nonce

# Export functions for module usage
Export-ModuleMember -Function New-CSPNonce, Set-SecurityHeaders
