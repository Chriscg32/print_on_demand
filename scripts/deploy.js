#!/usr/bin/env node

/**
 * Deployment script for the Print-on-Demand application
 * This script handles the build and deployment process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

// Configuration
const config = {
  environments: {
    development: {
      url: 'https://dev.printapp.example.com',
      buildCommand: 'npm run build:dev',
      deployCommand: 'aws s3 sync build/ s3://dev-printapp-bucket --delete'
    },
    staging: {
      url: 'https://staging.printapp.example.com',
      buildCommand: 'npm run build:staging',
      deployCommand: 'aws s3 sync build/ s3://staging-printapp-bucket --delete'
    },
    production: {
      url: 'https://printapp.example.com',
      buildCommand: 'npm run build:prod',
      deployCommand: 'aws s3 sync build/ s3://prod-printapp-bucket --delete'
    }
  },
  preDeploymentChecks: [
    { command: 'npm test', description: 'Run tests' },
    { command: 'npm run lint', description: 'Run linting' },
    { command: 'npm audit', description: 'Security audit' }
  ]
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to run a command and capture output
function runCommand(command, silent = false) {
  if (!silent) {
    console.log(chalk.blue(`\n> ${command}\n`));
  }
  
  try {
    const output = execSync(command, { encoding: 'utf8' });
    if (!silent) {
      console.log(output);
    }
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      console.error(chalk.red('Command failed:'), error.message);
      console.error(error.stdout);
    }
    return { success: false, output: error.stdout || error.message };
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

// Function to run pre-deployment checks
async function runPreDeploymentChecks() {
  console.log(chalk.yellow('\n=== Running Pre-Deployment Checks ===\n'));
  
  let allPassed = true;
  
  for (const check of config.preDeploymentChecks) {
    console.log(chalk.blue(`\n> ${check.description}...\n`));
    const result = runCommand(check.command);
    
    if (result.success) {
      console.log(chalk.green(`✓ ${check.description} passed`));
    } else {
      console.log(chalk.red(`✗ ${check.description} failed`));
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Function to deploy to a specific environment
async function deployToEnvironment(env) {
  const environment = config.environments[env];
  
  if (!environment) {
    console.error(chalk.red(`Unknown environment: ${env}`));
    return false;
  }
  
  console.log(chalk.yellow(`\n=== Deploying to ${env} ===\n`));
  
  // Build the application
  console.log(chalk.blue('\n> Building application...\n'));
  const buildResult = runCommand(environment.buildCommand);
  
  if (!buildResult.success) {
    console.error(chalk.red('Build failed. Aborting deployment.'));
    return false;
  }
  
  // Deploy the application
  console.log(chalk.blue('\n> Deploying application...\n'));
  const deployResult = runCommand(environment.deployCommand);
  
  if (!deployResult.success) {
    console.error(chalk.red('Deployment failed.'));
    return false;
  }
  
  console.log(chalk.green(`\n✓ Deployment to ${env} successful!`));
  console.log(`Application is now available at: ${environment.url}`);
  
  return true;
}

// Main deployment function
async function deploy() {
  console.log(chalk.yellow('\n=== Print-on-Demand Deployment Tool ===\n'));
  
  // Select environment
  rl.question('Select deployment environment (development/staging/production): ', async (env) => {
    if (!config.environments[env]) {
      console.error(chalk.red(`Invalid environment: ${env}`));
      rl.close();
      return;
    }
    
    // Run pre-deployment checks
    const checksPass = await runPreDeploymentChecks();
    
    if (!checksPass) {
      const proceedAnyway = await confirm('Pre-deployment checks failed. Do you want to proceed anyway?');
      
      if (!proceedAnyway) {
        console.log(chalk.yellow('Deployment aborted.'));
        rl.close();
        return;
      }
    }
    
    // Final confirmation
    const confirmed = await confirm(`Are you sure you want to deploy to ${env}?`);
    
    if (confirmed) {
      const success = await deployToEnvironment(env);
      
      if (success) {
        // Record deployment
        const deploymentRecord = {
          environment: env,
          timestamp: new Date().toISOString(),
          success: true
        };
        
        fs.writeFileSync(
          path.join(__dirname, '../deployment-logs', `${env}-${deploymentRecord.timestamp}.json`),
          JSON.stringify(deploymentRecord, null, 2)
        );
      }
    } else {
      console.log(chalk.yellow('Deployment aborted.'));
    }
    
    rl.close();
  });
}

// Create deployment logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../deployment-logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Execute deployment
deploy().catch(error => {
  console.error(chalk.red('Error during deployment:'), error);
  rl.close();
  process.exit(1);
});