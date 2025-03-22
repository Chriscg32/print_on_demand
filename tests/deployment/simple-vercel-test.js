import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Get current file directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Update these values for your project
const config = {
  // Your application URLs
  productionUrl: process.env.VERCEL_URL || 'https://your-app.vercel.app', // Uses environment variable if available
  localUrl: process.env.LOCAL_URL || 'http://localhost:3000',
  
  // API endpoints to test - Update with your actual endpoints
  apiEndpoints: [
    { path: '/api/hello', method: 'GET', requiresAuth: false },
    { path: '/api/status', method: 'GET', requiresAuth: false },
    { path: '/api/data', method: 'POST', requiresAuth: true, payload: { test: true } },
  ],
  
  // Performance thresholds
  thresholds: {
    maxResponseTime: 800, // ms
    maxBuildTime: 120000, // 2 minutes in ms
    minSecurityHeaders: 4 // Minimum number of security headers required
  },
  
  // Build configuration
  build: {
    command: 'npm run build',
    outputDir: '.next'
  }
};

// Test results storage
const testResults = {
  frontend: {
    buildSuccess: false,
    errors: []
  },
  backend: {
    apiResponses: {},
    latency: {},
    errors: []
  },
  networking: {
    cdn: {},
    security: {},
    errors: []
  }
};

/**
 * FRONTEND TESTS
 */
