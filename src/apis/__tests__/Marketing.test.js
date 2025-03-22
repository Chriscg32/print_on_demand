import axios from 'axios';
import MarketingAPI from '../Marketing';

// Mock axios
jest.mock('axios');

describe('Marketing API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createSocialMediaPosts', () => {
    const mockProducts = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1' }
    ];
    
    const mockResponse = {
      data: {
        posts: [
          { id: 'post1', platform: 'instagram', imageUrl: 'img1.jpg', status: 'scheduled' }
        ]
      }
    };

    test('formats product data correctly', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      await MarketingAPI.createSocialMediaPosts(mockProducts);
      
      // Check that axios was called with correctly formatted data
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          products: [
            {
              id: '1',
              title: 'Product 1',
              imageUrl: 'img1.jpg',
              shopifyUrl: 'url1'
            }
          ]
        })
      );
    });

    test('returns posts from response', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      const result = await MarketingAPI.createSocialMediaPosts(mockProducts);
      
      // Check the result
      expect(result).toEqual(mockResponse.data.posts);
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'API error';
      axios.post.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(MarketingAPI.createSocialMediaPosts(mockProducts))
        .rejects.toThrow(`Failed to create social media posts: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });

  describe('scheduleEmailCampaign', () => {
    const mockProducts = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
    ];
    
    const mockResponse = {
      data: {
        campaignId: 'camp1',
        recipientCount: 1000
      }
    };

    test('includes price in formatted product data', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      await MarketingAPI.scheduleEmailCampaign(mockProducts);
      
      // Check that axios was called with correctly formatted data including price
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          products: [
            expect.objectContaining({
              id: '1',
              price: 19.99
            })
          ]
        })
      );
    });

    test('uses default options when none provided', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Get current date for comparison
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      // Call the API
      await MarketingAPI.scheduleEmailCampaign(mockProducts);
      
      // Check that axios was called with default options
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          emailTemplate: 'new-products',
          campaignName: expect.stringContaining('New Products')
        })
      );
      
      // Check that the scheduled date is roughly tomorrow at 10 AM
      const requestData = axios.post.mock.calls[0][1];
      const scheduledDate = new Date(requestData.scheduledDate);
      
      // Allow 1 second difference for test execution time
      expect(Math.abs(scheduledDate - tomorrow)).toBeLessThan(1000);
    });

    test('applies custom options', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const options = {
        campaignName: 'Custom Campaign',
        emailTemplate: 'custom-template',
        daysAhead: 3,
        hour: 15
      };
      
      // Get expected date for comparison
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3);
      expectedDate.setHours(15, 0, 0, 0);
      
      // Call the API
      await MarketingAPI.scheduleEmailCampaign(mockProducts, options);
      
      // Check that axios was called with custom options
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          campaignName: 'Custom Campaign',
          emailTemplate: 'custom-template'
        })
      );
      
      // Check that the scheduled date matches the expected date
      const requestData = axios.post.mock.calls[0][1];
      const scheduledDate = new Date(requestData.scheduledDate);
      
      // Allow 1 second difference for test execution time
      expect(Math.abs(scheduledDate - expectedDate)).toBeLessThan(1000);
    });

    test('returns formatted campaign details', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      const result = await MarketingAPI.scheduleEmailCampaign(mockProducts);
      
      // Check the result structure
      expect(result).toEqual({
        id: 'camp1',
        recipientCount: 1000,
        scheduledDate: expect.any(String)
      });
    });
  });

  describe('generateDiscountCodes', () => {
    const mockProducts = [
      { id: '1', title: 'Product 1' },
      { id: '2', title: 'Product 2' }
    ];
    
    const mockResponse = {
      data: {
        discountCodes: [
          { code: 'NEWDESIGN10', productId: '1', discountValue: 10, type: 'percentage' },
          { code: 'NEWDESIGN11', productId: '2', discountValue: 10, type: 'percentage' }
        ]
      }
    };

    test('extracts product IDs correctly', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      await MarketingAPI.generateDiscountCodes(mockProducts);
      
      // Check that axios was called with product IDs
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          products: ['1', '2']
        })
      );
    });

    test('uses default discount options when none provided', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      await MarketingAPI.generateDiscountCodes(mockProducts);
      
      // Check that axios was called with default options
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          discountType: 'percentage',
          discountValue: 10,
          expirationDays: 7,
          codePrefix: 'NEWDESIGN'
        })
      );
    });

    test('applies custom discount options', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      const options = {
        discountType: 'fixed',
        discountValue: 5,
        expirationDays: 14,
        codePrefix: 'SALE'
      };
      
      // Call the API
      await MarketingAPI.generateDiscountCodes(mockProducts, options);
      
      // Check that axios was called with custom options
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          discountType: 'fixed',
          discountValue: 5,
          expirationDays: 14,
          codePrefix: 'SALE'
        })
      );
    });

    test('returns discount codes from response', async () => {
      // Setup mock response
      axios.post.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      const result = await MarketingAPI.generateDiscountCodes(mockProducts);
      
      // Check the result
      expect(result).toEqual(mockResponse.data.discountCodes);
    });
  });

  describe('trackCampaignPerformance', () => {
    const mockCampaignId = 'camp1';
    
    const mockResponse = {
      data: {
        clicks: 500,
        opens: 1200,
        conversions: 50,
        revenue: 2500
      }
    };

    test('requires campaign ID', async () => {
      // Call the API without campaign ID and expect it to throw
      await expect(MarketingAPI.trackCampaignPerformance())
        .rejects.toThrow('Campaign ID is required');
      
      // Check that axios was not called
      expect(axios.get).not.toHaveBeenCalled();
    });

    test('calls correct endpoint with campaign ID', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      await MarketingAPI.trackCampaignPerformance(mockCampaignId);
      
      // Check that axios was called with the correct endpoint
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/marketing/campaigns/${mockCampaignId}/performance`)
      );
    });

    test('returns performance data from response', async () => {
      // Setup mock response
      axios.get.mockResolvedValueOnce(mockResponse);
      
      // Call the API
      const result = await MarketingAPI.trackCampaignPerformance(mockCampaignId);
      
      // Check the result
      expect(result).toEqual(mockResponse.data);
    });

    test('handles API errors', async () => {
      // Setup mock error response
      const errorMessage = 'API error';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));
      
      // Mock console.error to prevent test output pollution
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Call the API and expect it to throw
      await expect(MarketingAPI.trackCampaignPerformance(mockCampaignId))
        .rejects.toThrow(`Failed to track campaign performance: ${errorMessage}`);
      
      // Restore console.error
      console.error.mockRestore();
    });
  });
});