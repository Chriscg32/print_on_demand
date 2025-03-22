/**
 * Shopify API Module
 * 
 * Handles all interactions with the Shopify API for product management
 * and publishing designs to the store.
 */

import axios from 'axios';

// Configuration from environment variables
const SHOP_NAME = process.env.REACT_APP_SHOP_NAME || 'print-on-demand-store';
const ACCESS_TOKEN = process.env.REACT_APP_SHOPIFY_TOKEN;
const API_VERSION = process.env.REACT_APP_SHOPIFY_API_VERSION || '2023-07';

// Base API URL construction
const API_BASE_URL = `https://${SHOP_NAME}.myshopify.com/admin/api/${API_VERSION}`;

// Default request configuration
const defaultConfig = {
  headers: {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': ACCESS_TOKEN
  }
};

/**
 * Format product data for Shopify API
 * 
 * @param {Object} template - Template data
 * @returns {Object} - Formatted product data for Shopify
 */
const formatProductData = (template) => {
  return {
    product: {
      title: template.title,
      body_html: template.description || '',
      vendor: 'Print On Demand',
      product_type: template.productType || 'Custom Design',
      tags: template.tags || ['print-on-demand', 'custom-design'],
      variants: template.variants?.map(variant => ({
        price: variant.price,
        sku: variant.sku || `POD-${template.id}-${variant.id}`,
        inventory_management: 'shopify',
        inventory_policy: 'continue',
        inventory_quantity: 100
      })) || [],
      images: template.images?.map(image => ({
        src: image.url,
        alt: image.alt || template.title
      })) || [],
      metafields: [
        {
          namespace: 'printify',
          key: 'template_id',
          value: template.id,
          type: 'string'
        }
      ]
    }
  };
};

/**
 * Shopify API service
 */
