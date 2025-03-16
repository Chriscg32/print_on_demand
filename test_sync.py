# test_sync.py  
from shopify_sync import push_to_shopify, get_shopify_product  

# Replace with your actual Printify product ID (e.g., "abc123")  
printify_test_id = "67d4757b4060f241670fd4d0"  
shopify_product_id = push_to_shopify(printify_test_id)  

if shopify_product_id:  
    print(f"✅ Product pushed to Shopify! ID: {shopify_product_id}")  
    product_details = get_shopify_product(shopify_product_id)  
    print(f"🛍️ Shopify Product Status: {product_details['status']}")  
else:  
    print("❌ Failed to push product.")  