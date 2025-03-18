import requests
from flask import current_app

def get_printify_products():
    headers = {"Authorization": f"Bearer {current_app.config['PRINTIFY_TOKEN']}"}
    response = requests.get(
        f"https://api.printify.com/v1/shops/{current_app.config['SHOP_ID']}/products.json",
        headers=headers
    )
    response.raise_for_status()
    return response.json()

def create_printify_product(design_url: str, product_id: int):
    headers = {"Authorization": f"Bearer {current_app.config['PRINTIFY_TOKEN']}"}
    payload = {
        "title": "ButterflyBlue Design",
        "description": "Faith-inspired apparel",
        "blueprint_id": product_id,
        "print_areas": {"front": design_url}
    }
    
    response = requests.post(
        f"https://api.printify.com/v1/shops/{current_app.config['SHOP_ID']}/products.json",
        json=payload,
        headers=headers
    )
    response.raise_for_status()
    return response.json()