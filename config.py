import os

class Config:
    # Use DATABASE_URL from Heroku if available, otherwise use SQLite
    # Configures the database URI, prioritizing the Heroku DATABASE_URL environment variable
        # or falling back to a local SQLite database if no environment variable is set
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_TRACK_MODIFICATIONS = False