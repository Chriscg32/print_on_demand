#!/usr/bin/env node

/**
 * Deployment Checklist Script for Print-on-Demand Application
 * 
 * This script runs through a series of checks to ensure the application
 * is ready for deployment.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args[0] || 'staging';
const interactive = !args.includes('--non-interactive');

// Helper function to run a command and capture output
function runCommand(command, silent = false) {
  try {
    if (!silent) {
      console.log(`\n> ${command}\n`);
    }
    
    const output = execSync(command, { encoding: 'utf8' });
    
    if (!silent) {
      console.log(output);
    }
    
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      console.error('Command failed:', error.message);
      if (error.stdout) console.error(error.stdout);
      if (error.stderr) console.error(error.stderr);
    }
    
    return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
  }
}

// Function to prompt user for confirmation
function confirm(message) {
  return new Promise((resolve) => {
    if (!interactive) {
      console.log(`${message} (Automatically answering 'y' in non-interactive mode)`);
      resolve(true);
      return;
    }
    
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Function to check if environment variables are set
function checkEnvironmentVariables() {
  console.log('\n=== Checking Environment Variables ===\n');
  
  const requiredVars = [
    'REACT_APP_PRINTIFY_API_URL',
    'REACT_APP_PRINTIFY_API_KEY',
    'REACT_APP_SHOPIFY_API_URL',
    'REACT_APP_SHOPIFY_API_KEY',
    'REACT_APP_SHOPIFY_API_PASSWORD',
    'AWS_REGION'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    return false;
  }
  
  console.log('✅ All required environment variables are set');
  return true;
}

// Function to check for uncommitted changes
function checkGitStatus() {
  console.log('\n=== Checking Git Status ===\n');
  
  const gitStatus = runCommand('git status --porcelain', true);
  if (gitStatus.output && gitStatus.output.trim() !== '') {
    console.error('❌ You have uncommitted changes:');
    console.error(gitStatus.output);
    return false;
  }
  
  console.log('✅ No uncommitted changes');
  
  // Check if we're on the right branch
  const currentBranch = runCommand('git rev-parse --abbrev-ref HEAD', true).output.trim();
  const expectedBranch = environment === 'production' ? 'main' : 'develop';
  
  if (currentBranch !== expectedBranch) {
    console.error(`❌ You are on branch '${currentBranch}' but should be on '${expectedBranch}' for ${environment} deployment`);
    return false;
  }
  
  console.log(`✅ On the correct branch (${currentBranch}) for ${environment} deployment`);
  
  // Check if we're up to date with remote
  runCommand('git fetch', true);
  const behindCount = runCommand(`git rev-list HEAD..origin/${currentBranch} --count`, true).output.trim();
  
  if (behindCount !== '0') {
    console.error(`❌ Your branch is behind origin/${currentBranch} by ${behindCount} commits`);
    return false;
  }
  
  console.log(`✅ Branch is up to date with origin/${currentBranch}`);
  
  return true;
}

// Function to run tests
async function runTests() {
  console.log('\n=== Running Tests ===\n');
  
  // Run unit tests
  console.log('> Running unit tests...');
  const unitTestResult = runCommand('npm run test:ci');
  if (!unitTestResult.success) {
    console.error('❌ Unit tests failed');
    return false;
  }
  console.log('✅ Unit tests passed');
  
  // Run integration tests
  console.log('\n> Running integration tests...');
  const integrationTestResult = runCommand('npm run test:integration');
  if (!integrationTestResult.success) {
    console.error('❌ Integration tests failed');
    return false;
  }
  console.log('✅ Integration tests passed');
  
  return true;
}

// Function to run linting
function runLinting() {
  console.log('\n=== Running Linting ===\n');
  
  const lintResult = runCommand('npm run lint');
  if (!lintResult.success) {
    console.error('❌ Linting failed');
    return false;
  }
  
  console.log('✅ Linting passed');
  return true;
}

// Function to run security audit
async function runSecurityAudit() {
  console.log('\n=== Running Security Audit ===\n');
  
  const auditResult = runCommand('npm audit --production');
  if (!auditResult.success) {
    console.error('❌ Security audit found vulnerabilities');
    
    // Check if there are high or critical vulnerabilities
    const highVulnerabilities = auditResult.stdout && auditResult.stdout.includes('High');
    const criticalVulnerabilities = auditResult.stdout && auditResult.stdout.includes('Critical');
    
    if (highVulnerabilities || criticalVulnerabilities) {
      console.error('❌ High or critical vulnerabilities found');
      
      if (interactive) {
        const shouldContinue = await confirm('Do you want to continue despite security vulnerabilities?');
        return shouldContinue;
      }
      
      return false;
    }
    
    console.warn('⚠️ Low or moderate vulnerabilities found');
    return true;
  }
  
  console.log('✅ No security vulnerabilities found');
  return true;
}

// Function to check required files
function checkRequiredFiles() {
  console.log('\n=== Checking Required Files ===\n');
  
  const requiredFiles = [
    'infrastructure/blue-green-deployment.yml',
    'scripts/blue-green-deploy.js',
    'scripts/rollback.js',
    'scripts/smoke-test.js',
    'scripts/monitor-deployment.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fileExists(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:');
    missingFiles.forEach(file => {
      console.error(`   - ${file}`);
    });
    return false;
  }
  
  console.log('✅ All required files are present');
  return true;
}

// Function to check AWS configuration
async function checkAwsConfiguration() {
  console.log('\n=== Checking AWS Configuration ===\n');
  
  try {
    const awsIdentity = runCommand('aws sts get-caller-identity', true);
    if (!awsIdentity.success) {
      console.error('❌ AWS CLI is not configured correctly');
      console.error(awsIdentity.stderr || awsIdentity.error);
      return false;
    }
    
    console.log('✅ AWS CLI is configured correctly');
    console.log(`   Account: ${JSON.parse(awsIdentity.output).Account}`);
    
    // Check if the CloudFormation stack exists
    const stackName = `printapp-blue-green-${environment}`;
    const stackCheck = runCommand(`aws cloudformation describe-stacks --stack-name ${stackName}`, true);
    
    if (!stackCheck.success) {
      console.warn(`⚠️ CloudFormation stack '${stackName}' does not exist or you don't have access to it`);
      
      if (interactive) {
        const shouldContinue = await confirm('Do you want to continue without verifying the CloudFormation stack?');
        return shouldContinue;
      }
      
      return false;
    }
    
    console.log(`✅ CloudFormation stack '${stackName}' exists`);
    return true;
  } catch (error) {
    console.error('❌ Error checking AWS configuration:', error);
    return false;
  }
}

// Function to check build process
async function checkBuildProcess() {
  console.log('\n=== Checking Build Process ===\n');  
  // Clean build directory
  if (fs.existsSync('build')) {
    console.log('> Cleaning build directory...');
    fs.rmSync('build', { recursive: true, force: true });
  }
  
  // Run build
  console.log(`> Building for ${environment}...`);
  const buildCommand = environment === 'production' ? 'npm run build:prod' : 'npm run build:staging';
  const buildResult = runCommand(buildCommand);
  
  if (!buildResult.success) {
    console.error('❌ Build failed');
    return false;
  }
  
  // Check if build directory exists and contains index.html
  if (!fs.existsSync('build') || !fs.existsSync('build/index.html')) {
    console.error('❌ Build directory is missing or incomplete');
    return false;
  }
  
  console.log('✅ Build process completed successfully');
  
  // Clean up build directory
  console.log('> Cleaning up build directory...');
  fs.rmSync('build', { recursive: true, force: true });
  
  return true;
}

// Main function to run all checks
async function runChecklist() {
  console.log(`\n=== Deployment Checklist for ${environment.toUpperCase()} ===\n`);
  
  let allChecksPassed = true;
  
  // Run all checks
  allChecksPassed = checkRequiredFiles() && allChecksPassed;
  allChecksPassed = checkGitStatus() && allChecksPassed;
  allChecksPassed = checkEnvironmentVariables() && allChecksPassed;
  allChecksPassed = await checkAwsConfiguration() && allChecksPassed;
  allChecksPassed = await runTests() && allChecksPassed;
  allChecksPassed = runLinting() && allChecksPassed;
  allChecksPassed = await runSecurityAudit() && allChecksPassed;
  allChecksPassed = await checkBuildProcess() && allChecksPassed;
  
  // Print summary
  console.log('\n=== Checklist Summary ===\n');
  
  if (allChecksPassed) {
    console.log('✅ All checks passed! The application is ready for deployment.');
    console.log(`\nTo deploy to ${environment}, run:`);
    console.log(`npm run deploy:${environment === 'production' ? 'prod' : 'staging'}`);
  } else {
    console.error('❌ Some checks failed. Please fix the issues before deploying.');
  }
  
  rl.close();
  return allChecksPassed;
}

// Run the checklist
runChecklist()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error during checklist:', error);
    process.exit(1);
  });
