# Define variables with proper PowerShell syntax
$pythonPath = "C:\Python39\python.exe"

# Define SQLite path
$sqlitePath = "C:\sqlite"

# Define SQLCipher path
$sqlcipherPath = "C:\sqlcipher"

# Install required Python packages
& $pythonPath -m pip install pysqlcipher3

# Clone repositories if needed
if (-not (Test-Path $sqlitePath)) {
    git clone https://github.com/sqlite/sqlite.git $sqlitePath
}

if (-not (Test-Path $sqlcipherPath)) {
    git clone https://github.com/sqlcipher/sqlcipher.git $sqlcipherPath
}

# Build SQLCipher
Set-Location $sqlcipherPath
./configure --enable-tempstore=yes CFLAGS="-DSQLITE_HAS_CODEC" LDFLAGS="-lcrypto"
make
make install

# Test SQLCipher integration
$testScript = @"
import pysqlcipher3.dbapi2 as sqlite
conn = sqlite.connect('test.db')
c = conn.cursor()
c.execute("PRAGMA key='password'")
c.execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, data TEXT)")
c.execute("INSERT INTO test VALUES (1, 'Encrypted data')")
conn.commit()
c.execute("SELECT * FROM test")
print(c.fetchall())
conn.close()
"@

$testScript | Out-File -FilePath "test_sqlcipher.py"
& $pythonPath "test_sqlcipher.py"

Write-Host "SQLCipher integration completed successfully!" -ForegroundColor Green
