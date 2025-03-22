from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
import os
# Get database configuration from environment
database_url = os.getenv('DATABASE_URL', 'sqlite+pysqlcipher:///instance/app.db')
sqlcipher_key = os.getenv('SQLCIPHER_KEY')
if not sqlcipher_key:
    raise ValueError("SQLCIPHER_KEY environment variable must be set")
# Create engine with SQLCipher configuration
engine = create_engine(
    database_url,
    connect_args={
        "check_same_thread": False,
        "pragma_key": sqlcipher_key,
        "pragma_cipher_page_size": "4096",
        "pragma_cipher": "aes-256-gcm"
    }
)
# Configure SQLCipher on connection
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute(f"PRAGMA key = '{sqlcipher_key}'")
    cursor.execute("PRAGMA cipher_page_size = 4096")
    cursor.close()