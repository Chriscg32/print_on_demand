const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fix the broken .eslintrc.js file
function fixEslintConfig() {
  const eslintConfigPath = path.join(process.cwd(), '.eslintrc.js');
  
  // Create a simple, valid ESLint config
  const eslintConfig = `module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
  ],
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
};
`;

  try {
    fs.writeFileSync(eslintConfigPath, eslintConfig);
    console.log('✅ Fixed .eslintrc.js');
  } catch (error) {
    console.error('❌ Error fixing .eslintrc.js:', error.message);
  }
}

// Update package.json to use Next.js for building
function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update build script to use Next.js
    if (packageJson.scripts && packageJson.scripts.build && packageJson.scripts.build.includes('webpack')) {
      packageJson.scripts.build = 'next build';
      console.log('✅ Updated build script to use Next.js');
    }
    
    // Remove problematic prebuild script if it exists
    if (packageJson.scripts && packageJson.scripts.prebuild) {
      delete packageJson.scripts.prebuild;
      console.log('✅ Removed prebuild script');
    }
    
    // Add dev and start scripts if they don't exist
    if (!packageJson.scripts.dev) {
      packageJson.scripts.dev = 'next dev';
      console.log('✅ Added dev script');
    }
    
    if (!packageJson.scripts.start) {
      packageJson.scripts.start = 'next start';
      console.log('✅ Added start script');
    }
    
    fs.writeFileSync(
      packageJsonPath, 
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log('✅ Updated package.json');
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
  }
}

// Clean up unnecessary files that are causing linting errors
function cleanupFiles() {
  const filesToRemove = [
    'add-dev-script.js',
    'analyze-project.js',
    'clean-next.js'
  ];
  
  for (const file of filesToRemove) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed ${file}`);
      } catch (error) {
        console.error(`❌ Error removing ${file}:`, error.message);
      }
    }
  }
}

// Clean up .next directory to fix missing file errors
function cleanNextCache() {
  const nextDir = path.join(process.cwd(), '.next');
  
  if (fs.existsSync(nextDir)) {
    try {
      // On Windows, use rmdir command
      execSync(`rmdir /s /q "${nextDir}"`, { stdio: 'pipe' });
      console.log('✅ Cleaned .next directory');
    } catch (error) {
      console.error('❌ Error cleaning .next directory:', error.message);
      
      // Alternative approach using fs
      try {
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Cleaned .next directory (alternative method)');
      } catch (fsError) {
        console.error('❌ Alternative method also failed:', fsError.message);
      }
    }
  }
}

// Run all fixes
function runFixes() {
  console.log('🔧 Starting project fixes...');
  
  fixEslintConfig();
  updatePackageJson();
  cleanupFiles();
  cleanNextCache();
  
  console.log('✅ All fixes applied. Try building your project with: npm run build');
}

runFixes();
