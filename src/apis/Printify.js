/**
 * Printify API Module
 * 
 * Handles all interactions with the Printify API for design management
 * and template generation.
 * For development and testing, it includes mock data when the API is not available.
 */

import axios from 'axios';

// Base API URL and API key from environment variables
const BASE_URL = process.env.REACT_APP_PRINTIFY_API_URL || 'https://api.printify.com/v1';
const API_KEY = process.env.REACT_APP_PRINTIFY_KEY;

// Base function to determine if we should use mock data
const shouldUseMock = () => !API_KEY || process.env.NODE_ENV === 'test';

// Initial mock state
let USE_MOCK = shouldUseMock();

// Default request configuration
const defaultConfig = {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
};

/**
 * Generate mock designs for development and testing
 * @param {number} limit - Maximum number of designs to return
 * @returns {Array} - Array of mock design objects
 */
const getMockDesigns = (limit = 20) => {
  const mockDesigns = Array.from({ length: 30 }, (_, i) => ({
    id: `design-${i + 1}`,
    title: `Design ${i + 1}`,
    description: `This is a sample design description for Design ${i + 1}`,
    thumbnail: `https://via.placeholder.com/300x300?text=Design+${i + 1}`,
    created_at: new Date(Date.now() - (i * 86400000)).toISOString(),
    tags: ['sample', 'mock', i % 2 === 0 ? 'trending' : 'new'],
    category: i % 3 === 0 ? 'T-Shirts' : i % 3 === 1 ? 'Mugs' : 'Posters',
    price: 19.99 + (i % 5),
    rating: (Math.random() * 3 + 2).toFixed(1), // Random rating between 2.0 and 5.0
    sales: Math.floor(Math.random() * 1000)
  }));

  return mockDesigns.slice(0, limit);
};

/**
 * Generate mock templates for development and testing
 * @param {Array<string>} designIds - Array of design IDs
 * @returns {Array} - Array of mock template objects
 */
const getMockTemplates = (designIds) => {
  return designIds.map(id => {
    const designNumber = id.split('-')[1];
    return {
      id: `template-${id}`,
      design_id: id,
      title: `Template for Design ${designNumber}`,
      image_url: `https://via.placeholder.com/600x600?text=Template+${designNumber}`,
      product_variants: [
        {
          id: `variant-${id}-1`,
          product_id: 'tshirt-101',
          title: 'T-Shirt',
          price: 24.99,
          image_url: `https://via.placeholder.com/400x400?text=TShirt+${designNumber}`
        },
        {
          id: `variant-${id}-2`,
          product_id: 'mug-202',
          title: 'Mug',
          price: 14.99,
          image_url: `https://via.placeholder.com/400x400?text=Mug+${designNumber}`
        }
      ]
    };
  });
};

/**
 * Generate mock design details
 * @param {string} designId - ID of the design
 * @returns {Object} - Mock design details
 */
