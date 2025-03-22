#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * This script runs all tests in the application and generates a detailed report.
 * It checks:
 * 1. Unit tests
 * 2. Component tests
 * 3. Integration tests
 * 4. Linting
 * 5. Type checking (if TypeScript is used)
 * 6. Bundle size analysis
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Check if chalk is installed, if not, install it
try {
  require.resolve('chalk');
} catch (e) {
  console.log('Installing chalk package...');
  execSync('npm install --no-save chalk');
}

// Configuration
const rootDir = process.cwd();
const testResults = {
  unit: { passed: 0, failed: 0, skipped: 0 },
  component: { passed: 0, failed: 0, skipped: 0 },
  integration: { passed: 0, failed: 0, skipped: 0 },
  linting: { passed: 0, failed: 0, skipped: 0 },
  typeChecking: { passed: 0, failed: 0, skipped: 0 },
  bundleSize: { passed: 0, failed: 0, skipped: 0 }
};

/**
 * Run a command and return the output
 */
function runCommand(command, options = {}) {
  console.log(chalk.blue(`\n> ${command}\n`));
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    
    return { success: true, output };
  } catch (error) {
    if (!options.ignoreError) {
      console.error(chalk.red('Command failed:'), error.message);
    }
    
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Check if a package is installed
 */
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName, { paths: [rootDir] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Run Jest tests
 */
function runJestTests() {
  console.log(chalk.yellow('\n=== Running Jest Tests ==='));
  
  // Check if Jest is installed
  if (!isPackageInstalled('jest')) {
    console.log(chalk.yellow('Jest is not installed. Skipping tests.'));
    testResults.unit.skipped = 1;
    testResults.component.skipped = 1;
    return;
  }
  
  // Run unit tests
  console.log(chalk.yellow('\n--- Running Unit Tests ---'));
  const unitTestResult = runCommand('npx jest --testPathPattern=src/.*\\.test\\.(js|jsx|ts|tsx)$ --testPathIgnorePatterns=src/components --testPathIgnorePatterns=src/integration', { silent: true, ignoreError: true });
  
  if (unitTestResult.success) {
    console.log(chalk.green('✓ Unit tests passed'));
    testResults.unit.passed = 1;
  } else {
    console.log(chalk.red('✗ Unit tests failed'));
    console.log(unitTestResult.stdout || unitTestResult.stderr);
    testResults.unit.failed = 1;
  }
  
  // Run component tests
  console.log(chalk.yellow('\n--- Running Component Tests ---'));
  const componentTestResult = runCommand('npx jest --testPathPattern=src/components/.*\\.test\\.(js|jsx|ts|tsx)$', { silent: true, ignoreError: true });
  
  if (componentTestResult.success) {
    console.log(chalk.green('✓ Component tests passed'));
    testResults.component.passed = 1;
  } else {
    console.log(chalk.red('✗ Component tests failed'));
    console.log(componentTestResult.stdout || componentTestResult.stderr);
    testResults.component.failed = 1;
  }
  
  // Run integration tests
  console.log(chalk.yellow('\n--- Running Integration Tests ---'));
  const integrationTestResult = runCommand('npx jest --testPathPattern=src/integration/.*\\.test\\.(js|jsx|ts|tsx)$', { silent: true, ignoreError: true });
  
  if (integrationTestResult.success) {
    console.log(chalk.green('✓ Integration tests passed'));
    testResults.integration.passed = 1;
  } else if (integrationTestResult.stdout && integrationTestResult.stdout.includes('No tests found')) {
    console.log(chalk.yellow('No integration tests found. Skipping.'));
    testResults.integration.skipped = 1;
  } else {
    console.log(chalk.red('✗ Integration tests failed'));
    console.log(integrationTestResult.stdout || integrationTestResult.stderr);
    testResults.integration.failed = 1;
  }
}

/**
 * Run ESLint
 */
function runLinting() {
  console.log(chalk.yellow('\n=== Running ESLint ==='));
  
  // Check if ESLint is installed
  if (!isPackageInstalled('eslint')) {
    console.log(chalk.yellow('ESLint is not installed. Skipping linting.'));
    testResults.linting.skipped = 1;
    return;
  }
  
  const lintResult = runCommand('npx eslint src/**/*.{js,jsx,ts,tsx}', { silent: true, ignoreError: true });
  
  if (lintResult.success) {
    console.log(chalk.green('✓ Linting passed'));
    testResults.linting.passed = 1;
  } else {
    console.log(chalk.red('✗ Linting failed'));
    console.log(lintResult.stdout || lintResult.stderr);
    testResults.linting.failed = 1;
    
    // Try to fix linting issues
    console.log(chalk.yellow('\nAttempting to fix linting issues...'));
    const fixResult = runCommand('npx eslint src/**/*.{js,jsx,ts,tsx} --fix', { silent: true, ignoreError: true });
    
    if (fixResult.success) {
      console.log(chalk.green('✓ Fixed some linting issues'));
    } else {
      console.log(chalk.yellow('Could not fix all linting issues automatically'));
    }
  }
}

/**
 * Run TypeScript type checking
 */
function runTypeChecking() {
  console.log(chalk.yellow('\n=== Running Type Checking ==='));
  
  // Check if TypeScript is installed
  if (!isPackageInstalled('typescript')) {
    console.log(chalk.yellow('TypeScript is not installed. Skipping type checking.'));
    testResults.typeChecking.skipped = 1;
    return;
  }
  
  // Check if tsconfig.json exists
  if (!fileExists(path.join(rootDir, 'tsconfig.json'))) {
    console.log(chalk.yellow('tsconfig.json not found. Skipping type checking.'));
    testResults.typeChecking.skipped = 1;
    return;
  }
  
  const typeCheckResult = runCommand('npx tsc --noEmit', { silent: true, ignoreError: true });
  
  if (typeCheckResult.success) {
    console.log(chalk.green('✓ Type checking passed'));
    testResults.typeChecking.passed = 1;
  } else {
    console.log(chalk.red('✗ Type checking failed'));
    console.log(typeCheckResult.stdout || typeCheckResult.stderr);
    testResults.typeChecking.failed = 1;
  }
}

/**
 * Analyze bundle size
 */
function analyzeBundleSize() {
  console.log(chalk.yellow('\n=== Analyzing Bundle Size ==='));
  
  // Check if source-map-explorer is installed
  if (!isPackageInstalled('source-map-explorer')) {
    console.log(chalk.yellow('source-map-explorer is not installed. Installing...'));
    runCommand('npm install --no-save source-map-explorer', { silent: true });
  }
  
  // Check if build directory exists
  if (!fileExists(path.join(rootDir, 'build'))) {
    console.log(chalk.yellow('Build directory not found. Running build...'));
    const buildResult = runCommand('npm run build', { silent: true, ignoreError: true });
    
    if (!buildResult.success) {
      console.log(chalk.red('✗ Build failed. Cannot analyze bundle size.'));
      console.log(buildResult.stdout || buildResult.stderr);
      testResults.bundleSize.failed = 1;
      return;
    }
  }
  
  // Check if JS files exist in build directory
  const jsFiles = path.join(rootDir, 'build/static/js/*.js');
  const analyzeResult = runCommand(`npx source-map-explorer ${jsFiles} --html bundle-analysis.html`, { silent: true, ignoreError: true });
  
  if (analyzeResult.success) {
    console.log(chalk.green('✓ Bundle analysis completed'));
    console.log(chalk.blue('Bundle analysis report saved to bundle-analysis.html'));
    testResults.bundleSize.passed = 1;
    
    // Check for large bundles
    const output = analyzeResult.output;
    if (output && output.includes('> 500 KB')) {
      console.log(chalk.yellow('⚠ Warning: Some bundles are larger than 500 KB. Consider code splitting.'));
    }
  } else {
    console.log(chalk.red('✗ Bundle analysis failed'));
    console.log(analyzeResult.stdout || analyzeResult.stderr);
    testResults.bundleSize.failed = 1;
  }
}

/**
 * Generate test report
 */
function generateReport() {
  console.log(chalk.green('\n=== Test Report ==='));
  
  const totalPassed = Object.values(testResults).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, result) => sum + result.failed, 0);
  const totalSkipped = Object.values(testResults).reduce((sum, result) => sum + result.skipped, 0);
  
  console.log(chalk.green(`Passed: ${totalPassed}`));
  console.log(chalk.red(`Failed: ${totalFailed}`));
  console.log(chalk.yellow(`Skipped: ${totalSkipped}`));
  
  console.log('\nDetailed Results:');
  console.log('----------------');
  
  for (const [category, result] of Object.entries(testResults)) {
    const status = result.failed > 0 ? chalk.red('✗ FAILED') : 
                  result.skipped > 0 ? chalk.yellow('⚠ SKIPPED') : 
                  chalk.green('✓ PASSED');
    
    console.log(`${category}: ${status}`);
  }
  
  // Save report to file
  const reportContent = `
# Test Report

Generated: ${new Date().toISOString()}

## Summary
- Passed: ${totalPassed}
- Failed: ${totalFailed}
- Skipped: ${totalSkipped}

## Detailed Results

${Object.entries(testResults).map(([category, result]) => {
  const status = result.failed > 0 ? '❌ FAILED' : 
                result.skipped > 0 ? '⚠️ SKIPPED' : 
                '✅ PASSED';
  return `### ${category}\n${status}`;
}).join('\n\n')}
`;

  fs.writeFileSync(path.join(rootDir, 'test-report.md'), reportContent);
  console.log(chalk.blue('\nTest report saved to test-report.md'));
  
  // Return exit code based on test results
  return totalFailed > 0 ? 1 : 0;
}

/**
 * Main function
 */
function main() {
  console.log(chalk.green('=== Starting Comprehensive Test Suite ==='));
  
  runJestTests();
  runLinting();
  runTypeChecking();
  analyzeBundleSize();
  
  const exitCode = generateReport();
  
  if (exitCode === 0) {
    console.log(chalk.green('\n✓ All tests passed! Ready for deployment.'));
  } else {
    console.log(chalk.red('\n✗ Some tests failed. Please fix the issues before deploying.'));
  }
  
  process.exit(exitCode);
}

// Run the main function
main();