const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Tests API endpoints to ensure they are accessible and return
 * expected responses.
 */
exports.testApiEndpoints = async () => {
  try {
    // Check for API routes in the project
    const apiDirs = [
      path.join(process.cwd(), 'api'),
      path.join(process.cwd(), 'src', 'api'),
      path.join(process.cwd(), 'pages', 'api')
    ];
    
    const foundApiDir = apiDirs.find(dir => fs.existsSync(dir));
    
    if (!foundApiDir) {
      return {
        success: true,
        details: {
          message: 'No API directory found. Skipping API tests.'
        }
      };
    }
    
    // Get all API files
    const getApiFiles = (dir) => {
      const files = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          files.push(...getApiFiles(fullPath));
        } else if (item.isFile() && 
                  (item.name.endsWith('.js') || 
                   item.name.endsWith('.ts') || 
                   item.name.endsWith('.jsx') || 
                   item.name.endsWith('.tsx'))) {
          files.push(fullPath);
        }
      }
      
      return files;
    };
    
    const apiFiles = getApiFiles(foundApiDir);
    
    if (apiFiles.length === 0) {
      return {
        success: true,
        details: {
          message: 'API directory exists but no API files found. Skipping API tests.'
        }
      };
    }
    
    // Check if the dev server is running
    let serverRunning = false;
    try {
      await axios.get('http://localhost:5173');
      serverRunning = true;
    } catch (error) {
      // Server not running, which is expected
    }
    
    if (!serverRunning) {
      return {
        success: true,
        details: {
          message: 'Development server not running. Skipping live API tests.',
          apiFilesFound: apiFiles.length
        },
        warnings: [{
          message: 'Could not test API endpoints because development server is not running',
          fix: 'Start the development server with "npm run dev" to enable API testing'
        }]
      };
    }
    
    // If server is running, test API endpoints
    const apiEndpoints = apiFiles.map(file => {
      const relativePath = path.relative(foundApiDir, file);
      const endpoint = '/' + relativePath
        .replace(/\\/g, '/')
        .replace(/\.(js|ts|jsx|tsx)$/, '');
      
      return {
        file,
        endpoint: endpoint === '/index' ? '/' : endpoint
      };
    });
    
    const results = [];
    
    for (const api of apiEndpoints) {
      try {
        const response = await axios.get(`http://localhost:5173/api${api.endpoint}`);
        
        results.push({
          endpoint: api.endpoint,
          status: response.status,
          success: response.status >= 200 && response.status < 300
        });
      } catch (error) {
        results.push({
          endpoint: api.endpoint,
          status: error.response?.status || 'ERROR',
          success: false,
          error: error.message
        });
      }
    }
    
    const failedEndpoints = results.filter(result => !result.success);
    
    return {
      success: failedEndpoints.length === 0,
      details: {
        apiFilesFound: apiFiles.length,
        endpointsTested: results.length,
        endpointsPassed: results.length - failedEndpoints.length
      },
      errors: failedEndpoints.map(endpoint => ({
        message: `API endpoint ${endpoint.endpoint} failed with status ${endpoint.status}`,
        fix: 'Check the API implementation and ensure it returns a valid response'
      }))
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `API test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check your API implementation and ensure all dependencies are installed'
      }]
    };
  }
};