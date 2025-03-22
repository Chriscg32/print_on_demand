import axios from 'axios';
import nock from 'nock';
import MarketingAPI from '../../../src/apis/Marketing';

// Use nock to intercept actual HTTP requests
// This allows us to test the full request/response cycle without mocking axios directly

describe('Marketing API Integration Tests', () => {
  // Store original environment variable
  const originalEnv = process.env.REACT_APP_API_BASE_URL;
  
  // Set up test API URL
  const TEST_API_URL = 'https://test-api.example.com';
  
  beforeAll(() => {
    // Set environment variable for tests
    process.env.REACT_APP_API_BASE_URL = TEST_API_URL;
    
    // Disable real HTTP requests
    nock.disableNetConnect();
  });
  
  afterAll(() => {
    // Restore original environment variable
    process.env.REACT_APP_API_BASE_URL = originalEnv;
    
    // Clean up nock
    nock.cleanAll();
    nock.enableNetConnect();
  });
  
  afterEach(() => {
    // Ensure all nock interceptors are used
    expect(nock.isDone()).toBe(true);
  });

  describe('createSocialMediaPosts', () => {
    const products = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1' }
    ];
    
    const expectedResponse = {
      posts: [
        { id: 'post1', platform: 'instagram', imageUrl: 'img1.jpg', status: 'scheduled' }
      ]
    };

    test('sends correctly formatted request and handles response', async () => {
      // Set up nock to intercept the request
      nock(TEST_API_URL)
        .post('/marketing/social-posts', (body) => {
          // Verify request body
          expect(body.products).toHaveLength(1);
          expect(body.products[0].id).toBe('1');
          expect(body.products[0].imageUrl).toBe('img1.jpg');
          return true;
        })
        .reply(200, expectedResponse);
      
      // Call the API
      const result = await MarketingAPI.createSocialMediaPosts(products);
      
      // Verify response handling
      expect(result).toEqual(expectedResponse.posts);
    });

    test('handles API errors correctly', async () => {
      nock(TEST_API_URL)
        .post('/marketing/social-posts')
        .reply(500, { error: 'Internal Server Error' });
      
      await expect(MarketingAPI.createSocialMediaPosts(products))
        .rejects.toThrow('Failed to create social media posts');
    });

    test('handles network errors correctly', async () => {
      nock(TEST_API_URL)
        .post('/marketing/social-posts')
        .replyWithError('Network error');
      
      await expect(MarketingAPI.createSocialMediaPosts(products))
        .rejects.toThrow('Failed to create social media posts');
    });
  });

  describe('scheduleEmailCampaign', () => {
    const products = [
      { id: '1', title: 'Product 1', thumbnail: 'img1.jpg', shopifyUrl: 'url1', price: 19.99 }
    ];
    
    const expectedResponse = {
      campaignId: 'camp1',
      recipientCount: 1000
    };

    test('sends correctly formatted request with default options', async () => {
      nock(TEST_API_URL)
        .post('/marketing/email-campaigns', (body) => {
          // Verify request body
          expect(body.products[0].price).toBe(19.99);
          expect(body.emailTemplate).toBe('new-products');
          expect(body.scheduledDate).toBeDefined();
          return true;
        })
        .reply(200, expectedResponse);
      
      const result = await MarketingAPI.scheduleEmailCampaign(products);
      
      expect(result.id).toBe('camp1');
      expect(result.recipientCount).toBe(1000);
      expect(result.scheduledDate).toBeDefined();
    });

    test('sends correctly formatted request with custom options', async () => {
      const options = {
        campaignName: 'Custom Campaign',
        emailTemplate: 'custom-template',
        daysAhead: 3,
        hour: 15
      };
      
      nock(TEST_API_URL)
        .post('/marketing/email-campaigns', (body) => {
          // Verify request body
          expect(body.campaignName).toBe('Custom Campaign');
          expect(body.emailTemplate).toBe('custom-template');
          
          // Verify date is roughly 3 days ahead at 3pm
          const scheduledDate = new Date(body.scheduledDate);
          const expectedDate = new Date();
          expectedDate.setDate(expectedDate.getDate() + 3);
          expectedDate.setHours(15, 0, 0, 0);
          
          // Allow 1 second difference for test execution time
          expect(Math.abs(scheduledDate - expectedDate)).toBeLessThan(1000);
          
          return true;
        })
        .reply(200, expectedResponse);
      
      await MarketingAPI.scheduleEmailCampaign(products, options);
    });
  });

  describe('generateDiscountCodes', () => {
    const products = [
      { id: '1', title: 'Product 1' },
      { id: '2', title: 'Product 2' }
    ];
    
    const expectedResponse = {
      discountCodes: [
        { code: 'NEWDESIGN10', productId: '1', discountValue: 10, type: 'percentage' },
        { code: 'NEWDESIGN11', productId: '2', discountValue: 10, type: 'percentage' }
      ]
    };

    test('sends correctly formatted request with product IDs', async () => {
      nock(TEST_API_URL)
        .post('/marketing/discount-codes', (body) => {
          // Verify request body
          expect(body.products).toEqual(['1', '2']);
          expect(body.discountType).toBe('percentage');
          expect(body.discountValue).toBe(10);
          return true;
        })
        .reply(200, expectedResponse);
      
      const result = await MarketingAPI.generateDiscountCodes(products);
      
      expect(result).toEqual(expectedResponse.discountCodes);
    });
  });

  describe('trackCampaignPerformance', () => {
    const campaignId = 'camp1';
    const expectedResponse = {
      clicks: 500,
      opens: 1200,
      conversions: 50,
      revenue: 2500
    };

    test('sends correctly formatted request with campaign ID', async () => {
      nock(TEST_API_URL)
        .get(`/marketing/campaigns/${campaignId}/performance`)
        .reply(200, expectedResponse);
      
      const result = await MarketingAPI.trackCampaignPerformance(campaignId);
      
      expect(result).toEqual(expectedResponse);
    });

    test('validates campaign ID before making request', async () => {
      // This should not make any HTTP request
      await expect(MarketingAPI.trackCampaignPerformance())
        .rejects.toThrow('Campaign ID is required');
    });
  });
});