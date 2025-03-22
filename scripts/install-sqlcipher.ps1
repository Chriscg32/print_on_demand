# SQLCipher installation script for Windows
choco install vcpkg -y
vcpkg integrate install
vcpkg install sqlcipher:x64-windows

# Set environment variables
$env:SQLITE_HAS_CODEC = "1"
$env:LDFLAGS = "-L$pwd\vcpkg\installed\x64-windows\lib"
$env:CPPFLAGS = "-I$pwd\vcpkg\installed\x64-windows\include"

# Rebuild sqlite3 with SQLCipher support
npm rebuild sqlite3 --build-from-source --sqlite_libname=sqlcipher --sqlite="$pwd\vcpkg\installed\x64-windows"# Requires Visual Studio Build Tools and vcpkg
vcpkg install sqlcipher:x64-windows