#!/usr/bin/env node

/**
 * Vercel Deployment Helper Script
 * 
 * This script helps prepare and deploy the application to Vercel.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = path.resolve(__dirname, '..');

/**
 * Run a command and return the output
 */
function runCommand(command, options = {}) {
  console.log(`> ${command}`);
  
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
      console.error('Command failed:', error.message);
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
 * Prepare for deployment
 */
function prepareForDeployment() {
  console.log('\n=== Preparing for Vercel Deployment ===');
  
  // Check for vercel.json
  if (!fileExists(path.join(rootDir, 'vercel.json'))) {
    console.log('vercel.json not found. Creating...');
    
    const vercelConfig = {
      "version": 2,
      "builds": [
        {
          "src": "package.json",
          "use": "@vercel/static-build",
          "config": {
            "distDir": "build"
          }
        }
      ],
      "routes": [
        {
          "src": "/static/(.*)",
          "headers": {
            "cache-control": "public, max-age=31536000, immutable"
          },
          "continue": true
        },
        {
          "src": "/assets/(.*)",
          "headers": {
            "cache-control": "public, max-age=31536000, immutable"
          },
          "continue": true
        },
        {
          "src": "/favicon.ico",
          "headers": {
            "cache-control": "public, max-age=86400"
          },
          "continue": true
        },
        {
          "src": "/manifest.json",
          "headers": {
            "cache-control": "public, max-age=86400"
          },
          "continue": true
        },
        {
          "src": "/(.*)",
          "dest": "/index.html"
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(rootDir, 'vercel.json'),
      JSON.stringify(vercelConfig, null, 2)
    );
    
    console.log('Created vercel.json');
  }
  
  // Check for .vercelignore
  if (!fileExists(path.join(rootDir, '.vercelignore'))) {
    console.log('.vercelignore not found. Creating...');
    
    const vercelIgnore = `
# Vercel ignore file
node_modules
.git
.github
.vscode
coverage
*.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`;
    
    fs.writeFileSync(path.join(rootDir, '.vercelignore'), vercelIgnore.trim());
    
    console.log('Created .vercelignore');
  }
  
  // Check for .env.example
  if (!fileExists(path.join(rootDir, '.env.example'))) {
    console.log('.env.example not found. Creating...');
    
    const envExample = `
# API Configuration
REACT_APP_PRINTIFY_API_URL=https://api.printify.com/v1
REACT_APP_PRINTIFY_API_KEY=your_printify_api_key_here

REACT_APP_SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
REACT_APP_SHOPIFY_API_KEY=your_shopify_api_key_here

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_MARKETING=false

# Performance Settings
REACT_APP_IMAGE_OPTIMIZATION=true
REACT_APP_MAX_DESIGNS_PER_PAGE=20

# Development Settings
REACT_APP_USE_MOCK_DATA=true
`;
    
    fs.writeFileSync(path.join(rootDir, '.env.example'), envExample.trim());
    
    console.log('Created .env.example');
  }
  
  console.log('\n=== Deployment Preparation Complete ===');
}

/**
 * Deploy to Vercel
 */
function deployToVercel() {
  console.log('\n=== Deploying to Vercel ===');
  
  // Check if Vercel CLI is installed
  const vercelCheck = runCommand('vercel --version', { silent: true, ignoreError: true });
  
  if (!vercelCheck.success) {
    console.log('Vercel CLI not found. Installing...');
    runCommand('npm install -g vercel');
  }
  
  // Deploy to Vercel
  console.log('\nDeploying to Vercel...');
  console.log('Note: You will be prompted to log in if not already logged in.');
  console.log('When asked for the directory, just press Enter to use the current directory.');
  
  runCommand('vercel');
  
  console.log('\nTo deploy to production, run:');
  console.log('vercel --prod');
}

/**
 * Main function
 */
function main() {
  console.log('=== Vercel Deployment Helper ===');
  
  prepareForDeployment();
  deployToVercel();
  
  console.log('\n=== Deployment Helper Complete ===');
  console.log('Your application should now be deployed to Vercel.');
  console.log('Check the Vercel dashboard for details: https://vercel.com/dashboard');
}

// Run the script
main();