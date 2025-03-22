# Download precompiled SQLCipher binaries
Invoke-WebRequest -Uri "https://github.com/sqlcipher/sqlcipher-windows/archive/refs/heads/master.zip" -OutFile "sqlcipher.zip"
Expand-Archive -Path "sqlcipher.zip" -DestinationPath ".\sqlcipher"