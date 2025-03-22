/**
 * Marketing API Module
 * 
 * Handles all marketing-related API calls including social media posts,
 * email campaigns, and discount code generation.
 */

import axios from 'axios';

// Base API URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

/**
 * Helper function to format product data for API requests
 * @param {Array} products - Array of product objects
 * @param {boolean} includePrice - Whether to include price in the formatted data
 * @returns {Array} - Formatted product data
 */
const formatProductData = (products, includePrice = false) => {
  return products.map(product => {
    const formattedProduct = {
      id: product.id,
      title: product.title,
      imageUrl: product.thumbnail,
      shopifyUrl: product.shopifyUrl
    };
    
    if (includePrice && product.price) {
      formattedProduct.price = product.price;
    }
    
    return formattedProduct;
  });
};

/**
 * Marketing API service
 */
const MarketingAPI = {
  /**
   * Create social media posts for the given products
   * 
   * @param {Array} products - Array of product objects to create posts for
   * @returns {Promise<Array>} - Promise resolving to array of created posts
   * @throws {Error} When the API request fails
   */
  createSocialMediaPosts: async (products) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/marketing/social-posts`, {
        products: formatProductData(products)
      });
      
      return response.data.posts;
    } catch (error) {
      console.error('Error creating social media posts:', error);
      throw new Error(`Failed to create social media posts: ${error.message}`);
    }
  },
  
  /**
   * Schedule an email campaign for the given products
   * 
   * @param {Array} products - Array of product objects to include in the campaign
   * @param {Object} options - Optional campaign settings
   * @param {string} options.campaignName - Custom campaign name
   * @param {string} options.emailTemplate - Email template to use
   * @param {number} options.daysAhead - Days ahead to schedule (default: 1)
   * @param {number} options.hour - Hour of the day to schedule (default: 10)
   * @returns {Promise<Object>} - Promise resolving to campaign details
   * @throws {Error} When the API request fails
   */
  scheduleEmailCampaign: async (products, options = {}) => {
    try {
      // Calculate scheduled date (next day at 10:00 AM by default)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (options.daysAhead || 1));
      scheduledDate.setHours(options.hour || 10, 0, 0, 0);
      
      const formattedDate = scheduledDate.toISOString();
      
      const response = await axios.post(`${API_BASE_URL}/marketing/email-campaigns`, {
        products: formatProductData(products, true),
        scheduledDate: formattedDate,
        campaignName: options.campaignName || `New Products - ${new Date().toLocaleDateString()}`,
        emailTemplate: options.emailTemplate || 'new-products'
      });
      
      return {
        id: response.data.campaignId,
        scheduledDate: formattedDate,
        recipientCount: response.data.recipientCount
      };
    } catch (error) {
      console.error('Error scheduling email campaign:', error);
      throw new Error(`Failed to schedule email campaign: ${error.message}`);
    }
  },
  
  /**
   * Generate discount codes for the given products
   * 
   * @param {Array} products - Array of product objects to create discount codes for
   * @param {Object} options - Optional discount settings
   * @param {string} options.discountType - Type of discount ('percentage' or 'fixed')
   * @param {number} options.discountValue - Value of the discount
   * @param {number} options.expirationDays - Days until expiration
   * @param {string} options.codePrefix - Prefix for generated codes
   * @returns {Promise<Array>} - Promise resolving to array of discount codes
   * @throws {Error} When the API request fails
   */
  generateDiscountCodes: async (products, options = {}) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/marketing/discount-codes`, {
        products: products.map(product => product.id),
        discountType: options.discountType || 'percentage',
        discountValue: options.discountValue || 10,
        expirationDays: options.expirationDays || 7,
        codePrefix: options.codePrefix || 'NEWDESIGN'
      });
      
      return response.data.discountCodes;
    } catch (error) {
      console.error('Error generating discount codes:', error);
      throw new Error(`Failed to generate discount codes: ${error.message}`);
    }
  },
  
  /**
   * Track marketing campaign performance
   * 
   * @param {string} campaignId - ID of the campaign to track
   * @param {Object} metrics - Optional metrics to include
   * @returns {Promise<Object>} - Promise resolving to campaign performance metrics
   * @throws {Error} When the API request fails
   */
  trackCampaignPerformance: async (campaignId, metrics = {}) => {
    try {
      if (!campaignId) {
        throw new Error('Campaign ID is required');
      }
      
      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        params: metrics
      };
      
      const response = await axios.get(`${API_BASE_URL}/marketing/campaigns/${campaignId}/performance`, config);
      
      return response.data;
    } catch (error) {
      console.error('Error tracking campaign performance:', error);
      throw new Error(`Failed to track campaign performance: ${error.message}`);
    }
  }
};

export default MarketingAPI;
