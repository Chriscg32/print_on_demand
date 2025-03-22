const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/**
 * Tests the API endpoints
 * @returns {Promise<{success: boolean, details: Object, errors: Array}>}
 */
const testApiEndpoints = async () => {
  try {
    console.log('Testing API endpoints...');
    
    // Get API URL from environment or use default
    const apiUrl = process.env.REACT_APP_API_URL || 'https://api.example.com';
    
    // Define endpoints to test
    const endpoints = [
      { path: '/health', method: 'GET', expectedStatus: 200 },
      { path: '/api/products', method: 'GET', expectedStatus: 200 },
      { path: '/api/designs', method: 'GET', expectedStatus: 200 },
      { path: '/api/auth/status', method: 'GET', expectedStatus: 200 }
    ];
    
    const results = [];
    let failedEndpoints = 0;
    
    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${apiUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const success = response.status === endpoint.expectedStatus;
        
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          expectedStatus: endpoint.expectedStatus,
          actualStatus: response.status,
          success
        });
        
        if (!success) {
          failedEndpoints++;
        }
      } catch (error) {
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          expectedStatus: endpoint.expectedStatus,
          error: error.message,
          success: false
        });
        
        failedEndpoints++;
      }
    }
    
    // Check for API documentation
    const docsPath = path.join(process.cwd(), 'docs', 'api.md');
    const hasApiDocs = fs.existsSync(docsPath);
    
    if (!hasApiDocs) {
      return {
        success: failedEndpoints === 0,
        details: {
          results,
          apiUrl,
          hasApiDocs
        },
        errors: failedEndpoints > 0 ? [{
          message: `${failedEndpoints} API endpoints failed`,
          fix: 'Check API server and endpoint configurations'
        }] : [],
        warnings: [{
          message: 'API documentation not found',
          fix: 'Create API documentation in docs/api.md'
        }]
      };
    }
    
    return {
      success: failedEndpoints === 0,
      details: {
        results,
        apiUrl,
        hasApiDocs
      },
      errors: failedEndpoints > 0 ? [{
        message: `${failedEndpoints} API endpoints failed`,
        fix: 'Check API server and endpoint configurations'
      }] : []
    };
  } catch (error) {
    return {
      success: false,
      details: {},
      errors: [{
        message: `API endpoints test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check API configuration and network connectivity'
      }]
    };
  }
};

module.exports = {
  testApiEndpoints
};