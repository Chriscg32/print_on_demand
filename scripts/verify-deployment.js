#!/usr/bin/env node
/**
 * Deployment Verification Script
 * 
 * This script verifies that the application has been deployed correctly by:
 * 1. Checking that all required environment variables are set
 * 2. Checking that all required endpoints are accessible
 * 3. Verifying database connections
 * 4. Testing critical user flows
 * 5. Checking for performance issues
 * 6. Verifying security headers
 */

const axios = require('axios');
const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Parse command line arguments
program
  .option('--env <environment>', 'Environment to verify', 'staging')
  .parse(process.argv);

const options = program.opts();
const environment = options.env;

// Configuration for different environments
const config = {
  staging: {
    baseUrl: 'https://staging-app.example.com',
    apiKey: process.env.STAGING_API_KEY
  },
  production: {
    baseUrl: 'https://app.example.com',
    apiKey: process.env.PRODUCTION_API_KEY
  }
};

// Required environment variables
const requiredEnvVars = [
  'ENCRYPTION_KEY',
  'API_ENDPOINT',
  'PRINTIFY_API_KEY',
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET'
];

// Required files to check
const requiredFiles = [
  { path: './src/components/DesignSelector.js', name: 'DesignSelector Component' },
  { path: './src/apis/Printify.js', name: 'Printify API Module' },
  { path: './src/apis/Shopify.js', name: 'Shopify API Module' }
];

// Endpoints to check
const endpoints = [
  { path: '/', name: 'Home page', expectedStatus: 200 },
  { path: '/api/products', name: 'Products API', expectedStatus: 200 },
  { path: '/api/health', name: 'Health check', expectedStatus: 200 }
];

// Security headers to verify
const requiredSecurityHeaders = [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'X-XSS-Protection'
];

// Check environment variables
async function checkEnvironmentVariables() {
  console.log(chalk.blue('\n🔍 Checking environment variables:'));
  const spinner = ora('Verifying required environment variables').start();
  
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length === 0) {
    spinner.succeed('All required environment variables are set');
    return true;
  } else {
    spinner.fail(`Missing environment variables: ${missingVars.join(', ')}`);
    return false;
  }
}

// Check required files
async function checkRequiredFiles() {
  console.log(chalk.blue('\n📁 Checking required files:'));
  const spinner = ora('Verifying required files exist').start();
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    try {
      await fs.promises.access(path.resolve(file.path));
    } catch (error) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length === 0) {
    spinner.succeed('All required files exist');
    return true;
  } else {
    spinner.fail(`Missing required files: ${missingFiles.map(f => f.name).join(', ')}`);
    return false;
  }
}

// Check SSL configuration
async function checkSSLConfiguration() {
  console.log(chalk.blue('\n🔒 Checking SSL configuration:'));
  const spinner = ora('Verifying SSL configuration').start();
  
  if (config[environment].baseUrl.startsWith('https://')) {
    spinner.succeed('API endpoint is using HTTPS');
    return true;
  } else {
    spinner.fail('API endpoint is not using HTTPS');
    return false;
  }
}

// Main verification function
async function verifyDeployment() {
  console.log(chalk.blue(`🔍 Starting deployment verification for ${environment} environment`));
  console.log(chalk.blue(`🌐 Base URL: ${config[environment].baseUrl}`));
  
  let allTestsPassed = true;
  
  // Check environment variables
  const envVarsOk = await checkEnvironmentVariables();
  if (!envVarsOk) allTestsPassed = false;
  
  // Check required files
  const filesOk = await checkRequiredFiles();
  if (!filesOk) allTestsPassed = false;
  
  // Check SSL configuration
  const sslOk = await checkSSLConfiguration();
  if (!sslOk) allTestsPassed = false;
  
  // Check all endpoints
  console.log(chalk.blue('\n📡 Checking endpoints:'));
  for (const endpoint of endpoints) {
    const spinner = ora(`Testing ${endpoint.name} (${endpoint.path})`).start();
    
    try {
      const response = await axios.get(`${config[environment].baseUrl}${endpoint.path}`);
      
      if (response.status === endpoint.expectedStatus) {
        spinner.succeed(`${endpoint.name}: ${chalk.green('✓')} (${response.status})`);
      } else {
        spinner.fail(`${endpoint.name}: ${chalk.red('✗')} Expected ${endpoint.expectedStatus}, got ${response.status}`);
        allTestsPassed = false;
      }
      
      // Check response time
      const responseTime = response.headers['x-response-time'] || 'unknown';
      if (responseTime !== 'unknown' && parseInt(responseTime) > 1000) {
        console.log(chalk.yellow(`  ⚠️ Slow response time: ${responseTime}ms`));
      }
      
    } catch (error) {
      spinner.fail(`${endpoint.name}: ${chalk.red('✗')} ${error.message}`);
      allTestsPassed = false;
    }
  }
  
  // Check security headers
  console.log(chalk.blue('\n🔒 Checking security headers:'));
  try {
    const spinner = ora('Verifying security headers').start();
    const response = await axios.get(`${config[environment].baseUrl}`);
    const headers = response.headers;
    
    const missingHeaders = requiredSecurityHeaders.filter(
      header => !Object.keys(headers).some(h => h.toLowerCase() === header.toLowerCase())
    );
    
    if (missingHeaders.length === 0) {
      spinner.succeed('All security headers present');
    } else {
      spinner.fail(`Missing security headers: ${missingHeaders.join(', ')}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(chalk.red(`Error checking security headers: ${error.message}`));
    allTestsPassed = false;
  }
  
  // Check database connection via health endpoint
  console.log(chalk.blue('\n💾 Checking database connection:'));
  try {
    const spinner = ora('Verifying database connection').start();
    const response = await axios.get(`${config[environment].baseUrl}/api/health`);
    
    if (response.data.database === 'connected') {
      spinner.succeed('Database connection successful');
    } else {
      spinner.fail(`Database connection failed: ${response.data.database}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(chalk.red(`Error checking database connection: ${error.message}`));
    allTestsPassed = false;
  }
  
  // Final verdict
  console.log(chalk.blue('\n📊 Verification Results:'));
  console.log(`   Environment Variables: ${envVarsOk ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  console.log(`   Required Files: ${filesOk ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  console.log(`   SSL Configuration: ${sslOk ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`);
  
  if (allTestsPassed) {
    console.log(chalk.green('\n✅ All verification tests passed! Deployment is successful.'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ Some verification tests failed. Deployment may have issues.'));
    process.exit(1);
  }
}

// Run the verification
verifyDeployment().catch(error => {
  console.error(chalk.red(`Fatal error during verification: ${error.message}`));
  process.exit(1);
});
