# Vercel Deployment Test Suite

This test suite helps ensure your application is ready for deployment on Vercel by testing frontend, backend, networking, and deployment aspects.

## Overview

The test suite covers:

- **Frontend**: Build process, performance, accessibility, browser compatibility
- **Backend**: API endpoints, serverless functions, response times
- **Networking**: CDN configuration, security headers
- **Deployment**: Vercel integration, build process

## Prerequisites

Before running the tests, you need:

1. Node.js 16+ installed (for ES Module support)
2. Your application code with a proper build setup
3. Vercel CLI installed (optional but recommended)
4. Vercel API token (for deployment tests)

## Installation

```bash
# Install dependencies
npm install --save-dev axios lighthouse chrome-launcher

# Set up environment variables for Vercel API access
export VERCEL_TOKEN=your_vercel_token
export VERCEL_PROJECT_ID=your_project_id
```

## Configuration

Make sure your package.json includes `"type": "module"` to support ES Modules:

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test:deployment": "node tests/deployment/vercel-deployment-test.js"
  }
}
```

Edit the configuration section in `vercel-deployment-test.js` to match your application:

```javascript
// Update URLs to match your deployment
const config = {
  productionUrl: 'https://your-app.vercel.app',
  previewUrl: 'https://your-branch-name.vercel.app',
  localUrl: 'http://localhost:3000',
  
  // Add your API endpoints
  apiEndpoints: [
    { path: '/api/users', method: 'GET', requiresAuth: false },
    // Add more endpoints
  ],
  // ...
};
```

## Running the Tests

```bash
# Run the full test suite
npm run test:deployment

# Or run directly with Node
node tests/deployment/vercel-deployment-test.js
```

To run individual test categories, you can import the specific functions in your own script:

```javascript
import { testFrontendBuild, testApiEndpoints } from './tests/deployment/vercel-deployment-test.js';

// Run only frontend tests
await testFrontendBuild();

// Run only API tests
await testApiEndpoints();
```

## Test Report

After running the tests, a detailed report is generated:

- Console output with pass/fail status for each test
- JSON report file (`vercel-deployment-test-report.json`)
- List of all errors found during testing

## Interpreting Results

The test suite provides an overall assessment:

- **READY FOR DEPLOYMENT**: All tests passed successfully
- **MOSTLY READY**: Minor issues detected, but deployment should work
- **NOT READY**: Critical issues detected that should be fixed before deployment

## Common Issues and Solutions

### Frontend Issues

- **Build Failures**: Check your build configuration and dependencies
- **Performance Issues**: Optimize images, reduce JavaScript bundle size
- **Console Errors**: Fix JavaScript errors in your application code

### Backend Issues

- **API Failures**: Ensure your API endpoints are working correctly
- **Slow Response Times**: Optimize database queries, add caching
- **Serverless Function Issues**: Check function size and execution time

### Networking Issues

- **CDN Configuration**: Ensure proper cache headers are set
- **Missing Security Headers**: Add security headers in your Vercel configuration

### Deployment Issues

- **Git Integration Problems**: Check your repository connection in Vercel
- **Build Process Failures**: Review build logs in Vercel dashboard

## Advanced Usage

### Continuous Integration

Add this test suite to your CI pipeline:

```yaml
# Example GitHub Actions workflow
name: Vercel Deployment Tests

on:
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: node tests/deployment/vercel-deployment-test.js
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

### Custom Tests

Extend the test suite by adding your own tests:

```javascript
// Add to vercel-deployment-test.js
async function testCustomFeature() {
  console.log('🧪 Testing custom feature...');
  
  try {
    // Your test logic here
    return true;
  } catch (error) {
    testResults.custom.errors.push(`Custom test error: ${error.message}`);
    return false;
  }
}
```

## Troubleshooting

### Error: require() of ES Module not supported

If you see this error, it means you're trying to use CommonJS `require()` with an ES Module. Make sure:

1. Your package.json has `"type": "module"`
2. You're using `import` instead of `require()`
3. You're using the `.js` extension in import paths

### Error: Cannot use import statement outside a module

This means your Node.js environment doesn't recognize the file as an ES Module. Check:

1. Your package.json has `"type": "module"`
2. You're running with Node.js version 16 or higher

## Contributing

Contributions to improve the test suite are welcome! Please submit a pull request with your changes.
