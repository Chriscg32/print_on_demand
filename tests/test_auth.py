# tests/test_auth.py  
def test_user_registration(client):  
    response = client.post('/api/auth/register',  
        json={"email": "test@example.com", "password": "Str0ngP@ss"}  
    )  
    assert response.status_code == 201  
    assert "access_token" in response.json  