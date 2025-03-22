import axios from 'axios';

const SHOP_NAME = process.env.REACT_APP_SHOP_NAME;
const ACCESS_TOKEN = process.env.REACT_APP_SHOPIFY_TOKEN;

export default {
  bulkPublish: async (templates) => {
    const response = await axios.post(
      `https://${SHOP_NAME}.myshopify.com/admin/api/2023-07/products.json`,
      { products: templates },
      { headers: { 'X-Shopify-Access-Token': ACCESS_TOKEN } }
    );
    return response.data.products;
  }
};