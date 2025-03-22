// Import Jest DOM extensions
import '@testing-library/jest-dom';

const dotenv = require('dotenv');

// Check if jest-axe is available and use it if it is
try {
  const { toHaveNoViolations } = require('jest-axe');
  expect.extend(toHaveNoViolations);
} catch (e) {
  console.warn('jest-axe not found, accessibility tests will be skipped');
}

// Load environment variables
dotenv.config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000); // 30 seconds

// Mock console errors in tests
global.console.error = jest.fn();

// Mock fetch if needed
if (!global.fetch) {
  global.fetch = async (url) => {
    console.log(`Mock fetch called with: ${url}`);
    return {
      status: 200,
      statusText: 'OK',
      json: async () => ({ success: true, data: [] }),
      text: async () => '<html><body>Mock response</body></html>'
    };
  };
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}

window.IntersectionObserver = MockIntersectionObserver;

// Clean up after all tests
afterAll(() => {
  jest.clearAllMocks();
});
