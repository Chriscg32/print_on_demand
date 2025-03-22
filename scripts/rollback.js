#!/usr/bin/env node

/**
 * Rollback Script for Print-on-Demand Application
 * 
 * This script handles the rollback process for the blue-green deployment:
 * 1. Switches traffic back to the previous environment
 * 2. Verifies the rollback was successful
 * 3. Records the rollback in the deployment logs
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
const skipVerification = args.includes('--skip-verification');
const force = args.includes('--force');

// Configure AWS SDK
AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });
const ssm = new AWS.SSM();
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

// Function to get the previous environment
async function getPreviousEnvironment() {
  try {
    // Get the current active environment
    const active = await getActiveEnvironment();
    
    // Get the previous environment from deployment logs
    const deploymentLogsDir = path.join(__dirname, '../deployment-logs');
    if (!fs.existsSync(deploymentLogsDir)) {
      console.error('Deployment logs directory not found');
      return active === 'blue' ? 'green' : 'blue'; // Fallback to opposite environment
    }
    
    // Get all deployment logs
    const files = fs.readdirSync(deploymentLogsDir)
      .filter(file => file.startsWith('deployment-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length < 2) {
      console.error('Not enough deployment logs to determine previous environment');
      return active === 'blue' ? 'green' : 'blue'; // Fallback to opposite environment
    }
    
    // Get the previous successful deployment
    for (const file of files) {
      const deploymentLog = JSON.parse(fs.readFileSync(path.join(deploymentLogsDir, file), 'utf8'));
      if (deploymentLog.success && deploymentLog.deployedTo !== active) {
        return deploymentLog.deployedTo;
      }
    }
    
    // Fallback to opposite environment if no previous deployment found
    return active === 'blue' ? 'green' : 'blue';
  } catch (error) {
    console.error('Error getting previous environment:', error);
    throw error;
  }
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

// Function to switch traffic to the previous environment
async function switchToPreviousEnvironment(previousEnv) {
  console.log(`\n=== Switching Traffic Back to ${previousEnv} Environment ===\n`);
  
  // Invoke the Lambda function to switch environments
  console.log('> Invoking environment switch function...');
  try {
    const params = {
      FunctionName: `${environment}-printapp-switch-environment`,
      Payload: JSON.stringify({ 
        environment,
        targetEnvironment: previousEnv // Explicitly specify the target
      })
    };
    
    const result = await lambda.invoke(params).promise();
    
    if (result.FunctionError) {
      console.error('❌ Environment switch failed:', result.Payload);
      return false;
    }
    
    console.log('✅ Environment switch initiated');
    
    // Wait for CloudFront distribution to be deployed
    console.log('> Waiting for CloudFront distribution to be deployed...');
    const distributionId = await getCloudFrontDistributionId();
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
    
    // Update SSM parameter to reflect the rollback
    await ssm.putParameter({
      Name: `/${environment}/printapp/active-environment`,
      Value: previousEnv,
      Type: 'String',
      Overwrite: true
    }).promise();
    
    return true;
  } catch (error) {
    console.error('❌ Environment switch failed:', error);
    return false;
  }
}

// Function to verify the rollback
async function verifyRollback() {
  if (skipVerification) {
    console.log('\n=== Skipping Rollback Verification ===\n');
    return true;
  }
  
  console.log('\n=== Verifying Rollback ===\n');
  
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
  console.log('> Running smoke tests on rolled back environment...');
  const smokeTestResult = runCommand(`npm run test:smoke -- --url=https://${domainName}`);
  if (!smokeTestResult.success) {
    console.error('❌ Smoke tests failed on rolled back environment');
    return false;
  }
  
  console.log('✅ Rollback verification successful');
  return true;
}

// Main rollback function
async function rollback() {
  console.log(`\n=== Print-on-Demand ${environment.toUpperCase()} Rollback ===\n`);
  
  try {
    // Get the current active environment
    const activeEnv = await getActiveEnvironment();
    console.log(`Current active environment: ${activeEnv}`);
    
    // Get the previous environment
    const previousEnv = await getPreviousEnvironment();
    console.log(`Previous environment: ${previousEnv}`);
    
    if (activeEnv === previousEnv) {
      console.error('❌ Current and previous environments are the same. Cannot rollback.');
      if (!force) {
        rl.close();
        return;
      }
      console.log('Proceeding with rollback due to --force flag...');
    }
    
    // Get confirmation
    const confirmed = force || await confirm(`Are you sure you want to rollback to the ${previousEnv} environment?`);
    if (!confirmed) {
      console.log('Rollback cancelled');
      rl.close();
      return;
    }
    
    // Switch to the previous environment
    const switchSuccessful = await switchToPreviousEnvironment(previousEnv);
    if (!switchSuccessful) {
      console.error('❌ Rollback failed: Could not switch to previous environment');
      rl.close();
      return;
    }
    
    // Verify the rollback
    const verificationPassed = await verifyRollback();
    if (!verificationPassed) {
      console.error('❌ Rollback verification failed');
      console.error('The traffic has been switched to the previous environment, but verification failed.');
      console.error('Please check the application manually.');
      rl.close();
      return;
    }
    
    console.log('\n=== Rollback Successful! ===\n');
    console.log(`The application has been successfully rolled back to the ${previousEnv} environment.`);
    
    // Record rollback
    const rollbackRecord = {
      timestamp: new Date().toISOString(),
      environment: environment,
      rolledBackTo: previousEnv,
      rolledBackFrom: activeEnv,
      version: require('../package.json').version,
      commit: runCommand('git rev-parse HEAD', true).output.trim(),
      success: true
    };
    
    const deploymentLogsDir = path.join(__dirname, '../deployment-logs');
    if (!fs.existsSync(deploymentLogsDir)) {
      fs.mkdirSync(deploymentLogsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(deploymentLogsDir, `rollback-${rollbackRecord.timestamp.replace(/:/g, '-')}.json`),
      JSON.stringify(rollbackRecord, null, 2)
    );
  } catch (error) {
    console.error('Rollback failed:', error);
  } finally {
    rl.close();
  }
}

// Execute rollback
rollback().catch(error => {
  console.error('Unhandled error during rollback:', error);
  rl.close();
  process.exit(1);
});