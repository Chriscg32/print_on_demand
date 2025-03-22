import sqlite3
import os

def test_sqlcipher_encryption():
    """
    Test SQLCipher encryption functionality by:
    1. Creating an encrypted database
    2. Inserting test data
    3. Closing and reopening with the correct key
    4. Verifying data can be retrieved
    5. Attempting to open without the key (should fail)
    """
    db_file = 'encrypted_test.db'
    encryption_key = "your_secure_key"
    test_data = "This is secret data"
    
    # Remove existing test database if it exists
    if os.path.exists(db_file):
        os.remove(db_file)
    
    print("Step 1: Creating encrypted database...")
    # Create and encrypt a new database
    conn = sqlite3.connect(db_file)
    conn.execute(f'PRAGMA key = "{encryption_key}";')
    conn.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, data TEXT);')
    
    print("Step 2: Inserting test data...")
    # Insert test data
    conn.execute('INSERT INTO test (data) VALUES (?);', (test_data,))
    conn.commit()
    conn.close()
    
    print("Step 3: Reopening database with correct key...")
    # Reopen with correct key and verify data
    try:
        conn = sqlite3.connect(db_file)
        conn.execute(f'PRAGMA key = "{encryption_key}";')
        cursor = conn.execute('SELECT data FROM test WHERE id = 1;')
        result = cursor.fetchone()[0]
        print(f"Step 4: Data retrieved successfully: '{result}'")
        if result == test_data:
            print("✓ Encryption test passed: Data correctly encrypted and decrypted")
        else:
            print("✗ Encryption test failed: Data mismatch")
        conn.close()
    except Exception as e:
        print(f"✗ Error accessing encrypted database with correct key: {e}")
    
    print("\nStep 5: Testing access without encryption key...")
    # Try to open without the key (should fail)
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.execute('SELECT data FROM test WHERE id = 1;')
        result = cursor.fetchone()
        print("✗ Security test failed: Could access encrypted data without key")
        conn.close()
    except Exception as e:
        print(f"✓ Security test passed: Could not access data without key")
        print(f"  Error (expected): {e}")
    
    print("\nSQLCipher encryption test completed.")

if __name__ == "__main__":
    test_sqlcipher_encryption()
