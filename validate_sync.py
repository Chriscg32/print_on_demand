import pandas as pd

# Define the variables before using them
printify_data = pd.DataFrame()  # Initialize with your actual data
shopify_df = pd.DataFrame()     # Initialize with your actual data

# Then use them
print(printify_data)
print(shopify_df['column1'], shopify_df['column2'])
mismatches = []
for product in printify_data['data']:
    for variant in product['variants']:
        sku = variant['sku']
        printify_price = variant['price'] / 100  # Convert cents to dollars
        shopify_variant = shopify_df[shopify_df['SKU'] == sku]

        if shopify_variant.empty:
            mismatches.append(f"SKU {sku} missing in Shopify")
        else:
            shopify_price_val = shopify_variant['Price'].values[0]
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