#!/usr/bin/env node

/**
 * Run All Tests and Fixes Script
 * 
 * This script runs all testing and fixing scripts to identify and resolve issues across the project:
 * 1. Runs the project health check
 * 2. Fixes markdown issues
 * 3. Runs linting and attempts to fix issues
 * 4. Runs unit tests
 * 5. Checks for security vulnerabilities
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
const rootDir = process.argv[2] || path.resolve(__dirname, '..');

// Helper function to run a command
function runCommand(command, options = {}) {
  console.log(chalk.blue(`\n> ${command}\n`));
  
  try {
    execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: rootDir,
      ...options
    });
    return { success: true };
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

// Helper function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Helper function to ensure a script exists
function ensureScript(scriptPath, content) {
  const fullPath = path.join(rootDir, scriptPath);
  
  if (!fileExists(fullPath)) {
    console.log(chalk.yellow(`Script not found: ${scriptPath}`));
    console.log(chalk.blue(`Creating ${scriptPath}...`));
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fileExists(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write script content
    fs.writeFileSync(fullPath, content);
    
    // Make executable on Unix-like systems
    try {
      fs.chmodSync(fullPath, '755');
    } catch (error) {
      // Ignore chmod errors on Windows
    }
    
    console.log(chalk.green(`Created ${scriptPath}`));
  }
}

// Ensure all required scripts exist
function ensureAllScripts() {
  // Check for fix-markdown.js
  ensureScript('scripts/fix-markdown.js', fs.readFileSync(path.join(__dirname, 'fix-markdown.js'), 'utf8'));
  
  // Check for fix-duplicate-headings.js
  ensureScript('scripts/fix-duplicate-headings.js', fs.readFileSync(path.join(__dirname, 'fix-duplicate-headings.js'), 'utf8'));
  
  // Check for fix-all-markdown.js
  ensureScript('scripts/fix-all-markdown.js', fs.readFileSync(path.join(__dirname, 'fix-all-markdown.js'), 'utf8'));
  
  // Check for project-health-check.js
  ensureScript('scripts/project-health-check.js', fs.readFileSync(path.join(__dirname, 'project-health-check.js'), 'utf8'));
}

// Main function
async function main() {
  console.log(chalk.green('=== Running All Tests and Fixes ==='));
  console.log(chalk.blue(`Working directory: ${rootDir}`));
  
  // Ensure all required scripts exist
  ensureAllScripts();
  
  // Step 1: Run project health check
  console.log(chalk.yellow('\n=== Step 1: Running Project Health Check ==='));
  runCommand('node scripts/project-health-check.js', { ignoreError: true });
  
  // Step 2: Fix markdown issues
  console.log(chalk.yellow('\n=== Step 2: Fixing Markdown Issues ==='));
  runCommand('node scripts/fix-all-markdown.js', { ignoreError: true });
  
  // Step 3: Run linting and fix issues
  console.log(chalk.yellow('\n=== Step 3: Running Linting and Fixing Issues ==='));
  
  // Check if ESLint is installed
  const hasESLint = fileExists(path.join(rootDir, 'node_modules', '.bin', 'eslint')) || 
                    fileExists(path.join(rootDir, 'node_modules', 'eslint'));
  
  if (hasESLint) {
    runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --fix', { ignoreError: true });
  } else {
    console.log(chalk.blue('ESLint not found. Skipping linting.'));
    console.log(chalk.blue('To enable linting, install ESLint: npm install --save-dev eslint'));
  }
  
  // Step 4: Run unit tests
  console.log(chalk.yellow('\n=== Step 4: Running Unit Tests ==='));
  
  // Check if package.json has a test script
  try {
    const packageJson = require(path.join(rootDir, 'package.json'));
    if (packageJson.scripts && packageJson.scripts.test) {
      runCommand('npm test', { ignoreError: true });
    } else {
      console.log(chalk.blue('No test script found in package.json. Skipping tests.'));
    }
  } catch (error) {
    console.log(chalk.red('Error reading package.json:'), error.message);
    console.log(chalk.blue('Skipping tests.'));
  }
  
  // Step 5: Check for security vulnerabilities
  console.log(chalk.yellow('\n=== Step 5: Checking for Security Vulnerabilities ==='));
  runCommand('npm audit', { ignoreError: true });
  
  // Final summary
  console.log(chalk.green('\n=== All Tests and Fixes Completed ==='));
  console.log(chalk.blue('The project has been scanned and fixed where possible.'));
  console.log(chalk.blue('Please review the output above for any remaining issues that need manual attention.'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Unhandled error:'), error);
  process.exit(1);
});