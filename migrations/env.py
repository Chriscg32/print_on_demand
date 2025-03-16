# Alembic configuration for Flask migrations
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Add the app directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the app and models
from butterflyblue-backend.app import create_app, db
from butterflyblue-backend.app.models import User, Product

# Load the application's models
config = context.config

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# Get the Flask app's database URI from the app config
app = create_app()
config.set_main_option('sqlalchemy.url', app.config['SQLALCHEMY_DATABASE_URI'])

# Get the MetaData object for the database
target_metadata = db.metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url, 
        target_metadata=target_metadata, 
        literal_binds=True,
        compare_type=True
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()