#!/usr/bin/env node

/**
 * Production Deployment Script for Print-on-Demand Application
 * 
 * This script handles the complete deployment process including:
 * - Pre-flight checks
 * - Building the application
 * - Deploying to production
 * - Post-deployment verification
 * - Rollback capability
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const axios = require('axios');

// Configuration
const config = {
  productionUrl: 'https://printapp.example.com',
  s3Bucket: 'prod-printapp-bucket',
  cloudFrontDistribution: 'E1A2B3C4D5E6F7',
  healthCheckEndpoints: [
    '/api/health',
    '/api/designs/health'
  ],
  criticalPages: [
    '/',
    '/designs',
    '/publish'
  ]
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
    rl.question(`${message} (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Function to run pre-flight checks
async function runPreFlightChecks() {
  console.log('\n=== Running Pre-flight Checks ===\n');
  
  // Check for uncommitted changes
  const gitStatus = runCommand('git status --porcelain', true);
  if (gitStatus.output && gitStatus.output.trim() !== '') {
    console.error('❌ You have uncommitted changes. Please commit or stash them before deploying.');
    return false;
  }
  console.log('✅ No uncommitted changes');
  
  // Run tests
  console.log('\n> Running tests...');
  const testResult = runCommand('npm test', false);
  if (!testResult.success) {
    console.error('❌ Tests failed. Please fix failing tests before deploying.');
    return false;
  }
  console.log('✅ All tests passing');
  
  // Run linting
  console.log('\n> Running linting...');
  const lintResult = runCommand('npm run lint', false);
  if (!lintResult.success) {
    console.error('❌ Linting failed. Please fix linting issues before deploying.');
    return false;
  }
  console.log('✅ Linting passed');
  
  // Run security audit
  console.log('\n> Running security audit...');
  const auditResult = runCommand('npm audit --production', false);
  if (!auditResult.success) {
    const shouldContinue = await confirm('Security audit found issues. Continue anyway?');
    if (!shouldContinue) return false;
  } else {
    console.log('✅ Security audit passed');
  }
  
  // Check environment variables
  console.log('\n> Checking environment variables...');
  const requiredEnvVars = [
    'REACT_APP_PRINTIFY_API_URL',
    'REACT_APP_SHOPIFY_API_URL',
    'REACT_APP_API_BASE_URL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    return false;
  }
  console.log('✅ All required environment variables are set');
  
  return true;
}

// Function to build the application
async function buildApplication() {
  console.log('\n=== Building Application ===\n');
  
  // Clean build directory
  runCommand('rm -rf build');
  
  // Build the application
  const buildResult = runCommand('npm run build');
  if (!buildResult.success) {
    console.error('❌ Build failed');
    return false;
  }
  
  console.log('✅ Build successful');
  
  // Create a build info file
  const buildInfo = {
    version: require('../package.json').version,
    timestamp: new Date().toISOString(),
    commit: runCommand('git rev-parse HEAD', true).output.trim(),
    branch: runCommand('git rev-parse --abbrev-ref HEAD', true).output.trim()
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../build/build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  return true;
}

// Function to deploy to production
async function deployToProduction() {
  console.log('\n=== Deploying to Production ===\n');
  
  // Create a backup of the current deployment
  console.log('> Creating backup of current deployment...');
  const backupResult = runCommand(`aws s3 sync s3://${config.s3Bucket} s3://${config.s3Bucket}-backup-$(date +%Y%m%d%H%M%S)`);
  if (!backupResult.success) {
    const shouldContinue = await confirm('Failed to create backup. Continue anyway?');
    if (!shouldContinue) return false;
  } else {
    console.log('✅ Backup created');
  }
  
  // Deploy to S3
  console.log('> Deploying to S3...');
  const deployResult = runCommand(`aws s3 sync build/ s3://${config.s3Bucket} --delete`);
  if (!deployResult.success) {
    console.error('❌ Deployment to S3 failed');
    return false;
  }
  console.log('✅ Deployed to S3');
  
  // Invalidate CloudFront cache
  console.log('> Invalidating CloudFront cache...');
  const invalidateResult = runCommand(`aws cloudfront create-invalidation --distribution-id ${config.cloudFrontDistribution} --paths "/*"`);
  if (!invalidateResult.success) {
    console.error('⚠️ CloudFront cache invalidation failed, but deployment was successful');
  } else {
    console.log('✅ CloudFront cache invalidated');
  }
  
  return true;
}

// Function to verify deployment
async function verifyDeployment() {
  console.log('\n=== Verifying Deployment ===\n');
  
  // Wait for CloudFront to propagate changes
  console.log('> Waiting for CloudFront to propagate changes (30 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  // Check health endpoints
  console.log('> Checking health endpoints...');
  let allHealthChecksPass = true;
  
  for (const endpoint of config.healthCheckEndpoints) {
    try {
      const response = await axios.get(`${config.productionUrl}${endpoint}`);
      if (response.status === 200) {
        console.log(`✅ Health check passed for ${endpoint}`);
      } else {
        console.error(`❌ Health check failed for ${endpoint}: Status ${response.status}`);
        allHealthChecksPass = false;
      }
    } catch (error) {
      console.error(`❌ Health check failed for ${endpoint}: ${error.message}`);
      allHealthChecksPass = false;
    }
  }
  
  // Check critical pages
  console.log('\n> Checking critical pages...');
  let allPagesPass = true;
  
  for (const page of config.criticalPages) {
    try {
      const response = await axios.get(`${config.productionUrl}${page}`);
      if (response.status === 200) {
        console.log(`✅ Page check passed for ${page}`);
      } else {
        console.error(`❌ Page check failed for ${page}: Status ${response.status}`);
        allPagesPass = false;
      }
    } catch (error) {
      console.error(`❌ Page check failed for ${page}: ${error.message}`);
      allPagesPass = false;
    }
  }
  
  return allHealthChecksPass && allPagesPass;
}

// Function to rollback deployment
async function rollbackDeployment() {
  console.log('\n=== Rolling Back Deployment ===\n');
  
  // Get the latest backup
  const listResult = runCommand(`aws s3 ls s3://${config.s3Bucket}-backup-`, true);
  if (!listResult.success) {
    console.error('❌ Failed to list backups');
    return false;
  }
  
  const backups = listResult.output.trim().split('\n');
  if (backups.length === 0) {
    console.error('❌ No backups found');
    return false;
  }
  
  const latestBackup = backups[backups.length - 1].split(' ').pop();
  
  // Restore from backup
  console.log(`> Restoring from backup: ${latestBackup}`);
  const restoreResult = runCommand(`aws s3 sync s3://${config.s3Bucket}-backup-${latestBackup} s3://${config.s3Bucket} --delete`);
  if (!restoreResult.success) {
    console.error('❌ Rollback failed');
    return false;
  }
  
  // Invalidate CloudFront cache
  console.log('> Invalidating CloudFront cache...');
  const invalidateResult = runCommand(`aws cloudfront create-invalidation --distribution-id ${config.cloudFrontDistribution} --paths "/*"`);
  if (!invalidateResult.success) {
    console.error('⚠️ CloudFront cache invalidation failed, but rollback was successful');
  }
  
  console.log('✅ Rollback successful');
  return true;
}

// Main deployment function
async function deploy() {
  console.log('\n=== Print-on-Demand Production Deployment ===\n');
  
  // Get confirmation
  const confirmed = await confirm('Are you sure you want to deploy to PRODUCTION?');
  if (!confirmed) {
    console.log('Deployment cancelled');
    rl.close();
    return;
  }
  
  // Run pre-flight checks
  const preFlightPassed = await runPreFlightChecks();
  if (!preFlightPassed) {
    console.log('Pre-flight checks failed. Deployment cancelled.');
    rl.close();
    return;
  }
  
  // Build application
  const buildSuccessful = await buildApplication();
  if (!buildSuccessful) {
    console.log('Build failed. Deployment cancelled.');
    rl.close();
    return;
  }
  
  // Final confirmation
  const finalConfirmed = await confirm('Pre-flight checks passed and build successful. Proceed with deployment to PRODUCTION?');
  if (!finalConfirmed) {
    console.log('Deployment cancelled');
    rl.close();
    return;
  }
  
  // Deploy to production
  const deploySuccessful = await deployToProduction();
  if (!deploySuccessful) {
    console.log('Deployment failed.');
    rl.close();
    return;
  }
  
  // Verify deployment
  const verificationPassed = await verifyDeployment();
  if (!verificationPassed) {
    console.error('Deployment verification failed.');
    
    const shouldRollback = await confirm('Do you want to rollback to the previous version?');
    if (shouldRollback) {
      await rollbackDeployment();
    }
    
    rl.close();
    return;
  }
  
  console.log('\n=== Deployment Successful! ===\n');
  console.log(`The application is now live at: ${config.productionUrl}`);
  
  // Record deployment
  const deploymentRecord = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    commit: runCommand('git rev-parse HEAD', true).output.trim(),
    success: true
  };
  
  const deploymentLogsDir = path.join(__dirname, '../deployment-logs');
  if (!fs.existsSync(deploymentLogsDir)) {
    fs.mkdirSync(deploymentLogsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentLogsDir, `deployment-${deploymentRecord.timestamp.replace(/:/g, '-')}.json`),
    JSON.stringify(deploymentRecord, null, 2)
  );
  
  rl.close();
}

// Execute deployment
deploy().catch(error => {
  console.error('Unhandled error during deployment:', error);
  rl.close();
  process.exit(1);
});