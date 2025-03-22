import axios from 'axios';
import ShopifyAPI from '../Shopify';

// Mock axios
jest.mock('axios');

describe('Shopify API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('publishDesign', () => {
    const mockTemplate = {
      id: 'template-1',
      title: 'Test Template',
      description: 'A test template',
      productType: 'T-Shirt',
      tags: ['test', 'template'],
      variants: [
        { id: 'v1', price: 19.99, sku: 'TEST-SKU-1' }
      ],
      images: [
        { url: 'https://example.com/image1.jpg', alt: 'Test Image' }
      ]
    };

    const mockPublishedProduct = {
      id: 'product-1',
      title: 'Test Template',
      body_html: 'A test template',
      vendor: 'Print On Demand',
      product_type: 'T-Shirt',
      variants: [
        { id: 'variant-1', price: '19.99', sku: 'TEST-SKU-1' }
      ],
      images: [
        { id: 'image-1', src: 'https://example.com/image1.jpg', alt: 'Test Image' }
      ]
    };

    test('publishes a design successfully', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce({ data: { product: mockPublishedProduct } });
      
      // Call the API
      const result = await ShopifyAPI.publishDesign(mockTemplate);
      
      // Check that axios was called with the correct URL and data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/products.json'),
        expect.objectContaining({
          product: expect.objectContaining({
            title: mockTemplate.title
          })
        }),
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockPublishedProduct);
    });

    test('validates template input', async () => {
      // Call the API with invalid template
      await expect(ShopifyAPI.publishDesign(null))
        .rejects.toThrow('Valid template is required');
      
      // Check that axios was not called
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Validation failed';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.publishDesign(mockTemplate))
        .rejects.toThrow(`Failed to publish design: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('publishDesigns', () => {
    const mockTemplates = [
      {
        id: 'template-1',
        title: 'Test Template 1',
        description: 'A test template 1',
        variants: [{ id: 'v1', price: 19.99 }],
        images: [{ url: 'https://example.com/image1.jpg' }]
      },
      {
        id: 'template-2',
        title: 'Test Template 2',
        description: 'A test template 2',
        variants: [{ id: 'v2', price: 24.99 }],
        images: [{ url: 'https://example.com/image2.jpg' }]
      }
    ];

    const mockPublishedProducts = [
      {
        id: 'product-1',
        title: 'Test Template 1',
        body_html: 'A test template 1'
      },
      {
        id: 'product-2',
        title: 'Test Template 2',
        body_html: 'A test template 2'
      }
    ];

    test('publishes multiple designs successfully', async () => {
      // Setup mock responses for each template
      axios.post
        .mockResolvedValueOnce({ data: { product: mockPublishedProducts[0] } })
        .mockResolvedValueOnce({ data: { product: mockPublishedProducts[1] } });
      
      // Call the API
      const result = await ShopifyAPI.publishDesigns(mockTemplates);
      
      // Check that axios was called twice (once for each template)
      expect(axios.post).toHaveBeenCalledTimes(2);
      
      // Check the result
      expect(result).toEqual({ products: mockPublishedProducts });
    });

    test('handles empty templates array', async () => {
      // Call the API with empty array
      const result = await ShopifyAPI.publishDesigns([]);
      
      // Check that axios was not called
      expect(axios.post).not.toHaveBeenCalled();
      
      // Check the result is an empty array
      expect(result).toEqual({ products: [] });
    });

    test('handles API errors during batch publishing', async () => {
      // Setup mock responses - first succeeds, second fails
      axios.post
        .mockResolvedValueOnce({ data: { product: mockPublishedProducts[0] } })
        .mockRejectedValueOnce(new Error('Failed to publish second product'));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.publishDesigns(mockTemplates))
        .rejects.toThrow('Failed to publish designs');
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('getProducts', () => {
    const mockProducts = [
      { id: 'product-1', title: 'Product 1' },
      { id: 'product-2', title: 'Product 2' },
      { id: 'product-3', title: 'Product 3' }
    ];

    test('fetches products successfully', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
      
      // Call the API
      const result = await ShopifyAPI.getProducts();
      
      // Check that axios was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/products.json'),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 50 })
        })
      );
      
      // Check the result
      expect(result).toEqual(mockProducts);
    });

    test('applies limit parameter correctly', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { products: mockProducts.slice(0, 2) } });
      
      // Call the API with limit
      await ShopifyAPI.getProducts(2);
      
      // Check that axios was called with the correct URL and params
      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 2 })
        })
      );
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Unauthorized';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.getProducts())
        .rejects.toThrow(`Failed to fetch products: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('getProduct', () => {
    const mockProduct = {
      id: 'product-1',
      title: 'Test Product',
      body_html: 'A test product',
      variants: [
        { id: 'variant-1', price: '19.99' }
      ]
    };

    test('fetches a product successfully', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
      
      // Call the API
      const result = await ShopifyAPI.getProduct('product-1');
      
      // Check that axios was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/products/product-1.json'),
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockProduct);
    });

    test('validates product ID', async () => {
      // Call the API with invalid product ID
      await expect(ShopifyAPI.getProduct(null))
        .rejects.toThrow('Product ID is required');
      
      // Check that axios was not called
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Product not found';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.getProduct('product-1'))
        .rejects.toThrow(`Failed to fetch product: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('updateProduct', () => {
    const productId = 'product-1';
    const mockProductData = {
      title: 'Updated Product',
      body_html: 'An updated product'
    };

    const mockUpdatedProduct = {
      id: 'product-1',
      title: 'Updated Product',
      body_html: 'An updated product'
    };

    test('updates a product successfully', async () => {
      // Setup mock response
      axios.put.mockResolvedValueOnce({ data: { product: mockUpdatedProduct } });
      
      // Call the API
      const result = await ShopifyAPI.updateProduct(productId, mockProductData);
      
      // Check that axios was called with the correct URL and data
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining(`/products/${productId}.json`),
        { product: mockProductData },
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toEqual(mockUpdatedProduct);
    });

    test('validates product ID', async () => {
      // Call the API with invalid product ID
      await expect(ShopifyAPI.updateProduct(null, mockProductData))
        .rejects.toThrow('Product ID is required');
      
      // Check that axios was not called
      expect(axios.put).not.toHaveBeenCalled();
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Validation failed';
      axios.put.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.updateProduct(productId, mockProductData))
        .rejects.toThrow(`Failed to update product: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('deleteProduct', () => {
    const productId = 'product-1';

    test('deletes a product successfully', async () => {
      // Setup mock response
      axios.delete.mockResolvedValueOnce({});
      
      // Call the API
      const result = await ShopifyAPI.deleteProduct(productId);
      
      // Check that axios was called with the correct URL
      expect(axios.delete).toHaveBeenCalledWith(
        expect.stringContaining(`/products/${productId}.json`),
        expect.any(Object)
      );
      
      // Check the result
      expect(result).toBe(true);
    });

    test('validates product ID', async () => {
      // Call the API with invalid product ID
      await expect(ShopifyAPI.deleteProduct(null))
        .rejects.toThrow('Product ID is required');
      
      // Check that axios was not called
      expect(axios.delete).not.toHaveBeenCalled();
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'Product not found';
      axios.delete.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(ShopifyAPI.deleteProduct(productId))
        .rejects.toThrow(`Failed to delete product: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });
});