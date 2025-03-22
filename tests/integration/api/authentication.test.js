import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import AuthService from '../../../src/services/AuthService';
import MarketingAPI from '../../../src/apis/Marketing';

// Mock axios
const mockAxios = new MockAdapter(axios);

// Sample API responses
const mockAuthResponse = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600
};

describe('API Authentication', () => {
  beforeEach(() => {
    // Reset mocks
    mockAxios.reset();
    
    // Clear stored tokens
    localStorage.clear();
    
    // Mock auth endpoints
    mockAxios.onPost('https://api.example.com/auth/login').reply(200, mockAuthResponse);
    mockAxios.onPost('https://api.example.com/auth/refresh').reply(200, {
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token',
      expiresIn: 3600
    });
  });

  test('should authenticate before making API requests', async () => {
    // Mock successful login
    await AuthService.login('test@example.com', 'password123');
    
    // Mock marketing endpoint with authentication check
    mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(config => {
      // Check if Authorization header is present
      if (config.headers.Authorization === `Bearer ${mockAuthResponse.token}`) {
        return [200, { posts: [] }];
      }
      return [401, { error: 'Unauthorized' }];
    });
    
    // Make API request
    const products = [{ id: '1', title: 'Test Product', thumbnail: 'test.jpg', shopifyUrl: 'url' }];
    const result = await MarketingAPI.createSocialMediaPosts(products);
    
    // Should receive successful response
    expect(result).toEqual([]);
  });

  test('should refresh token when expired', async () => {
    // Set up expired token
    await AuthService.login('test@example.com', 'password123');
    
    // Mock token expiration
    jest.spyOn(AuthService, 'isTokenExpired').mockReturnValue(true);
    
    // Mock marketing endpoint that requires authentication
    mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(config => {
      // Check if Authorization header has the new token
      if (config.headers.Authorization === 'Bearer new-jwt-token') {
        return [200, { posts: [] }];
      }
      return [401, { error: 'Unauthorized' }];
    });
    
    // Make API request
    const products = [{ id: '1', title: 'Test Product', thumbnail: 'test.jpg', shopifyUrl: 'url' }];
    const result = await MarketingAPI.createSocialMediaPosts(products);
    
    // Should receive successful response with refreshed token
    expect(result).toEqual([]);
    
    // Verify refresh token was called
    expect(mockAxios.history.post.some(req => 
      req.url === 'https://api.example.com/auth/refresh'
    )).toBe(true);
  });

  test('should handle authentication errors', async () => {
    // Mock failed login
    mockAxios.onPost('https://api.example.com/auth/login').reply(401, { 
      error: 'Invalid credentials' 
    });
    
    // Attempt login
    await expect(AuthService.login('wrong@example.com', 'wrongpass'))
      .rejects.toThrow('Authentication failed: Invalid credentials');
    
    // Mock marketing endpoint
    mockAxios.onPost('https://api.example.com/marketing/social-posts').reply(401, {
      error: 'Unauthorized'
    });
    
    // Attempt API request without authentication
    const products = [{ id: '1', title: 'Test Product', thumbnail: 'test.jpg', shopifyUrl: 'url' }];
    
    await expect(MarketingAPI.createSocialMediaPosts(products))
      .rejects.toThrow('Failed to create social media posts');
  });

  test('should implement CSRF protection', async () => {
    // Mock CSRF token endpoint
    mockAxios.onGet('https://api.example.com/auth/csrf-token').reply(200, {
      csrfToken: 'mock-csrf-token'
    });
    
    // Get CSRF token
    await AuthService.getCsrfToken();
    
    // Mock login endpoint that requires CSRF token
    mockAxios.onPost('https://api.example.com/auth/login').reply(config => {
      // Check if CSRF token is in headers
      if (config.headers['X-CSRF-Token'] === 'mock-csrf-token') {
        return [200, mockAuthResponse];
      }
      return [403, { error: 'CSRF token missing or invalid' }];
    });
    
    // Login with CSRF protection
    await AuthService.login('test@example.com', 'password123');
    
    // Verify CSRF token was included in request
    expect(mockAxios.history.post.some(req => 
      req.headers['X-CSRF-Token'] === 'mock-csrf-token'
    )).toBe(true);
  });
});