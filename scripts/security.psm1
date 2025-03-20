function New-CspNonce {
    $nonce = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
    return $nonce
}
Export-ModuleMember -Function New-CspNonce