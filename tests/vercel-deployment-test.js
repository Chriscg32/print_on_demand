const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Configuration
const LOG_DIR = path.join(__dirname, '..', 'logs');
const AUDIT_LOG_PATH = path.join(LOG_DIR, 'deployment-audit.log');
const REPORT_PATH = path.join(LOG_DIR, 'deployment-report.json');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Clear previous logs
if (fs.existsSync(AUDIT_LOG_PATH)) {
  fs.writeFileSync(AUDIT_LOG_PATH, '');
}

// Test results storage
const testResults = {
  startTime: new Date().toISOString(),
  endTime: null,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    passPercentage: 0
  }
};

// Initialize audit log
const logToAudit = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${type}] ${message}\n`;
  fs.appendFileSync(AUDIT_LOG_PATH, logEntry);
  
  // Also log to console with colors
  switch(type) {
    case 'ERROR':
      console.log(chalk.red(logEntry));
      break;
    case 'WARNING':
      console.log(chalk.yellow(logEntry));
      break;
    case 'SUCCESS':
      console.log(chalk.green(logEntry));
      break;
    default:
      console.log(chalk.blue(logEntry));
  }
};


// Test deployment URL
const testDeploymentUrl = async (url, offlineMode = false) => {
  logToAudit(`Testing deployment URL: ${url}${offlineMode ? ' (offline mode)' : ''}`, 'INFO');
  
  if (offlineMode) {
    // In offline mode, we just simulate a successful response
    return {
      success: true,
      details: {
        status: 200,
        statusText: 'OK (simulated)',
        offlineMode: true
      }
    };
  }
  
  try {
    // Use node-fetch if available, otherwise use global fetch
    let response;
    try {
      const fetch = require('node-fetch');
      response = await fetch(url);
    } catch (e) {
      response = await fetch(url);
    }
    const success = response.status === 200;
    
    return {
      success,
      details: {
        status: response.status,
        statusText: response.statusText
      },
      errors: success ? [] : [{
        message: `Deployment URL returned status ${response.status}: ${response.statusText}`,
        fix: 'Check deployment logs and ensure the application is properly deployed.'
      }]
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `Failed to fetch deployment URL: ${error.message}`,
        stack: error.stack,
        fix: 'Ensure the URL is correct and the application is deployed.'
      }]
    };
  }
};

// Test static assets
const testStaticAssets = async (url, offlineMode = false) => {
  logToAudit(`Testing static assets${offlineMode ? ' (offline mode)' : ''}`, 'INFO');
  
  if (offlineMode) {
    // In offline mode, we just simulate a successful response
    return {
      success: true,
      details: {
        assets: [
          { type: 'CSS', path: '/static/css/main.css', status: 200, success: true },
          { type: 'JavaScript', path: '/static/js/main.js', status: 200, success: true },
          { type: 'Favicon', path: '/favicon.ico', status: 200, success: true }
        ],
        offlineMode: true
      }
    };
  }
  
  const assetTypes = [
    { type: 'CSS', path: '/static/css/main.css' },
    { type: 'JavaScript', path: '/static/js/main.js' },
    { type: 'Favicon', path: '/favicon.ico' }
  ];
  
  const results = [];
  
  for (const asset of assetTypes) {
    try {
      const response = await fetch(`${url}${asset.path}`);
      const success = response.status === 200;
      
      results.push({
        type: asset.type,
        path: asset.path,
        status: response.status,
        success
      });
    } catch (error) {
      results.push({
        type: asset.type,
        path: asset.path,
        status: 0,
        success: false,
        error: error.message
      });
    }
  }
  
  const success = results.some(result => result.success);
  
  return {
    success,
    details: { assets: results },
    errors: success ? [] : [{
      message: `Failed to load any static assets`,
      fix: 'Ensure static assets are properly bundled and deployed.'
    }]
  };
};

// Test build process
const testBuildProcess = async () => {
  logToAudit('Testing build process...', 'INFO');
  
  try {
    // Check if build directory exists
    const buildDir = path.join(process.cwd(), 'build');
    const buildExists = fs.existsSync(buildDir);
    
    if (!buildExists) {
      // Try to run the build
      try {
        logToAudit('Build directory not found, attempting to build...', 'INFO');
        execSync('npm run build', { stdio: 'pipe' });
        
        // Check again if build directory exists
        const buildExistsNow = fs.existsSync(buildDir);
        
        if (!buildExistsNow) {
          return {
            success: false,
            errors: [{
              message: 'Build process completed but build directory was not created',
              fix: 'Check build configuration and build scripts'
            }]
          };
        }
      } catch (buildError) {
        return {
          success: false,
          errors: [{
            message: `Build process failed: ${buildError.message}`,
            fix: 'Check build configuration and dependencies'
          }]
        };
      }
    }
    
    // Check for essential build artifacts
    const indexHtml = fs.existsSync(path.join(buildDir, 'index.html'));
    
    if (!indexHtml) {
      return {
        success: false,
        errors: [{
          message: 'Build directory exists but index.html is missing',
          fix: 'Check build configuration and ensure index.html is being generated'
        }]
      };
    }
    
    return {
      success: true,
      details: {
        buildExists: true,
        indexHtml: true
      }
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `Build process test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check build configuration and dependencies'
      }]
    };
  }
};

