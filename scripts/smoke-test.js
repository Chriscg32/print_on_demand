#!/usr/bin/env node

/**
 * Smoke Test Script for Print-on-Demand Application
 * 
 * This script runs basic smoke tests against a deployed environment to verify:
 * 1. The application loads correctly
 * 2. Critical pages are accessible
 * 3. API endpoints are responding
 * 4. Basic functionality works
 */

const puppeteer = require('puppeteer');
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    description: 'Base URL to test',
    type: 'string',
    default: 'https://staging.printapp.example.com'
  })
  .option('headless', {
    alias: 'h',
    description: 'Run in headless mode',
    type: 'boolean',
    default: true
  })
  .option('timeout', {
    alias: 't',
    description: 'Timeout in milliseconds',
    type: 'number',
    default: 30000
  })
  .option('verbose', {
    alias: 'v',
    description: 'Verbose output',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// Critical pages to test
const criticalPages = [
  '/',                  // Home page
  '/designs',           // Designs page
  '/publish',           // Publish page
  '/account',           // Account page
  '/about',             // About page
  '/contact'            // Contact page
];

// API endpoints to test
const apiEndpoints = [
  '/api/health',                // Health check endpoint
  '/api/designs/trending',      // Trending designs endpoint
  '/api/templates/categories'   // Template categories endpoint
];

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  failures: []
};

// Helper function to log with timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '';
  
  if (type === 'error') {
    console.error(`[${timestamp}] ${prefix}${message}`);
  } else if (argv.verbose || type === 'success' || type === 'error') {
    console.log(`[${timestamp}] ${prefix}${message}`);
  }
}

// Helper function to record test result
function recordResult(name, passed, error = null) {
  results.total++;
  
  if (passed) {
    results.passed++;
    log(`PASS: ${name}`, 'success');
  } else {
    results.failed++;
    log(`FAIL: ${name}`, 'error');
    results.failures.push({ name, error: error ? error.toString() : 'Unknown error' });
  }
}

// Test if a page loads correctly
async function testPageLoad(page, url, name) {
  try {
    log(`Testing page load: ${name} (${url})`, 'info');
    
    // Navigate to the page
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: argv.timeout
    });
    
    // Check if the page loaded successfully
    if (!response.ok()) {
      throw new Error(`Page returned status ${response.status()}`);
    }
    
    // Check if the page has expected content
    const title = await page.title();
    log(`Page title: ${title}`, 'info');
    
    // Check for error messages on the page
    const errorText = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error-message, .error, [role="alert"]');
      return Array.from(errorElements).map(el => el.textContent).join(', ');
    });
    
    if (errorText) {
      throw new Error(`Page contains error messages: ${errorText}`);
    }
    
    recordResult(`Page Load: ${name}`, true);
    return true;
  } catch (error) {
    recordResult(`Page Load: ${name}`, false, error);
    return false;
  }
}

// Test if an API endpoint responds correctly
async function testApiEndpoint(endpoint, name) {
  try {
    const url = `${argv.url}${endpoint}`;
    log(`Testing API endpoint: ${name} (${url})`, 'info');
    
    const response = await axios.get(url, { 
      timeout: argv.timeout,
      validateStatus: false
    });
    
    // Check if the API responded successfully
    if (response.status < 200 || response.status >= 300) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    // Check if the response has the expected format
    if (!response.data) {
      throw new Error('API response is empty');
    }
    
    recordResult(`API Endpoint: ${name}`, true);
    return true;
  } catch (error) {
    recordResult(`API Endpoint: ${name}`, false, error);
    return false;
  }
}

// Test basic functionality
async function testBasicFunctionality(page) {
  try {
    log('Testing basic functionality: Design selection', 'info');
    
    // Navigate to the designs page
    await page.goto(`${argv.url}/designs`, { 
      waitUntil: 'networkidle2',
      timeout: argv.timeout
    });
    
    // Wait for designs to load
    await page.waitForSelector('.design-card', { timeout: argv.timeout });
    
    // Select a design
    await page.click('.design-card:first-child .select-button');
    
    // Check if the design was selected
    const isSelected = await page.evaluate(() => {
      const button = document.querySelector('.design-card:first-child .select-button');
      return button.textContent.includes('Selected');
    });
    
    if (!isSelected) {
      throw new Error('Design selection failed');
    }
    
    recordResult('Basic Functionality: Design selection', true);
    return true;
  } catch (error) {
    recordResult('Basic Functionality: Design selection', false, error);
    return false;
  }
}

// Main test function
async function runTests() {
  log(`Starting smoke tests against ${argv.url}`, 'info');
  log(`Running in ${argv.headless ? 'headless' : 'visible'} mode`, 'info');
  
  const browser = await puppeteer.launch({ 
    headless: argv.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set timeout
    page.setDefaultTimeout(argv.timeout);
    
    // Test critical pages
    for (const path of criticalPages) {
      await testPageLoad(page, `${argv.url}${path}`, path);
    }
    
    // Test API endpoints
    for (const endpoint of apiEndpoints) {
      await testApiEndpoint(endpoint, endpoint);
    }
    
    // Test basic functionality
    await testBasicFunctionality(page);
    
    // Print test summary
    log('\n=== Test Summary ===', 'info');
    log(`Total tests: ${results.total}`, 'info');
    log(`Passed: ${results.passed}`, 'success');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'info');
    log(`Skipped: ${results.skipped}`, 'info');
    
    if (results.failures.length > 0) {
      log('\n=== Failures ===', 'error');
      results.failures.forEach((failure, index) => {
        log(`${index + 1}. ${failure.name}`, 'error');
        log(`   Error: ${failure.error}`, 'error');
      });
    }
    
    // Return exit code based on test results
    return results.failed === 0;
  } finally {
    await browser.close();
  }
}

// Run the tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`Unhandled error: ${error}`, 'error');
    process.exit(1);
  });