const ShopifyAPI = {
  /**
   * Create a new product in Shopify
   * 
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} - Promise resolving to created product
   * @throws {Error} When the API request fails
   */
  createProduct: async (productData) => {
    if (!productData) {
      throw new Error('Product data is required');
    }
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/products.json`,
        { product: productData },
        defaultConfig
      );
    
      return response.data.product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  },

  /**
   * Publish a single design to Shopify
   * 
   * @param {Object} template - Template data
   * @returns {Promise<Object>} - Promise resolving to published product
   * @throws {Error} When the API request fails
   */
  publishDesign: async (template) => {
    if (!template || !template.id) {
      throw new Error('Valid template is required');
    }
  
    try {
      const productData = formatProductData(template);
    
      const response = await axios.post(
        `${API_BASE_URL}/products.json`,
        productData,
        defaultConfig
      );
    
      return response.data.product;
    } catch (error) {
      console.error('Error publishing design:', error);
      throw new Error(`Failed to publish design: ${error.message}`);
    }
  },

  /**
   * Publish multiple designs to Shopify (bulk operation)
   * 
   * @param {Array<Object>} templates - Array of template data
   * @returns {Promise<Array>} - Promise resolving to array of published products
   * @throws {Error} When the API request fails
   */
  bulkPublish: async (templates) => {
    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return [];
    }
  
    try {
      const publishPromises = templates.map(template => 
        ShopifyAPI.publishDesign(template)
      );
    
      const products = await Promise.all(publishPromises);
      return products;
    } catch (error) {
      console.error('Error bulk publishing designs:', error);
      throw new Error(`Failed to bulk publish designs: ${error.message}`);
    }
  },

  /**
   * Publish designs to Shopify
   * 
   * @param {Array<Object>} templates - Array of template objects to publish
   * @returns {Promise<Array>} - Promise resolving to array of published products
   * @throws {Error} When the API request fails
   */
  publishDesigns: async (templates) => {
    try {
      if (!templates || templates.length === 0) {
        return [];
      }
    
      const publishedProducts = [];
    
      for (const template of templates) {
        const productData = {
          title: template.title,
          body_html: template.description || '',
          vendor: 'Print on Demand',
          product_type: template.type || 'Custom Design',
          images: [
            {
              src: template.image_url
            }
          ],
          variants: [
            {
              price: template.price || '19.99',
              inventory_quantity: 100,
              inventory_management: 'shopify'
            }
          ]
        };
      
        const product = await ShopifyAPI.createProduct(productData);
        publishedProducts.push(product);
      }
    
      return publishedProducts;
    } catch (error) {
      console.error('Error publishing designs:', error);
      throw new Error('Failed to publish designs');
    }
  },
  
  /**
   * Get products from Shopify
   * 
   * @param {number} limit - Maximum number of products to fetch
   * @returns {Promise<Array>} - Promise resolving to array of products
   * @throws {Error} When the API request fails
   */
  getProducts: async (limit = 50) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products.json`,
        {
          ...defaultConfig,
          params: { limit }
        }
      );
      
      return response.data.products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },
  
  /**
   * Get a specific product from Shopify
   * 
   * @param {string} productId - ID of the product to fetch
   * @returns {Promise<Object>} - Promise resolving to product details
   * @throws {Error} When the API request fails
   */
  getProduct: async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/products/${productId}.json`,
        defaultConfig
      );
      
      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },
  
  /**
   * Update a product on Shopify
   * 
   * @param {string} productId - ID of the product to update
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} - Promise resolving to updated product
   * @throws {Error} When the API request fails
   */
  updateProduct: async (productId, productData) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    try {
      const response = await axios.put(
        `${API_BASE_URL}/products/${productId}.json`,
        { product: productData },
        defaultConfig
      );
      
      return response.data.product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  },
  
  /**
   * Delete a product from Shopify
   * 
   * @param {string} productId - ID of the product to delete
   * @returns {Promise<void>} - Promise resolving when deletion is successful
   * @throws {Error} When the API request fails
   */
  deleteProduct: async (productId) => {
    if (!productId) {
      throw new Error('Product ID is required');
    }
    
    try {
      await axios.delete(
        `${API_BASE_URL}/products/${productId}.json`,
        defaultConfig
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },
  
  /**
   * Create a collection on Shopify
   * 
   * @param {Object} collectionData - Collection data
   * @returns {Promise<Object>} - Promise resolving to created collection
   * @throws {Error} When the API request fails
   */
  createCollection: async (collectionData) => {
    if (!collectionData || !collectionData.title) {
      throw new Error('Collection title is required');
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/custom_collections.json`,
        { custom_collection: collectionData },
        defaultConfig
      );
      
      return response.data.custom_collection;
    } catch (error) {
      console.error('Error creating collection:', error);
      throw new Error(`Failed to create collection: ${error.message}`);
    }
  },
  
  /**
   * Add a product to a collection on Shopify
   * 
   * @param {string} collectionId - ID of the collection
   * @param {string} productId - ID of the product to add
   * @returns {Promise<Object>} - Promise resolving to the collect object
   * @throws {Error} When the API request fails
   */
  addProductToCollection: async (collectionId, productId) => {
    if (!collectionId || !productId) {
      throw new Error('Collection ID and Product ID are required');
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/collects.json`,
        {
          collect: {
            collection_id: collectionId,
            product_id: productId
          }
        },
        defaultConfig
      );
      
      return response.data.collect;
    } catch (error) {
      console.error('Error adding product to collection:', error);
      throw new Error(`Failed to add product to collection: ${error.message}`);
    }
  },
  
  /**
   * Get collections from Shopify
   * 
   * @param {number} limit - Maximum number of collections to fetch
   * @returns {Promise<Array>} - Promise resolving to array of collections
   * @throws {Error} When the API request fails
   */
  getCollections: async (limit = 50) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/custom_collections.json`,
        {
          ...defaultConfig,
          params: { limit }
        }
      );
      
      return response.data.custom_collections;
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error(`Failed to fetch collections: ${error.message}`);
    }
  },
  
  /**
   * Get products in a collection from Shopify
   * 
   * @param {string} collectionId - ID of the collection
   * @param {number} limit - Maximum number of products to fetch
   * @returns {Promise<Array>} - Promise resolving to array of products
   * @throws {Error} When the API request fails
   */
  getCollectionProducts: async (collectionId, limit = 50) => {
    if (!collectionId) {
      throw new Error('Collection ID is required');
    }
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/collections/${collectionId}/products.json`,
        {
          ...defaultConfig,
          params: { limit }
        }
      );
      
      return response.data.products;
    } catch (error) {
      console.error('Error fetching collection products:', error);
      throw new Error(`Failed to fetch collection products: ${error.message}`);
    }
  }
};

export default ShopifyAPI;