async function testFrontendBuild() {
  console.log('🧪 Testing frontend build process...');
  
  try {
    // Run build command
    console.log(`Running build command: ${config.build.command}`);
    const startTime = Date.now();
    const { stdout, stderr } = await execPromise(config.build.command);
    const buildTime = Date.now() - startTime;
    
    console.log(`Build completed in ${buildTime}ms`);
    
    if (buildTime > config.thresholds.maxBuildTime) {
      console.log(`⚠️ Build time exceeds threshold (${config.thresholds.maxBuildTime}ms)`);
      testResults.frontend.errors.push(`Build performance issue: Build time (${buildTime}ms) exceeds threshold (${config.thresholds.maxBuildTime}ms)`);
    }
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Build failed: ${stderr}`);
    }
    
    // Check if build directory exists and contains expected files
    const buildDir = path.join(process.cwd(), config.build.outputDir);
    const buildExists = fs.existsSync(buildDir);
    
    if (!buildExists) {
      throw new Error('Build directory not found');
    }
    
    testResults.frontend.buildSuccess = true;
    console.log('✅ Frontend build successful');
    
    return true;
  } catch (error) {
    testResults.frontend.errors.push(`Build error: ${error.message}`);
    console.error('❌ Frontend build failed:', error.message);
    return false;
  }
}

/**
 * BACKEND TESTS
 */
async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints...');
  
  const results = {};
  
  // Test each endpoint
  for (const endpoint of config.apiEndpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const startTime = Date.now();
      
      const response = await axios({
        method: endpoint.method,
        url: `${config.productionUrl}${endpoint.path}`,
        validateStatus: () => true // Don't throw on error status codes
      });
      
      const responseTime = Date.now() - startTime;
      
      results[endpoint.path] = {
        status: response.status,
        responseTime,
        success: response.status >= 200 && response.status < 300,
        performancePass: responseTime <= config.thresholds.maxResponseTime
      };
      
      console.log(`${endpoint.path}: ${response.status} (${responseTime}ms) ${results[endpoint.path].success ? '✅' : '❌'}`);
      
      if (responseTime > config.thresholds.maxResponseTime) {
        console.log(`⚠️ Response time exceeds threshold (${config.thresholds.maxResponseTime}ms)`);
        testResults.backend.errors.push(`Performance issue: ${endpoint.path} response time (${responseTime}ms) exceeds threshold (${config.thresholds.maxResponseTime}ms)`);
      }
    } catch (error) {
      testResults.backend.errors.push(`API error (${endpoint.path}): ${error.message}`);
      results[endpoint.path] = { success: false, error: error.message };
      console.error(`❌ API test failed for ${endpoint.path}:`, error.message);
    }
  }
  
  testResults.backend.apiResponses = results;
  return Object.values(results).every(r => r.success);
}

/**
 * NETWORKING TESTS
 */
async function testSecurityHeaders() {
  console.log('🧪 Testing security headers...');
  
  try {
    const response = await axios.get(config.productionUrl);
    const headers = response.headers;
    
    // Check for important security headers
    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || null,
      'content-security-policy': headers['content-security-policy'] || null,
      'x-content-type-options': headers['x-content-type-options'] || null,
      'x-frame-options': headers['x-frame-options'] || null,
      'x-xss-protection': headers['x-xss-protection'] || null,
      'referrer-policy': headers['referrer-policy'] || null
    };
    
    // Count how many security headers are present
    const presentHeadersCount = Object.values(securityHeaders).filter(Boolean).length;
    
    testResults.networking.security = {
      headers: securityHeaders,
      presentHeadersCount,
      pass: presentHeadersCount >= config.thresholds.minSecurityHeaders
    };
    
    console.log(`Security headers present: ${presentHeadersCount}/6 (minimum required: ${config.thresholds.minSecurityHeaders})`);
    
    if (testResults.networking.security.pass) {
      console.log('✅ Security headers look good');
    } else {
      console.log('⚠️ Some important security headers are missing');
    }
    
    return testResults.networking.security.pass;
  } catch (error) {
    testResults.networking.errors.push(`Security headers test error: ${error.message}`);
    console.error('❌ Security headers test failed:', error.message);
    return false;
  }
}

/**
 * RUN ALL TESTS
 */
async function runAllTests() {
  console.log('🚀 Starting Vercel deployment test suite...');
  
  // Frontend tests
  await testFrontendBuild();
  
  // Backend tests
  await testApiEndpoints();
  
  // Networking tests
  await testSecurityHeaders();
  
  // Generate report
  generateReport();
}

function generateReport() {
  console.log('\n📋 DEPLOYMENT TEST REPORT');
  console.log('========================');
  
  // Frontend summary
  console.log('\n📱 FRONTEND');
  console.log(`Build: ${testResults.frontend.buildSuccess ? '✅' : '❌'}`);
  if (testResults.frontend.errors.length > 0) {
    console.log(`Errors: ${testResults.frontend.errors.length}`);
  }
  
  // Backend summary
  console.log('\n🔌 BACKEND');
  const apiTests = Object.values(testResults.backend.apiResponses);
  const passedApiTests = apiTests.filter(test => test.success).length;
  console.log(`API endpoints: ${passedApiTests}/${apiTests.length} passing`);
  if (testResults.backend.errors.length > 0) {
    console.log(`Errors: ${testResults.backend.errors.length}`);
  }
  
  // Networking summary
  console.log('\n🌐 NETWORKING');
  console.log(`Security headers: ${testResults.networking.security.pass ? '✅' : '❌'}`);
  if (testResults.networking.errors.length > 0) {
    console.log(`Errors: ${testResults.networking.errors.length}`);
  }
  
  // Overall assessment
  console.log('\n🏁 OVERALL ASSESSMENT');
  const totalErrors = 
    testResults.frontend.errors.length + 
    testResults.backend.errors.length + 
    testResults.networking.errors.length;
  
  if (totalErrors === 0 && testResults.frontend.buildSuccess) {
    console.log('✅ READY FOR DEPLOYMENT: All tests passed successfully!');
  } else if (totalErrors < 3 && testResults.frontend.buildSuccess) {
    console.log('⚠️ MOSTLY READY: Minor issues detected, but deployment should work.');
  } else {
    console.log('❌ NOT READY: Critical issues detected that should be fixed before deployment.');
  }
  
  // List all errors
  if (totalErrors > 0) {
    console.log('\n❌ ALL ERRORS:');
    
    if (testResults.frontend.errors.length > 0) {
      console.log('\nFrontend Errors:');
      testResults.frontend.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
    
    if (testResults.backend.errors.length > 0) {
      console.log('\nBackend Errors:');
      testResults.backend.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
    
    if (testResults.networking.errors.length > 0) {
      console.log('\nNetworking Errors:');
      testResults.networking.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
  }
  
  // Save report to file
  const reportJson = JSON.stringify(testResults, null, 2);
  fs.writeFileSync('vercel-deployment-test-report.json', reportJson);
  console.log('\nDetailed report saved to vercel-deployment-test-report.json');
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});

// Export functions for individual testing
export {
  runAllTests,
  testFrontendBuild,
  testApiEndpoints,
  testSecurityHeaders
};
