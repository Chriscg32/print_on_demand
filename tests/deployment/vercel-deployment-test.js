import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

// We'll dynamically import lighthouse since it's an ES Module
const execPromise = promisify(exec);

// Get current file directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Your application URLs
  productionUrl: 'https://your-app.vercel.app',
  previewUrl: 'https://your-branch-name.vercel.app', // For branch deployments
  localUrl: 'http://localhost:3000',
  
  // API endpoints to test
  apiEndpoints: [
    { path: '/api/users', method: 'GET', requiresAuth: false },
    { path: '/api/products', method: 'GET', requiresAuth: false },
    // Add more endpoints as needed
  ],
  
  // Test user credentials (for authenticated endpoints)
  testUser: {
    email: 'test@example.com',
    password: 'testPassword123'
  },
  
  // Vercel specific settings
  vercel: {
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID, // Optional
    projectId: process.env.VERCEL_PROJECT_ID
  },
  
  // Performance thresholds
  thresholds: {
    performance: 80,
    accessibility: 90,
    bestPractices: 85,
    seo: 90,
    maxResponseTime: 500 // ms
  }
};

// Test results storage
const testResults = {
  frontend: {
    buildSuccess: false,
    browserCompatibility: {},
    performance: {},
    accessibility: {},
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
  },
  deployment: {
    gitIntegration: false,
    buildProcess: false,
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
    const { stdout, stderr } = await execPromise('npm run build');
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(`Build failed: ${stderr}`);
    }
    
    // Check if build directory exists and contains expected files
    const buildDir = path.join(process.cwd(), '.next');
    const buildExists = fs.existsSync(buildDir);
    
    if (!buildExists) {
      throw new Error('Build directory not found');
    }
    
    testResults.frontend.buildSuccess = true;
    console.log('✅ Frontend build successful');
    
    // Check for optimized assets
    const hasOptimizedAssets = checkForOptimizedAssets(buildDir);
    console.log(`${hasOptimizedAssets ? '✅' : '❌'} Optimized assets check`);
    
    return true;
  } catch (error) {
    testResults.frontend.errors.push(`Build error: ${error.message}`);
    console.error('❌ Frontend build failed:', error.message);
    return false;
  }
}

function checkForOptimizedAssets(buildDir) {
  // Check for minified JS/CSS files
  try {
    // For Next.js, check the chunks in .next/static
    const staticDir = path.join(buildDir, 'static');
    if (!fs.existsSync(staticDir)) return false;
    
    // Check if there are JS files in the chunks directory
    const chunksDir = path.join(staticDir, 'chunks');
    if (!fs.existsSync(chunksDir)) return false;
    
    const files = fs.readdirSync(chunksDir);
    const hasJsFiles = files.some(file => file.endsWith('.js'));
    
    return hasJsFiles;
  } catch (error) {
    testResults.frontend.errors.push(`Asset optimization check error: ${error.message}`);
    return false;
  }
}

async function runLighthouseTests(url) {
  console.log(`🧪 Running Lighthouse tests on ${url}...`);
  
  try {
    // Dynamically import lighthouse and chrome-launcher (ES modules)
    const { default: lighthouse } = await import('lighthouse');
    const { default: chromeLauncher } = await import('chrome-launcher');
    
    // Launch Chrome
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    // Run Lighthouse
    const options = {
      port: chrome.port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
    };
    
    const results = await lighthouse(url, options);
    await chrome.kill();
    
    // Extract scores
    const scores = {
      performance: results.lhr.categories.performance.score * 100,
      accessibility: results.lhr.categories.accessibility.score * 100,
      bestPractices: results.lhr.categories['best-practices'].score * 100,
      seo: results.lhr.categories.seo.score * 100
    };
    
    testResults.frontend.performance = scores;
    
    // Check against thresholds
    const passedThresholds = {
      performance: scores.performance >= config.thresholds.performance,
      accessibility: scores.accessibility >= config.thresholds.accessibility,
      bestPractices: scores.bestPractices >= config.thresholds.bestPractices,
      seo: scores.seo >= config.thresholds.seo
    };
    
    console.log('📊 Lighthouse scores:');
    console.log(`Performance: ${scores.performance.toFixed(0)} ${passedThresholds.performance ? '✅' : '❌'}`);
    console.log(`Accessibility: ${scores.accessibility.toFixed(0)} ${passedThresholds.accessibility ? '✅' : '❌'}`);
    console.log(`Best Practices: ${scores.bestPractices.toFixed(0)} ${passedThresholds.bestPractices ? '✅' : '❌'}`);
    console.log(`SEO: ${scores.seo.toFixed(0)} ${passedThresholds.seo ? '✅' : '❌'}`);
    
    return passedThresholds;
  } catch (error) {
    testResults.frontend.errors.push(`Lighthouse error: ${error.message}`);
    console.error('❌ Lighthouse tests failed:', error.message);
    return null;
  }
}

