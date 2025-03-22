import pytest
from fastapi.testclient import TestClient
from ..main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_data():
    return {
        "items": [
            {"id": 1, "name": "Test Item 1"},
            {"id": 2, "name": "Test Item 2"},
        ]
    }
from print_on_demand.fullstack_project.backend.src.main import app