const getMockDesignDetails = (designId) => {
  const designNumber = designId.split('-')[1] || '1';
  return {
    id: designId,
    title: `Design ${designNumber}`,
    description: `This is a detailed description for Design ${designNumber}`,
    image_url: `https://via.placeholder.com/800x800?text=Design+${designNumber}`,
    thumbnail: `https://via.placeholder.com/300x300?text=Design+${designNumber}`,
    created_at: new Date(Date.now() - (parseInt(designNumber) * 86400000)).toISOString(),
    updated_at: new Date().toISOString(),
    tags: ['sample', 'mock', parseInt(designNumber) % 2 === 0 ? 'trending' : 'new'],
    category: parseInt(designNumber) % 3 === 0 ? 'T-Shirts' : parseInt(designNumber) % 3 === 1 ? 'Mugs' : 'Posters',
    price: 19.99 + (parseInt(designNumber) % 5),
    rating: (Math.random() * 3 + 2).toFixed(1),
    sales: Math.floor(Math.random() * 1000),
    colors: ['red', 'blue', 'black', 'white'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  };
};

/**
 * Generate mock categories
 * @returns {Array} - Array of mock category objects
 */
const getMockCategories = () => {
  return [
    { id: 'cat-1', name: 'T-Shirts', count: 120 },
    { id: 'cat-2', name: 'Mugs', count: 75 },
    { id: 'cat-3', name: 'Posters', count: 95 },
    { id: 'cat-4', name: 'Phone Cases', count: 60 },
    { id: 'cat-5', name: 'Hoodies', count: 45 }
  ];
};

/**
 * Printify API service
 */
const PrintifyAPI = {
  /**
   * Get designs from Printify API
   * @param {number} limit - Optional limit for number of designs to return
   * @returns {Promise<Array>} Array of design objects
   */
  getDesigns: async (limit) => {
    if (USE_MOCK) {
      return getMockDesigns(limit);
    }
    
    try {
      const url = `${BASE_URL}/designs`;
      const config = {
        ...defaultConfig,
        params: limit ? { limit } : {}
      };
      
      const response = await axios.get(url, config);
      return response.data;
    } catch (error) {
      console.error('Error fetching designs:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data');
        return getMockDesigns(limit);
      }
      throw new Error(`Failed to fetch designs: ${error.message}`);
    }
  },

  /**
   * Fetch trending designs from Printify
   * 
   * @param {number} limit - Maximum number of trending designs to fetch
   * @returns {Promise<Array>} - Promise resolving to array of trending designs
   * @throws {Error} When the API request fails
   */
  getTrendingDesigns: async (limit = 10) => {
    if (USE_MOCK) {
      return getMockDesigns(limit);
    }
    
    try {
      const response = await axios.get(`${BASE_URL}/trending/designs`, {
        ...defaultConfig,
        params: { limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching trending designs:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data');
        return getMockDesigns(limit);
      }
      throw new Error(`Failed to fetch trending designs: ${error.message}`);
    }
  },
  
  /**
   * Fetch templates for specific design IDs
   * 
   * @param {Array<string>} designIds - Array of design IDs to fetch templates for
   * @returns {Promise<Array>} - Promise resolving to array of templates
   * @throws {Error} When the API request fails
   */
  getTemplates: async (designIds) => {
    // Return empty array if no design IDs provided
    if (!designIds || designIds.length === 0) {
      return [];
    }
    
    if (USE_MOCK) {
      return getMockTemplates(designIds);
    }
    
    try {
      const response = await axios.post(
        `${BASE_URL}/templates/batch`, 
        { design_ids: designIds }, 
        defaultConfig
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data');
        return getMockTemplates(designIds);
      }
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
  },
  
  /**
   * Get design details from Printify
   * 
   * @param {string} designId - ID of the design to fetch
   * @returns {Promise<Object>} - Promise resolving to design details
   * @throws {Error} When the API request fails
   */
  getDesignDetails: async (designId) => {
    if (!designId) {
      throw new Error('Design ID is required');
    }
    
    if (USE_MOCK) {
      return getMockDesignDetails(designId);
    }
    
    try {
      const response = await axios.get(
        `${BASE_URL}/designs/${designId}`, 
        defaultConfig
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching design details:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data');
        return getMockDesignDetails(designId);
      }
      throw new Error(`Failed to fetch design details: ${error.message}`);
    }
  },
  
  /**
   * Upload a new design to Printify
   * 
   * @param {Object} designData - Design data to create
   * @returns {Promise<Object>} - Promise resolving to created design
   * @throws {Error} When the API request fails
   */
  uploadDesign: async (designData) => {
    if (!designData.title || !designData.imageUrl) {
      throw new Error('Title and imageUrl are required');
    }
    
    try {
      const response = await axios.post(
        `${BASE_URL}/designs`, 
        designData, 
        defaultConfig
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating design:', error);
      throw new Error(`Failed to create design: ${error.message}`);
    }
  },
  
  /**
   * Update an existing design on Printify
   * 
   * @param {string} designId - ID of the design to update
   * @param {Object} designData - Updated design data
   * @returns {Promise<Object>} - Promise resolving to updated design
   * @throws {Error} When the API request fails
   */
  updateDesign: async (designId, designData) => {
    if (!designId) {
      throw new Error('Design ID is required');
    }
    
    try {
      const response = await axios.put(
        `${BASE_URL}/designs/${designId}`, 
        designData, 
        defaultConfig
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating design:', error);
      throw new Error(`Failed to update design: ${error.message}`);
    }
  },
  
  /**
   * Delete a design from Printify
   * 
   * @param {string} designId - ID of the design to delete
   * @returns {Promise<boolean>} - Promise resolving to true if deletion was successful
   * @throws {Error} When the API request fails
   */
  deleteDesign: async (designId) => {
    if (!designId) {
      throw new Error('Design ID is required');
    }
    
    try {
      await axios.delete(
        `${BASE_URL}/designs/${designId}`, 
        defaultConfig
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting design:', error);
      throw new Error(`Failed to delete design: ${error.message}`);
    }
  },
  
  /**
   * Get design categories from Printify
   * 
   * @returns {Promise<Array>} - Promise resolving to array of categories
   * @throws {Error} When the API request fails
   */
  getCategories: async () => {
    if (USE_MOCK) {
      return getMockCategories();
    }
    
    try {
      const response = await axios.get(
        `${BASE_URL}/categories`, 
        defaultConfig
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log('Falling back to mock data');
        return getMockCategories();
      }
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  },
  
  /**
   * For testing purposes - force the use of mock data
   * 
   * @param {boolean} useMock - Whether to use mock data
   */
  setUseMock: (useMock) => {
    // This is only for testing and development
    if (process.env.NODE_ENV !== 'production') {
      USE_MOCK = useMock;
    } else {
      console.warn('Cannot set mock mode in production');
    }
  },
  
  /**
   * Check if mock data is being used
   * 
   * @returns {boolean} - Whether mock data is being used
   */
  isUsingMock: () => {
    return USE_MOCK;
  }
};

export default PrintifyAPI;
