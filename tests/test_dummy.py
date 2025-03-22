def test_dummy():
    """Basic test to verify pytest is working."""
    assert True

def test_simple_addition():
    """Test basic arithmetic to verify pytest functionality."""
    assert 1 + 1 == 2

def test_string_operations():
    """Test string operations to verify pytest functionality."""
    assert "hello" + " world" == "hello world"
    
def test_list_operations():
    """Test list operations to verify pytest functionality."""
    test_list = [1, 2, 3]
    assert len(test_list) == 3
    assert sum(test_list) == 6
