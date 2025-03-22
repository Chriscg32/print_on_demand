import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()  # This will look for .env in the current directory

def push_to_shopify(printify_test_id):
    """Push product from Printify to Shopify"""
    response = None  # Initialize response
    try:
        # Set up the API call
        url = f"https://{os.getenv('SHOPIFY_STORE_NAME')}/admin/api/2024-01/products.json"
        auth = (os.getenv("SHOPIFY_API_KEY"), os.getenv("SHOPIFY_API_SECRET"))
        
        # Example payload - replace with actual data from Printify
        payload = {
            "product": {
                "title": f"Product from Printify {printify_test_id}",
                "body_html": "Product description",
                "vendor": "Printify",
                "product_type": "Custom Product"
            }
        }
        
        response = requests.post(url, json=payload, auth=auth)
        response.raise_for_status()
        return response.json()["product"]
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP Error: {http_err}")
        if response:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        if response:
            print(f"API Response: {response.text}")
        return None

def get_shopify_product(shopify_product_id):
    """Fetch product details from Shopify"""
    response = None
    try:
        url = f"https://{os.getenv('SHOPIFY_STORE_NAME')}/admin/api/2024-01/products/{shopify_product_id}.json"
        auth = (os.getenv("SHOPIFY_API_KEY"), os.getenv("SHOPIFY_API_SECRET"))
        
        # Check if required environment variables are set
        if not all([os.getenv('SHOPIFY_STORE_NAME'), os.getenv('SHOPIFY_API_KEY'), os.getenv('SHOPIFY_API_SECRET')]):
            raise ValueError("Missing required Shopify environment variables")
            
        response = requests.get(url, auth=auth)
        response.raise_for_status()
        return response.json()["product"]
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP Error: {http_err}")
        if response:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        if response and hasattr(response, 'text'):
            print(f"API Response: {response.text}")
        return None

def update_shopify_product(shopify_product_id, update_data):
    """Update an existing product in Shopify"""
    response = None
    try:
        url = f"https://{os.getenv('SHOPIFY_STORE_NAME')}/admin/api/2024-01/products/{shopify_product_id}.json"
        auth = (os.getenv("SHOPIFY_API_KEY"), os.getenv("SHOPIFY_API_SECRET"))
        
        payload = {"product": update_data}
        
        response = requests.put(url, json=payload, auth=auth)
        response.raise_for_status()
        return response.json()["product"]
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP Error: {http_err}")
        if response:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        if response and hasattr(response, 'text'):
            print(f"API Response: {response.text}")
        return None

def delete_shopify_product(shopify_product_id):
    """Delete a product from Shopify"""
    response = None
    try:
        url = f"https://{os.getenv('SHOPIFY_STORE_NAME')}/admin/api/2024-01/products/{shopify_product_id}.json"
        auth = (os.getenv("SHOPIFY_API_KEY"), os.getenv("SHOPIFY_API_SECRET"))
        
        response = requests.delete(url, auth=auth)
        response.raise_for_status()
        return True
    except requests.exceptions.HTTPError as http_err:
        print(f"❌ HTTP Error: {http_err}")
        if response:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        if response and hasattr(response, 'text'):
            print(f"API Response: {response.text}")
        return False
