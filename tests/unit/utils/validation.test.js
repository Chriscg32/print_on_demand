import { 
  validateEmail, 
  validatePassword, 
  sanitizeInput,
  validateProductData,
  validateApiResponse
} from '../../../src/utils/validation';

describe('Input Validation', () => {
  describe('Email Validation', () => {
    test('should validate correct email formats', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('user-name@subdomain.example.org')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@example')).toBe(false);
      expect(validateEmail('user name@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong passwords', () => {
      expect(validatePassword('StrongP@ss123')).toBe(true);
      expect(validatePassword('Another$3cureP@ss')).toBe(true);
    });

    test('should reject weak passwords', () => {
      expect(validatePassword('password')).toBe(false); // Common password
      expect(validatePassword('12345678')).toBe(false); // Only numbers
      expect(validatePassword('abcdefgh')).toBe(false); // Only lowercase
      expect(validatePassword('ABCDEFGH')).toBe(false); // Only uppercase
      expect(validatePassword('Pass1')).toBe(false);    // Too short
      expect(validatePassword('')).toBe(false);         // Empty
      expect(validatePassword(null)).toBe(false);       // Null
      expect(validatePassword(undefined)).toBe(false);  // Undefined
    });

    test('should validate with custom requirements', () => {
      // Custom: min 6 chars, no special chars required
      const options = { minLength: 6, requireSpecial: false };
      
      expect(validatePassword('Password123', options)).toBe(true);
      expect(validatePassword('Pass1', options)).toBe(false); // Too short
    });
  });

  describe('Input Sanitization', () => {
    test('should sanitize HTML in strings', () => {
      expect(sanitizeInput('<script>alert("XSS")</script>Hello')).toBe('Hello');
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('<b>Bold text</b>')).toBe('Bold text');
      expect(sanitizeInput('a <img src="x" onerror="alert(1)"> b')).toBe('a  b');
    });

    test('should handle different input types', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(123)).toBe('123');
      expect(sanitizeInput(true)).toBe('true');
    });

    test('should sanitize objects recursively', () => {
      const input = {
        name: '<script>alert("XSS")</script>John',
        description: '<b>Product</b> description',
        nested: {
          field: '<img src="x" onerror="alert(1)">'
        }
      };
      
      const expected = {
        name: 'John',
        description: 'Product description',
        nested: {
          field: ''
        }
      };
      
      expect(sanitizeInput(input)).toEqual(expected);
    });

    test('should sanitize arrays', () => {
      const input = ['<script>alert(1)</script>', 'normal text', '<b>bold</b>'];
      const expected = ['', 'normal text', 'bold'];
      
      expect(sanitizeInput(input)).toEqual(expected);
    });
  });

  describe('Product Data Validation', () => {
    test('should validate complete product data', () => {
      const validProduct = {
        id: '123',
        title: 'Test Product',
        price: 19.99,
        thumbnail: 'https://example.com/image.jpg',
        shopifyUrl: 'https://shop.example.com/product/123'
      };
      
      expect(validateProductData(validProduct)).toBe(true);
    });

    test('should reject incomplete product data', () => {
      // Missing title
      expect(validateProductData({
        id: '123',
        price: 19.99,
        thumbnail: 'https://example.com/image.jpg',
        shopifyUrl: 'https://shop.example.com/product/123'
      })).toBe(false);
      
      // Missing id
      expect(validateProductData({
        title: 'Test Product',
        price: 19.99,
        thumbnail: 'https://example.com/image.jpg',
        shopifyUrl: 'https://shop.example.com/product/123'
      })).toBe(false);
    });

    test('should validate with custom required fields', () => {
      const product = {
        id: '123',
        title: 'Test Product',
        // Missing price and thumbnail
        shopifyUrl: 'https://shop.example.com/product/123'
      };
      
      // Only require id and title
      expect(validateProductData(product, ['id', 'title'])).toBe(true);
      
      // Require thumbnail (which is missing)
      expect(validateProductData(product, ['id', 'title', 'thumbnail'])).toBe(false);
    });
  });

  describe('API Response Validation', () => {
    test('should validate response against schema', () => {
      const schema = {
        type: 'object',
        required: ['posts'],
        properties: {
          posts: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'platform'],
              properties: {
                id: { type: 'string' },
                platform: { type: 'string' },
                status: { type: 'string' }
              }
            }
          }
        }
      };
      
      const validResponse = {
        posts: [
          { id: '1', platform: 'instagram', status: 'scheduled' },
          { id: '2', platform: 'facebook', status: 'published' }
        ]
      };
      
      expect(validateApiResponse(validResponse, schema)).toBe(true);
    });

    test('should reject responses that do not match schema', () => {
      const schema = {
        type: 'object',
        required: ['posts'],
        properties: {
          posts: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'platform'],
              properties: {
                id: { type: 'string' },
                platform: { type: 'string' }
              }
            }
          }
        }
      };
      
      // Missing required 'posts' field
      const invalidResponse1 = {
        data: []
      };
      
      // Missing required 'id' in one of the items
      const invalidResponse2 = {
        posts: [
          { platform: 'instagram' }
        ]
      };
      
      // Wrong type (number instead of string)
      const invalidResponse3 = {
        posts: [
          { id: 123, platform: 'instagram' }
        ]
      };
      
      expect(validateApiResponse(invalidResponse1, schema)).toBe(false);
      expect(validateApiResponse(invalidResponse2, schema)).toBe(false);
      expect(validateApiResponse(invalidResponse3, schema)).toBe(false);
    });
  });
});