const { runDeploymentTests } = require('./tests/vercel-deployment-test');
const chalk = require('chalk');

/**
 * Main function to run all tests
 */
async function runAllTests() {
  console.log(chalk.blue.bold('=== Print-on-Demand Application Test Suite ==='));
  console.log(chalk.yellow('Starting tests...'));
  
  // Get deployment URL from command line or use default
  const deploymentUrl = process.argv[2] || process.env.DEPLOYMENT_URL || 'http://localhost:3000';
  
  console.log(chalk.yellow(`Testing deployment at: ${deploymentUrl}`));
  
  try {
    // Run all deployment tests
    const result = await runDeploymentTests(deploymentUrl);
    
    // Display results
    console.log(chalk.bold('\nTest Results:'));
    console.log(chalk.blue(`Total Tests: ${result.summary.total}`));
    console.log(chalk.green(`Passed: ${result.summary.passed}`));
    console.log(chalk.red(`Failed: ${result.summary.failed}`));
    console.log(chalk.blue(`Pass Rate: ${result.summary.passPercentage}%`));
    
    console.log(chalk.yellow(`\nDetailed report saved to: ${result.reportPath}`));
    
    if (result.success) {
      console.log(chalk.green.bold('\n✅ All tests passed! Your application is ready for deployment.'));
      process.exit(0);
    } else {
      console.log(chalk.red.bold('\n❌ Some tests failed. Please fix the issues before deploying.'));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\nError running tests: ${error.message}`));
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the tests
runAllTests();