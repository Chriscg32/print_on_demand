@echo off
REM Step 1: Set environment variables (temporarily)
set PRINTIFY_SHOP_ID=21253512
set PRINTIFY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...your_key_here
set SHOPIFY_API_KEY=8a7482ec72576bb6e52801dba400f105
set SHOPIFY_API_SECRET=8a9051538ae13ff5f76d2368c676df29
set SHOPIFY_STORE_NAME=www.butterflybluecreations.com

REM Step 2: Activate virtual environment
call venv\Scripts\activate

REM Step 3: Run test with new product ID
python -c "from shopify_sync import push_to_shopify, get_shopify_product; \
shopify_id = push_to_shopify('67d622d7707c16090c0648ab'); \
print('\n✅ Published Shopify ID:', shopify_id if shopify_id else '❌ Failed')"

REM Step 4: Pause to view results
pause