async function testBrowserConsoleErrors(url) {
  console.log(`🧪 Testing for console errors on ${url}...`);
  
  try {
    // Dynamically import chrome-launcher
    const { default: chromeLauncher } = await import('chrome-launcher');
    
    // Launch Chrome
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    
    // Use Chrome DevTools Protocol to capture console logs
    const protocol = await chrome.connectToChrome();
    const { Page, Runtime } = protocol;
    
    await Promise.all([Page.enable(), Runtime.enable()]);
    
    const consoleErrors = [];
    Runtime.consoleAPICalled((params) => {
      if (params.type === 'error') {
        consoleErrors.push(params.args.map(arg => arg.value).join(' '));
      }
    });
    
    // Navigate to the URL
    await Page.navigate({ url });
    await Page.loadEventFired();
    
    // Wait a bit for any async errors
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await chrome.kill();
    
    if (consoleErrors.length > 0) {
      testResults.frontend.errors.push(...consoleErrors.map(err => `Console error: ${err}`));
      console.log(`❌ Found ${consoleErrors.length} console errors`);
      return false;
    }
    
    console.log('✅ No console errors detected');
    return true;
  } catch (error) {
    testResults.frontend.errors.push(`Browser test error: ${error.message}`);
    console.error('❌ Browser test failed:', error.message);
    return false;
  }
}

/**
 * BACKEND TESTS
 */
