const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');
const eslintConfigPath = path.join(rootDir, '.eslintrc.js');
const nextConfigPath = path.join(rootDir, 'next.config.js');

console.log(chalk.blue('🔍 Starting build fix process'));

// Fix package.json
function fixPackageJson() {
  console.log(chalk.yellow('Checking package.json...'));
  
  if (!fs.existsSync(packageJsonPath)) {
    console.error(chalk.red('❌ package.json not found'));
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update build script to use Next.js
    if (packageJson.scripts && packageJson.scripts.build && packageJson.scripts.build.includes('webpack')) {
      console.log(chalk.yellow('Updating build script to use Next.js...'));
      packageJson.scripts.build = 'next build';
      
      fs.writeFileSync(
        packageJsonPath, 
        JSON.stringify(packageJson, null, 2) + '\n'
      );
      console.log(chalk.green('✅ Updated package.json with Next.js build script'));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error processing package.json: ${error.message}`));
  }
}

// Fix ESLint config
function fixESLintConfig() {
  console.log(chalk.yellow('Checking ESLint configuration...'));
  
  if (!fs.existsSync(eslintConfigPath)) {
    console.log(chalk.yellow('⚠️ ESLint config not found, skipping'));
    return;
  }
  
  try {
    const content = fs.readFileSync(eslintConfigPath, 'utf8');
    
    // Check for the syntax error
    if (content.includes('module.exports = {') && 
        content.includes('plugins: [') && 
        !content.includes('module.exports = {\n  plugins: [')) {
      
      console.log(chalk.red('❌ Found syntax error in ESLint config, fixing...'));
      
      // Create a new fixed config
      const fixedContent = `module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'jest', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-console': 'warn',
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};`;
      
      fs.writeFileSync(eslintConfigPath, fixedContent);
      console.log(chalk.green('✅ ESLint config fixed'));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error processing ESLint config: ${error.message}`));
  }
}

// Clean build artifacts
function cleanBuildArtifacts() {
  console.log(chalk.yellow('Cleaning build artifacts...'));
  
  const dirsToClean = [
    path.join(rootDir, '.next'),
    path.join(rootDir, 'node_modules/.cache'),
    path.join(rootDir, 'dist'),
    path.join(rootDir, 'build')
  ];
  
  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      try {
        console.log(chalk.yellow(`Removing ${dir}...`));
        // Use rimraf-like approach for Windows
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(chalk.green(`✅ Cleaned ${dir}`));
      } catch (error) {
        console.error(chalk.red(`❌ Failed to clean ${dir}: ${error.message}`));
        
        try {
          // Fallback to command line
          execSync(`rmdir /s /q "${dir}"`, { stdio: 'pipe' });
          console.log(chalk.green(`✅ Cleaned ${dir} using command line`));
        } catch (cmdError) {
          console.error(chalk.red(`❌ Command line cleanup also failed: ${cmdError.message}`));
        }
      }
    }
  }
}

// Create Vercel config
function createVercelConfig() {
  const vercelConfigPath = path.join(rootDir, 'vercel.json');
  
  if (!fs.existsSync(vercelConfigPath)) {
    console.log(chalk.yellow('Creating Vercel configuration...'));
    
    const vercelConfig = {
      "version": 2,
      "builds": [
        {
          "src": "package.json",
          "use": "@vercel/next"
        }
      ],
      "routes": [
        {
          "src": "/(.*)",
          "dest": "/$1"
        }
      ]
    };
    
    fs.writeFileSync(
      vercelConfigPath,
      JSON.stringify(vercelConfig, null, 2) + '\n'
    );
    console.log(chalk.green('✅ Created vercel.json configuration'));
  }
}

// Run a command
function runCommand(command) {
  console.log(chalk.yellow(`Running: ${command}`));
  try {
    const output = execSync(command, { stdio: 'inherit' });
    console.log(chalk.green(`✅ Command completed successfully`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ Command failed: ${error.message}`));
    return false;
  }
}

// Main function
async function main() {
  // 1. Fix configurations
  fixPackageJson();
  fixESLintConfig();
  
  // 2. Clean build artifacts
  cleanBuildArtifacts();
  
  // 3. Create Vercel config
  createVercelConfig();
  
  // 4. Install dependencies
  console.log(chalk.blue('Installing dependencies...'));
  runCommand('npm install');
  
  // 5. Try building
  console.log(chalk.blue('Attempting to build the project...'));
  const buildSuccess = runCommand('npm run build');
  
  if (buildSuccess) {
    console.log(chalk.green.bold('🎉 Build successful! Your project should now deploy correctly to Vercel.'));
  } else {
    console.error(chalk.red.bold('❌ Build failed. See errors above for details.'));
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`❌ Script error: ${error.message}`));
});
