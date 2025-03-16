#!/usr/bin/env python
import sys
import os

# Add the butterflyblue-backend directory to the Python path
sys.path.insert(0, os.path.abspath('butterflyblue-backend'))

from flask.cli import FlaskGroup
from flask_migrate import Migrate
from app import create_app, db

app = create_app()
migrate = Migrate(app, db)
cli = FlaskGroup(app)

if __name__ == '__main__':
    cli()