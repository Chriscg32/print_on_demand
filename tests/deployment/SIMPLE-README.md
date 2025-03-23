# Simplified Vercel Deployment Test Suite

This is a simplified version of the Vercel deployment test suite that uses CommonJS modules and doesn't rely on Lighthouse or Chrome, making it more compatible with different environments.

## Overview

This test suite covers:

- **Frontend**: Build process verification
- **Backend**: API endpoint testing
- **Networking**: Security header verification

## Prerequisites

Before running the tests, you need:

1. Node.js installed
2. Your application code with a proper build setup
3. A deployed Vercel application to test

## Installation

```bash
# Install only the required dependency
npm install --save-dev axios
```

## Configuration

Edit the configuration section in `simple-vercel-test.js` to match your application:

```javascript
const config = {
  // Your application URLs
  productionUrl: 'https://your-app.vercel.app', // Change this to your actual Vercel URL
  
  // API endpoints to test - Update with your actual endpoints
  apiEndpoints: [
    { path: '/api/hello', method: 'GET', requiresAuth: false },
    // Add more endpoints as needed
  ]
};
```

## Running the Tests

```bash
# Run the test suite
node tests/deployment/simple-vercel-test.js
```

## Test Report

After running the tests, a detailed report is generated:

- Console output with pass/fail status for each test
- JSON report file (`vercel-deployment-test-report.json`)
- List of all errors found during testing

## Troubleshooting Common Issues

### 1. PowerShell JavaScript Syntax Error

If you see a ParserError in PowerShell when trying to run JavaScript code directly, remember that PowerShell doesn't understand JavaScript syntax. Always save your JavaScript code in .js files and run them with Node.js.

### 2. Build Script Missing

If you see an error about a missing build script:

1. Open your package.json
2. Add a build script appropriate for your framework:


   ```json
   "scripts": {
     "build": "next build"
   }
   ```

### 3. API Endpoint 404 Errors

If your API tests fail with 404 errors:

1. Make sure your API routes are correctly implemented
2. For Next.js, check that you have files like `pages/api/hello.js`
3. Update the `apiEndpoints` in the config to match your actual API routes

### 4. Security Headers Missing

If the security headers test fails:



1. For Next.js, add security headers in `next.config.js`:
   ```javascript
   module.exports = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             { key: 'X-Content-Type-Options', value: 'nosniff' },
             { key: 'X-Frame-Options', value: 'DENY' },
             { key: 'X-XSS-Protection', value: '1; mode=block' }
           ]
         }
       ];
     }
   };
   ```

## Extending the Tests

You can add your own tests by creating new functions and adding them to the `runAllTests` function:

```javascript
async function testCustomFeature() {
  console.log('🧪 Testing custom feature...');
  
  try {
    // Your test logic here
    return true;
  } catch (error) {
    testResults.custom = testResults.custom || { errors: [] };
    testResults.custom.errors.push(`Custom test error: ${error.message}`);
    return false;
  }
}

// Add to runAllTests function
async function runAllTests() {
  // ...existing tests
  await testCustomFeature();
  // ...
}
```
