#!/bin/bash
# Install dependencies
sudo apt-get update && sudo apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    tcl \
    libssl-dev

# Build SQLCipher from source
git clone https://github.com/sqlcipher/sqlcipher
cd sqlcipher
./configure --enable-tempstore=yes CFLAGS="-DSQLITE_HAS_CODEC" \
    LDFLAGS="-lcrypto"
make
sudo make install