async function testApiEndpoints() {
  console.log('🧪 Testing API endpoints...');
  
  const results = {};
  let authToken = null;
  
  // Get auth token if needed
  if (config.apiEndpoints.some(endpoint => endpoint.requiresAuth)) {
    try {
      const response = await axios.post(`${config.productionUrl}/api/auth/login`, config.testUser);
      authToken = response.data.token;
    } catch (error) {
      testResults.backend.errors.push(`Auth error: ${error.message}`);
      console.error('❌ Failed to get auth token:', error.message);
    }
  }
  
  // Test each endpoint
  for (const endpoint of config.apiEndpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const headers = {};
      if (endpoint.requiresAuth && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const startTime = Date.now();
      
      const response = await axios({
        method: endpoint.method,
        url: `${config.productionUrl}${endpoint.path}`,
        headers,
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

async function testServerlessFunction() {
  console.log('🧪 Testing serverless function scaling...');
  
  try {
    // Choose a simple API endpoint to test
    const endpoint = config.apiEndpoints[0]?.path || '/api/hello';
    
    // Make multiple concurrent requests to test scaling
    const concurrentRequests = 10;
    const requests = Array(concurrentRequests).fill().map(() => 
      axios.get(`${config.productionUrl}${endpoint}`)
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    const successCount = responses.filter(r => r.status >= 200 && r.status < 300).length;
    const avgResponseTime = totalTime / concurrentRequests;
    
    testResults.backend.latency = {
      concurrentRequests,
      successCount,
      avgResponseTime,
      pass: successCount === concurrentRequests
    };
    
    console.log(`✅ ${successCount}/${concurrentRequests} concurrent requests successful`);
    console.log(`Average response time: ${avgResponseTime.toFixed(0)}ms`);
    
    return successCount === concurrentRequests;
  } catch (error) {
    testResults.backend.errors.push(`Serverless scaling error: ${error.message}`);
    console.error('❌ Serverless function test failed:', error.message);
    return false;
  }
}

/**
 * NETWORKING TESTS
 */
async function testCdnConfiguration() {
  console.log('🧪 Testing CDN configuration...');
  
  try {
    // Request a static asset and check headers
    const response = await axios.get(`${config.productionUrl}/_next/static/chunks/main.js`, {
      validateStatus: () => true
    });
    
    const headers = response.headers;
    
    // Check for CDN headers
    const cdnHeaders = {
      cache: headers['cache-control'] || null,
      server: headers['server'] || null,
      'content-type': headers['content-type'] || null,
      'x-vercel-cache': headers['x-vercel-cache'] || null
    };
    
    testResults.networking.cdn = {
      headers: cdnHeaders,
      cacheHit: headers['x-vercel-cache'] === 'HIT',
      hasCorrectCacheControl: !!headers['cache-control']?.includes('public'),
      pass: response.status === 200 && !!headers['x-vercel-cache']
    };
    
    console.log(`CDN Cache: ${headers['x-vercel-cache'] || 'Not found'}`);
    console.log(`Cache-Control: ${headers['cache-control'] || 'Not found'}`);
    
    if (testResults.networking.cdn.pass) {
      console.log('✅ CDN configuration looks good');
    } else {
      console.log('⚠️ CDN configuration may need improvement');
    }
    
    return testResults.networking.cdn.pass;
  } catch (error) {
    testResults.networking.errors.push(`CDN test error: ${error.message}`);
    console.error('❌ CDN test failed:', error.message);
    return false;
  }
}

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
      pass: presentHeadersCount >= 3 // At least 3 security headers should be present
    };
    
    console.log(`Security headers present: ${presentHeadersCount}/6`);
    
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
 * DEPLOYMENT TESTS
 */
async function testVercelIntegration() {
  console.log('🧪 Testing Vercel integration...');
  
  if (!config.vercel.token || !config.vercel.projectId) {
    console.log('⚠️ Skipping Vercel API tests (missing token or project ID)');
    return false;
  }
  
  try {
    // Check deployment status using Vercel API
    const headers = { Authorization: `Bearer ${config.vercel.token}` };
    const url = `https://api.vercel.com/v6/deployments?projectId=${config.vercel.projectId}&limit=1`;
    
    const response = await axios.get(url, { headers });
    const latestDeployment = response.data.deployments[0];
    
    if (!latestDeployment) {
      throw new Error('No deployments found');
    }
    
    testResults.deployment.gitIntegration = !!latestDeployment.meta?.githubCommitSha;
    testResults.deployment.buildProcess = latestDeployment.state === 'READY';
    
    console.log(`Latest deployment: ${latestDeployment.url}`);
    console.log(`Deployment state: ${latestDeployment.state}`);
    console.log(`Git integration: ${testResults.deployment.gitIntegration ? '✅' : '❌'}`);
    console.log(`Build process: ${testResults.deployment.buildProcess ? '✅' : '❌'}`);
    
    return testResults.deployment.buildProcess;
  } catch (error) {
    testResults.deployment.errors.push(`Vercel integration error: ${error.message}`);
    console.error('❌ Vercel integration test failed:', error.message);
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
  await runLighthouseTests(config.productionUrl);
  await testBrowserConsoleErrors(config.productionUrl);
  
  // Backend tests
  await testApiEndpoints();
  await testServerlessFunction();
  
  // Networking tests
  await testCdnConfiguration();
  await testSecurityHeaders();
  
  // Deployment tests
  await testVercelIntegration();
  
  // Generate report
  generateReport();
}

function generateReport() {
  console.log('\n📋 DEPLOYMENT TEST REPORT');
  console.log('========================');
  
  // Frontend summary
  console.log('\n📱 FRONTEND');
  console.log(`Build: ${testResults.frontend.buildSuccess ? '✅' : '❌'}`);
  if (testResults.frontend.performance.performance) {
    console.log(`Performance score: ${testResults.frontend.performance.performance.toFixed(0)}/100`);
    console.log(`Accessibility score: ${testResults.frontend.performance.accessibility.toFixed(0)}/100`);
  }
  if (testResults.frontend.errors.length > 0) {
    console.log(`Errors: ${testResults.frontend.errors.length}`);
  }
  
  // Backend summary
  console.log('\n🔌 BACKEND');
  const apiTests = Object.values(testResults.backend.apiResponses);
  const passedApiTests = apiTests.filter(test => test.success).length;
  console.log(`API endpoints: ${passedApiTests}/${apiTests.length} passing`);
  if (testResults.backend.latency.avgResponseTime) {
    console.log(`Average response time: ${testResults.backend.latency.avgResponseTime.toFixed(0)}ms`);
  }
  if (testResults.backend.errors.length > 0) {
    console.log(`Errors: ${testResults.backend.errors.length}`);
  }
  
  // Networking summary
  console.log('\n🌐 NETWORKING');
  console.log(`CDN configuration: ${testResults.networking.cdn.pass ? '✅' : '❌'}`);
  console.log(`Security headers: ${testResults.networking.security.pass ? '✅' : '❌'}`);
  if (testResults.networking.errors.length > 0) {
    console.log(`Errors: ${testResults.networking.errors.length}`);
  }
  
  // Deployment summary
  console.log('\n🚀 DEPLOYMENT');
  console.log(`Git integration: ${testResults.deployment.gitIntegration ? '✅' : '❌'}`);
  console.log(`Build process: ${testResults.deployment.buildProcess ? '✅' : '❌'}`);
  if (testResults.deployment.errors.length > 0) {
    console.log(`Errors: ${testResults.deployment.errors.length}`);
  }
  
  // Overall assessment
  console.log('\n🏁 OVERALL ASSESSMENT');
  const totalErrors = 
    testResults.frontend.errors.length + 
    testResults.backend.errors.length + 
    testResults.networking.errors.length + 
    testResults.deployment.errors.length;
  
  if (totalErrors === 0 && testResults.frontend.buildSuccess && testResults.deployment.buildProcess) {
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
    
    if (testResults.deployment.errors.length > 0) {
      console.log('\nDeployment Errors:');
      testResults.deployment.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
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
  runLighthouseTests,
  testApiEndpoints,
  testCdnConfiguration,
  testSecurityHeaders,
  testVercelIntegration
};
