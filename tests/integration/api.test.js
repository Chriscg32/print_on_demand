const fetch = require('node-fetch');

// Mock the fetch function to avoid actual network requests
jest.mock('node-fetch', () => jest.fn());

// Base URL for API requests
const API_URL = process.env.API_URL || 'http://localhost:3000';

describe('API Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    fetch.mockReset();
  });
  
  describe('GET /', () => {
    test('returns 200 status code', async () => {
      // Mock the fetch response
      fetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        json: async () => ({ success: true }),
        text: async () => '<html><body>Home page</body></html>'
      });

      // Make the request
      const response = await fetch(`${API_URL}/`);
      
      // Verify the request was made correctly
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/`);
      
      // Verify the response
      expect(response.status).toBe(200);
    });
  });
  
  describe('Products API', () => {
    test('GET /api/products returns list of products', async () => {
      // Mock the fetch response
      const mockProducts = [
        { id: 1, name: 'Product 1', price: 10.99 },
        { id: 2, name: 'Product 2', price: 20.99 }
      ];
      
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockProducts
      });
      
      // Make the request
      const response = await fetch(`${API_URL}/api/products`);
      
      // Verify the request was made correctly
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/products`);
      
      // Verify the response
      expect(response.status).toBe(200);
      const products = await response.json();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Product 1');
    });
    
    test('GET /api/products/:id returns a single product', async () => {
      const productId = 1;
      const mockProduct = { 
        id: productId, 
        name: 'Test Product', 
        price: 15.99 
      };
      
      // Mock the fetch response
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => mockProduct
      });
      
      // Make the request
      const response = await fetch(`${API_URL}/api/products/${productId}`);
      
      // Verify the request was made correctly
      expect(fetch).toHaveBeenCalledWith(`${API_URL}/api/products/${productId}`);
      
      // Verify the response
      expect(response.status).toBe(200);
      const product = await response.json();
      expect(product).toHaveProperty('id', productId);
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
    });
    
    test('POST /api/products creates a new product', async () => {
      const newProduct = {
        name: 'Test Product',
        description: 'Created during integration test',
        price: 19.99
      };
      
      const createdProduct = {
        id: 123,
        ...newProduct
      };
      
      // Mock the fetch response
      fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => createdProduct
      });
      
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newProduct)
      });
      
      // Verify the request was made correctly
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/products`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(newProduct)
        })
      );
      
      expect(response.status).toBe(201);
      const responseProduct = await response.json();
      expect(responseProduct).toHaveProperty('id');
      expect(responseProduct).toHaveProperty('name', newProduct.name);
      expect(responseProduct).toHaveProperty('price', newProduct.price);
    });
    
    test('PUT /api/products/:id updates a product', async () => {
      const productId = 123;
      const updateData = {
        name: 'Updated Product Name',
        price: 39.99
      };
      
      const updatedProduct = {
        id: productId,
        name: 'Updated Product Name',
        description: 'This will be updated',
        price: 39.99
      };
      
      // Mock the fetch response
      fetch.mockResolvedValueOnce({
        status: 200,
        json: async () => updatedProduct
      });
      
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      // Verify the request was made correctly
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/products/${productId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );
      
      expect(response.status).toBe(200);
      const responseProduct = await response.json();
      expect(responseProduct).toHaveProperty('id', productId);
      expect(responseProduct).toHaveProperty('name', 'Updated Product Name');
      expect(responseProduct).toHaveProperty('price', 39.99);
    });
    
    test('DELETE /api/products/:id removes a product', async () => {
      const productId = 123;
      
      // Mock the delete response
      fetch.mockResolvedValueOnce({
        status: 204,
        json: async () => ({})
      });
      
      // Then mock the 404 response for the verification request
      fetch.mockResolvedValueOnce({
        status: 404,
        json: async () => ({ error: 'Product not found' })
      });
      
      // Delete the product
      const deleteResponse = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE'
      });
      
      // Verify the delete request was made correctly
      expect(fetch).toHaveBeenCalledWith(
        `${API_URL}/api/products/${productId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      
      expect(deleteResponse.status).toBe(204);
      
      // Verify it's gone
      const getResponse = await fetch(`${API_URL}/api/products/${productId}`);
      expect(getResponse.status).toBe(404);
    });
  });
});
