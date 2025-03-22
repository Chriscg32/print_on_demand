import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import MarketingAPI from '../../../src/apis/Marketing';

// Mock axios
const mockAxios = new MockAdapter(axios);

describe('Marketing API', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockAxios.reset();
  });

  describe('formatProductData helper function', () => {
    // Access the private helper function for testing
    const formatProductData = MarketingAPI.__test__.formatProductData;

    test('formats product data correctly without price', () => {
      const products = [
        { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
      ];
      
      const result = formatProductData(products);
      
      expect(result).toEqual([
        { id: '1', title: 'Product 1', imageUrl: 'img1.jpg', shopifyUrl: 'url1' }
      ]);
      expect(result[0].price).toBeUndefined();
    });

    test('includes price when includePrice is true', () => {
      const products = [
        { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
      ];
      
      const result = formatProductData(products, true);
      
      expect(result).toEqual([
        { id: '1', title: 'Product 1', imageUrl: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
      ]);
    });

    test('handles empty product array', () => {
      const result = formatProductData([]);
      expect(result).toEqual([]);
    });

    test('handles missing fields gracefully', () => {
      const products = [{ id: '1' }];
      const result = formatProductData(products);
      
      expect(result).toEqual([
        { id: '1', title: undefined, imageUrl: undefined, shopifyUrl: undefined }
      ]);
    });
  });

  describe('createSocialMediaPosts', () => {
    const products = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1' }
    ];
    
    const mockResponse = {
      posts: [
        { id: 'post1', platform: 'instagram', imageUrl: 'img1.jpg', status: 'scheduled' }
      ]
    };

    test('creates social media posts successfully', async () => {
      mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(200, mockResponse);
      
      const result = await MarketingAPI.createSocialMediaPosts(products);
      
      expect(result).toEqual(mockResponse.posts);
      expect(mockAxios.history.post[0].data).toEqual(JSON.stringify({
        products: [{ id: '1', title: 'Product 1', imageUrl: 'img1.jpg', shopifyUrl: 'url1' }]
      }));
    });

    test('handles empty product array', async () => {
      mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(200, { posts: [] });
      
      const result = await MarketingAPI.createSocialMediaPosts([]);
      
      expect(result).toEqual([]);
    });

    test('throws error on API failure', async () => {
      mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(500, { error: 'Server error' });
      
      await expect(MarketingAPI.createSocialMediaPosts(products))
        .rejects.toThrow('Failed to create social media posts');
    });

    test('throws error on network failure', async () => {
      mockAxios.onPost('https://api.example.com/marketing/social-posts').networkError();
      
      await expect(MarketingAPI.createSocialMediaPosts(products))
        .rejects.toThrow('Failed to create social media posts');
    });
  });

  describe('scheduleEmailCampaign', () => {
    const products = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
    ];
    
    const mockResponse = {
      campaignId: 'camp1',
      recipientCount: 1000
    };

    test('schedules email campaign with default options', async () => {
      mockAxios.onPost('https://api.example.com/marketing/email-campaigns').reply(200, mockResponse);
      
      const result = await MarketingAPI.scheduleEmailCampaign(products);
      
      expect(result.id).toEqual('camp1');
      expect(result.recipientCount).toEqual(1000);
      expect(result.scheduledDate).toBeDefined();
      
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.products[0].price).toEqual(19.99);
      expect(requestData.emailTemplate).toEqual('new-products');
    });

    test('applies custom options correctly', async () => {
      mockAxios.onPost('https://api.example.com/marketing/email-campaigns').reply(200, mockResponse);
      
      const options = {
        campaignName: 'Custom Campaign',
        emailTemplate: 'custom-template',
        daysAhead: 3,
        hour: 15
      };
      
      const result = await MarketingAPI.scheduleEmailCampaign(products, options);
      
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.campaignName).toEqual('Custom Campaign');
      expect(requestData.emailTemplate).toEqual('custom-template');
      
      // Check that date is roughly 3 days ahead at 3pm
      const scheduledDate = new Date(requestData.scheduledDate);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3);
      expectedDate.setHours(15, 0, 0, 0);
      
      // Allow 1 second difference for test execution time
      expect(Math.abs(scheduledDate - expectedDate)).toBeLessThan(1000);
    });

    test('throws error on API failure', async () => {
      mockAxios.onPost('https://api.example.com/marketing/email-campaigns').reply(500);
      
      await expect(MarketingAPI.scheduleEmailCampaign(products))
        .rejects.toThrow('Failed to schedule email campaign');
    });
  });

  describe('generateDiscountCodes', () => {
    const products = [
      { id: '1', title: 'Product 1' },
      { id: '2', title: 'Product 2' }
    ];
    
    const mockResponse = {
      discountCodes: [
        { code: 'NEWDESIGN10', productId: '1', discountValue: 10, type: 'percentage' },
        { code: 'NEWDESIGN11', productId: '2', discountValue: 10, type: 'percentage' }
      ]
    };

    test('generates discount codes with default options', async () => {
      mockAxios.onPost('https://api.example.com/marketing/discount-codes').reply(200, mockResponse);
      
      const result = await MarketingAPI.generateDiscountCodes(products);
      
      expect(result).toEqual(mockResponse.discountCodes);
      
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.products).toEqual(['1', '2']);
      expect(requestData.discountType).toEqual('percentage');
      expect(requestData.discountValue).toEqual(10);
    });

    test('applies custom options correctly', async () => {
      mockAxios.onPost('https://api.example.com/marketing/discount-codes').reply(200, mockResponse);
      
      const options = {
        discountType: 'fixed',
        discountValue: 5,
        expirationDays: 14,
        codePrefix: 'SALE'
      };
      
      await MarketingAPI.generateDiscountCodes(products, options);
      
      const requestData = JSON.parse(mockAxios.history.post[0].data);
      expect(requestData.discountType).toEqual('fixed');
      expect(requestData.discountValue).toEqual(5);
      expect(requestData.expirationDays).toEqual(14);
      expect(requestData.codePrefix).toEqual('SALE');
    });

    test('throws error on API failure', async () => {
      mockAxios.onPost('https://api.example.com/marketing/discount-codes').reply(500);
      
      await expect(MarketingAPI.generateDiscountCodes(products))
        .rejects.toThrow('Failed to generate discount codes');
    });
  });

  describe('trackCampaignPerformance', () => {
    const campaignId = 'camp1';
    const mockResponse = {
      clicks: 500,
      opens: 1200,
      conversions: 50,
      revenue: 2500
    };

    test('retrieves campaign performance data successfully', async () => {
      mockAxios.onGet(`https://api.example.com/marketing/campaigns/${campaignId}/performance`).reply(200, mockResponse);
      
      const result = await MarketingAPI.trackCampaignPerformance(campaignId);
      
      expect(result).toEqual(mockResponse);
    });

    test('throws error when campaign ID is missing', async () => {
      await expect(MarketingAPI.trackCampaignPerformance())
        .rejects.toThrow('Campaign ID is required');
    });

    test('throws error on API failure', async () => {
      mockAxios.onGet(`https://api.example.com/marketing/campaigns/${campaignId}/performance`).reply(500);
      
      await expect(MarketingAPI.trackCampaignPerformance(campaignId))
        .rejects.toThrow('Failed to track campaign performance');
    });
  });
});