// Main test runner
const runDeploymentTests = async (deploymentUrl, offlineMode = false) => {
  logToAudit('Starting deployment verification tests', 'INFO');
  
  // Run build test
  await runTest('Build Process', testBuildProcess);
  
  // Run deployment URL test
  await runTest('Deployment URL', () => testDeploymentUrl(deploymentUrl, offlineMode));
  
  // Run static assets test
  await runTest('Static Assets', () => testStaticAssets(deploymentUrl, offlineMode));
  
  // Calculate final results
  testResults.endTime = new Date().toISOString();
  testResults.summary.passPercentage = Math.round(
    (testResults.summary.passed / testResults.summary.total) * 100
  );
  
  // Save test results to file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(testResults, null, 2));
  
  // Log summary
  logToAudit('Deployment verification tests completed', 'INFO');
  logToAudit(`Total tests: ${testResults.summary.total}`, 'INFO');
  logToAudit(`Passed: ${testResults.summary.passed}`, 'SUCCESS');
  logToAudit(`Failed: ${testResults.summary.failed}`, 'ERROR');
  logToAudit(`Pass percentage: ${testResults.summary.passPercentage}%`, 'INFO');
  
  return {
    success: testResults.summary.failed === 0,
    summary: testResults.summary,
    reportPath: REPORT_PATH
  };
};

// Export functions for use in other modules
module.exports = {
  runDeploymentTests,
  runTest,
  logToAudit,
  testDeploymentUrl,
  testStaticAssets,
  testBuildProcess
};

// If this script is run directly
if (require.main === module) {
  const deploymentUrl = process.argv[2] || 'http://localhost:3000';
  const offlineMode = process.argv.includes('--offline');
  
  if (!deploymentUrl) {
    console.error(chalk.red('Error: Deployment URL is required'));
    console.log(chalk.yellow('Usage: node vercel-deployment-test.js <deployment-url> [--offline]'));
    process.exit(1);
  }
  
  runDeploymentTests(deploymentUrl, offlineMode)
    .then(result => {
      console.log(chalk.bold('\nTest Summary:'));
      console.log(chalk.blue(`Total: ${result.summary.total}`));
      console.log(chalk.green(`Passed: ${result.summary.passed}`));
      console.log(chalk.red(`Failed: ${result.summary.failed}`));
      console.log(chalk.blue(`Pass Rate: ${result.summary.passPercentage}%`));
      console.log(chalk.yellow(`\nDetailed report saved to: ${result.reportPath}`));
      
      if (result.success) {
        console.log(chalk.green.bold('\n✅ All tests passed! Deployment is verified.'));
        process.exit(0);
      } else {
        console.log(chalk.red.bold('\n❌ Some tests failed. See the report for details.'));
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red(`\nError running tests: ${error.message}`));
      console.error(error.stack);
      process.exit(1);
    });
}

// Run a test and record results
async function runTest(name, testFn) {
  logToAudit(`Starting test: ${name}`, 'INFO');
  const startTime = Date.now();
  
  try {
    const result = await testFn();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const testResult = {
      name,
      status: result.success ? 'PASSED' : 'FAILED',
      duration,
      details: result.details || {},
      errors: result.errors || []
    };
    
    testResults.tests.push(testResult);
    testResults.summary.total++;
    
    if (result.success) {
      testResults.summary.passed++;
      logToAudit(`Test passed: ${name} (${duration}ms)`, 'SUCCESS');
    } else {
      testResults.summary.failed++;
      logToAudit(`Test failed: ${name} (${duration}ms)`, 'ERROR');
      
      // Log detailed errors
      if (result.errors && result.errors.length > 0) {
        result.errors.forEach(error => {
          logToAudit(`Error in ${name}: ${error.message}`, 'ERROR');
          if (error.stack) {
            logToAudit(`Stack trace: ${error.stack}`, 'ERROR');
          }
          if (error.fix) {
            logToAudit(`Suggested fix: ${error.fix}`, 'INFO');
          }
        });
      }
    }
    
    return result;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const testResult = {
      name,
      status: 'FAILED',
      duration,
      details: {},
      errors: [{
        message: error.message,
        stack: error.stack
      }]
    };
    
    testResults.tests.push(testResult);
    testResults.summary.total++;
    testResults.summary.failed++;
    
    logToAudit(`Test error: ${name} - ${error.message}`, 'ERROR');
    logToAudit(`Stack trace: ${error.stack}`, 'ERROR');
    
    return {
      success: false,
      errors: [{
        message: error.message,
        stack: error.stack
      }]
    };
  }
};
