import json
import pandas as pd

# Load Printify data
with open("printify_products.json") as f:
    printify_data = json.load(f)

# Load Shopify CSV from the exact path
shopify_path = (
    "C:/Users/chris/cgapp/print_on_demand/shopify_products.csv"  # <-- Updated path
)
shopify_df = pd.read_csv(shopify_path)

# Check mismatches
mismatches = []
for product in printify_data:
    for variant in product["variants"]:
        sku = variant["sku"]
        printify_price = variant["price"] / 100  # Convert cents to dollars
        shopify_variant = shopify_df[shopify_df["SKU"] == sku]

        if shopify_variant.empty:
            mismatches.append(f"SKU {sku} missing in Shopify")
        else:
            shopify_price_val = shopify_variant["Price"].values[0]
            if shopify_price_val != printify_price:
                mismatches.append(
                    f"Price mismatch for SKU {sku}: "
                    f"Shopify=${shopify_price_val}, Printify=${printify_price}"
                )

# Print results
if mismatches:
    print("🚨 Issues found:")
    for issue in mismatches:
        print(issue)
else:
    print("✅ All SKUs and prices are synced!")
