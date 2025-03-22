#!/usr/bin/env node

/**
 * Blue-Green Deployment Script for Print-on-Demand Application
 * 
 * This script handles the deployment process using a blue-green strategy:
 * 1. Determines the inactive environment (blue or green)
 * 2. Builds and deploys the application to the inactive environment
 * 3. Runs verification tests on the inactive environment
 * 4. Switches traffic to the newly deployed environment
 * 5. Verifies the new active environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const axios = require('axios');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args[0] || 'staging';
const skipTests = args.includes('--skip-tests');
const skipVerification = args.includes('--skip-verification');
const autoSwitch = args.includes('--auto-switch');

// Configure AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const ssm = new AWS.SSM();
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();
const lambda = new AWS.Lambda();

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

// Function to get the current active environment
async function getActiveEnvironment() {
  try {
    const paramName = `/${environment}/printapp/active-environment`;
    const result = await ssm.getParameter({ Name: paramName }).promise();
    return result.Parameter.Value; // 'blue' or 'green'
  } catch (error) {
    console.error('Error getting active environment:', error);
    throw error;
  }
}

// Function to get the inactive environment
async function getInactiveEnvironment() {
  const active = await getActiveEnvironment();
  return active === 'blue' ? 'green' : 'blue';
}

// Function to get bucket name for an environment
function getBucketName(envColor) {
  return `${environment}-${envColor}-printapp-bucket`;
}

// Function to get CloudFront distribution ID
async function getCloudFrontDistributionId() {
  try {
    const paramName = `/${environment}/printapp/cloudfront-distribution-id`;
    const result = await ssm.getParameter({ Name: paramName }).promise();
    return result.Parameter.Value;
  } catch (error) {
    console.error('Error getting CloudFront distribution ID:', error);
    throw error;
  }
}

// Function to build the application
async function buildApplication() {
  console.log('\n=== Building Application ===\n');
  
  // Clean build directory
  runCommand('rm -rf build');
  
  // Set environment variables for the build
  process.env.REACT_APP_ENVIRONMENT = environment;
  
  // Build the application
  const buildCommand = environment === 'production' 
    ? 'npm run build:prod' 
    : 'npm run build:staging';
  
  const buildResult = runCommand(buildCommand);
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
    branch: runCommand('git rev-parse --abbrev-ref HEAD', true).output.trim(),
    environment: environment
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../build/build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  return true;
}

// Function to run tests
async function runTests() {
  if (skipTests) {
    console.log('\n=== Skipping Tests ===\n');
    return true;
  }
  
  console.log('\n=== Running Tests ===\n');
  
  // Run unit tests
  const unitTestResult = runCommand('npm test');
  if (!unitTestResult.success) {
    console.error('❌ Unit tests failed');
    return false;
  }
  
  // Run integration tests
  const integrationTestResult = runCommand('npm run test:integration');
  if (!integrationTestResult.success) {
    console.error('❌ Integration tests failed');
    return false;
  }
  
  console.log('✅ All tests passed');
  return true;
}

// Function to deploy to an environment
async function deployToEnvironment(envColor) {
  const bucketName = getBucketName(envColor);
  console.log(`\n=== Deploying to ${envColor} environment (${bucketName}) ===\n`);
  
  // Deploy to S3
  console.log(`> Deploying to S3 bucket: ${bucketName}...`);
  const deployResult = runCommand(`aws s3 sync build/ s3://${bucketName} --delete`);
  if (!deployResult.success) {
    console.error(`❌ Deployment to ${envColor} environment failed`);
    return false;
  }
  
  console.log(`✅ Deployed to ${envColor} environment`);
  return true;
}

// Function to verify deployment
async function verifyDeployment(envColor) {
  if (skipVerification) {
    console.log('\n=== Skipping Verification ===\n');
    return true;
  }
  
  console.log(`\n=== Verifying Deployment in ${envColor} environment ===\n`);
  
  // Get the URL for the environment
  const bucketName = getBucketName(envColor);
  const bucketUrl = `http://${bucketName}.s3-website-${AWS.config.region}.amazonaws.com`;
  
  // Check if the application loads
  console.log(`> Checking if application loads at ${bucketUrl}...`);
  try {
    const response = await axios.get(bucketUrl);
    if (response.status !== 200) {
      console.error(`❌ Application failed to load: Status ${response.status}`);
      return false;
    }
    console.log('✅ Application loads successfully');
  } catch (error) {
    console.error('❌ Application failed to load:', error.message);
    return false;
  }
  
  // Run smoke tests
  console.log('> Running smoke tests...');
  const smokeTestResult = runCommand(`npm run test:smoke -- --url=${bucketUrl}`);
  if (!smokeTestResult.success) {
    console.error('❌ Smoke tests failed');
    return false;
  }
  
  console.log('✅ Verification successful');
  return true;
}

// Function to switch traffic to the new environment
async function switchEnvironment(newEnvColor) {
  console.log(`\n=== Switching Traffic to ${newEnvColor} Environment ===\n`);
  
  // Get the CloudFront distribution ID
  const distributionId = await getCloudFrontDistributionId();
  
  // Invoke the Lambda function to switch environments
  console.log('> Invoking environment switch function...');
  try {
    const params = {
      FunctionName: `${environment}-printapp-switch-environment`,
      Payload: JSON.stringify({ environment })
    };
    
    const result = await lambda.invoke(params).promise();
    
    if (result.FunctionError) {
      console.error('❌ Environment switch failed:', result.Payload);
      return false;
    }
    
    console.log('✅ Environment switch initiated');
    
    // Wait for CloudFront distribution to be deployed
    console.log('> Waiting for CloudFront distribution to be deployed...');
    let isDeployed = false;
    let attempts = 0;
    
    while (!isDeployed && attempts < 30) {
      const distribution = await cloudfront.getDistribution({ Id: distributionId }).promise();
      isDeployed = distribution.Distribution.Status === 'Deployed';
      
      if (!isDeployed) {
        console.log(`CloudFront status: ${distribution.Distribution.Status}, waiting 30 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 30000));
        attempts++;
      }
    }
    
    if (!isDeployed) {
      console.error('❌ CloudFront distribution deployment timed out');
      return false;
    }
    
    console.log('✅ CloudFront distribution deployed');
    return true;
  } catch (error) {
    console.error('❌ Environment switch failed:', error);
    return false;
  }
}

// Function to verify the new active environment
async function verifyActiveEnvironment() {
  if (skipVerification) {
    console.log('\n=== Skipping Active Environment Verification ===\n');
    return true;
  }
  
  console.log('\n=== Verifying New Active Environment ===\n');
  
  // Get the domain name
  const domainName = environment === 'production' 
    ? 'printapp.example.com' 
    : `${environment}.printapp.example.com`;
  
  // Check if the application loads
  console.log(`> Checking if application loads at https://${domainName}...`);
  try {
    const response = await axios.get(`https://${domainName}`);
    if (response.status !== 200) {
      console.error(`❌ Application failed to load: Status ${response.status}`);
      return false;
    }
    console.log('✅ Application loads successfully');
  } catch (error) {
    console.error('❌ Application failed to load:', error.message);
    return false;
  }
  
  // Run smoke tests
  console.log('> Running smoke tests on active environment...');
  const smokeTestResult = runCommand(`npm run test:smoke -- --url=https://${domainName}`);
  if (!smokeTestResult.success) {
    console.error('❌ Smoke tests failed on active environment');
    return false;
  }
  
  console.log('✅ Active environment verification successful');
  return true;
}

// Main deployment function
async function deploy() {
  console.log(`\n=== Print-on-Demand ${environment.toUpperCase()} Deployment ===\n`);
  
  try {
    // Get the inactive environment
    const inactiveEnv = await getInactiveEnvironment();
    console.log(`Current active environment: ${await getActiveEnvironment()}`);
    console.log(`Target deployment environment: ${inactiveEnv}`);
    
    // Get confirmation
    const confirmed = await confirm(`Are you sure you want to deploy to the ${inactiveEnv} environment?`);
    if (!confirmed) {
      console.log('Deployment cancelled');
      rl.close();
      return;
    }
    
    // Run tests
    const testsPass = await runTests();
    if (!testsPass) {
      const proceedAnyway = await confirm('Tests failed. Do you want to proceed anyway?');
      if (!proceedAnyway) {
        console.log('Deployment cancelled due to test failures');
        rl.close();
        return;
      }
    }
    
    // Build application
    const buildSuccessful = await buildApplication();
    if (!buildSuccessful) {
      console.log('Deployment cancelled due to build failure');
      rl.close();
      return;
    }
    
    // Deploy to inactive environment
    const deploySuccessful = await deployToEnvironment(inactiveEnv);
    if (!deploySuccessful) {
      console.log(`Deployment to ${inactiveEnv} environment failed`);
      rl.close();
      return;
    }
    
    // Verify deployment
    const verificationPassed = await verifyDeployment(inactiveEnv);
    if (!verificationPassed) {
      const proceedAnyway = await confirm('Verification failed. Do you want to proceed with the switch anyway?');
      if (!proceedAnyway) {
        console.log('Deployment cancelled due to verification failure');
        rl.close();
        return;
      }
    }
    
    // Get confirmation for the switch
    const switchConfirmed = autoSwitch || await confirm(`Do you want to switch traffic to the ${inactiveEnv} environment?`);
    if (!switchConfirmed) {
      console.log('Environment switch cancelled');
      console.log(`The application has been deployed to the ${inactiveEnv} environment but is not receiving traffic.`);
      rl.close();
      return;
    }
    
    // Switch to the new environment
    const switchSuccessful = await switchEnvironment(inactiveEnv);
    if (!switchSuccessful) {
      console.log('Environment switch failed');
      rl.close();
      return;
    }
    
    // Verify the new active environment
    const activeVerificationPassed = await verifyActiveEnvironment();
    if (!activeVerificationPassed) {
      console.error('Active environment verification failed');
      const rollback = await confirm('Do you want to rollback to the previous environment?');
      if (rollback) {
        console.log('Initiating rollback...');
        await switchEnvironment(await getActiveEnvironment());
      }
      rl.close();
      return;
    }
    
    console.log('\n=== Deployment Successful! ===\n');
    console.log(`The application has been successfully deployed to the ${inactiveEnv} environment and is now receiving traffic.`);
    
    // Record deployment
    const deploymentRecord = {
      timestamp: new Date().toISOString(),
      environment: environment,
      deployedTo: inactiveEnv,
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
  } catch (error) {
    console.error('Deployment failed:', error);
  } finally {
    rl.close();
  }
}

// Execute deployment
deploy().catch(error => {
  console.error('Unhandled error during deployment:', error);
  rl.close();
  process.exit(1);
});