import os  
import requests  
from dotenv import load_dotenv  

load_dotenv(dotenv_path=r'C:\Users\chris\cgapp\print_on_demand\.env')  

def push_to_shopify(printify_product_id):  
    """Publish product to Shopify via Printify API"""  
    try:  
        url = f"https://api.printify.com/v1/shops/{os.getenv('PRINTIFY_SHOP_ID')}/products/{printify_product_id}/publish.json"  
        headers = {"Authorization": f"Bearer {os.getenv('PRINTIFY_API_KEY')}"}  
        payload = {  
            "title": "AI-Generated Design",  
            "blueprint_id": int(os.getenv("PRINTIFY_BLUEPRINT_ID")),  
            "print_provider_id": int(os.getenv("PRINTIFY_PROVIDER_ID")),  
            "visible": True  
        }  
        response = requests.post(url, headers=headers, json=payload)  
        response.raise_for_status()  
        return response.json().get("id")  
    except Exception as e:  
        print(f"❌ Error: {e}\nAPI Response: {response.text}")  
        return None  

def get_shopify_product(shopify_product_id):  
    """Fetch product details from Shopify"""  
    try:  
        url = f"https://{os.getenv('SHOPIFY_STORE_NAME')}/admin/api/2024-01/products/{shopify_product_id}.json"  
        auth = (os.getenv("SHOPIFY_API_KEY"), os.getenv("SHOPIFY_API_SECRET"))  
        response = requests.get(url, auth=auth)  
        response.raise_for_status()  
        return response.json()["product"]  
    except Exception as e:  
        print(f"❌ Error: {e}")  
        return None  