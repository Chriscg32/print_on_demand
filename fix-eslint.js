const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing ESLint configuration...');

// Check which ESLint config files exist
const eslintConfigJsPath = path.join(process.cwd(), 'eslint.config.js');
const eslintRcJsPath = path.join(process.cwd(), '.eslintrc.js');
const hasEslintConfigJs = fs.existsSync(eslintConfigJsPath);
const hasEslintRcJs = fs.existsSync(eslintRcJsPath);

console.log(`eslint.config.js exists: ${hasEslintConfigJs}`);
console.log(`.eslintrc.js exists: ${hasEslintRcJs}`);

// Strategy: Rename the flat config and use the legacy config
if (hasEslintConfigJs) {
  console.log('Renaming eslint.config.js to eslint.config.js.bak...');
  try {
    fs.renameSync(eslintConfigJsPath, `${eslintConfigJsPath}.bak`);
    console.log('✅ Renamed eslint.config.js to eslint.config.js.bak');
  } catch (error) {
    console.error('❌ Error renaming eslint.config.js:', error.message);
  }
}

// Ensure we have a valid .eslintrc.js
if (!hasEslintRcJs || (hasEslintRcJs && fs.statSync(eslintRcJsPath).size < 100)) {
  console.log('Creating/updating .eslintrc.js...');
  try {
    const eslintRcContent = `module.exports = {
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
  plugins: ['react', 'jsx-a11y', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    'no-console': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  ignorePatterns: [
    'node_modules/**',
    '.next/**',
    'out/**',
    'build/**',
    'dist/**',
    '.vercel/**',
    '*.config.js.bak'
  ]
};
`;
    fs.writeFileSync(eslintRcJsPath, eslintRcContent);
    console.log('✅ Created/updated .eslintrc.js');
  } catch (error) {
    console.error('❌ Error creating .eslintrc.js:', error.message);
  }
}

// Now run ESLint with the legacy config
console.log('Running ESLint fix with legacy config...');
try {
  execSync('npx eslint --fix --ext .js,.jsx,.ts,.tsx .', { stdio: 'inherit' });
  console.log('✅ ESLint fix completed');
} catch (error) {
  console.error('❌ Error running ESLint fix:', error.message);
  console.log('Trying alternative ESLint command...');
  
  try {
    execSync('npx eslint . --fix', { stdio: 'inherit' });
    console.log('✅ Alternative ESLint fix completed');
  } catch (altError) {
    console.error('❌ Alternative ESLint command also failed:', altError.message);
    console.log('Skipping ESLint for now. You may need to fix linting issues manually.');
  }
}

console.log('🎉 ESLint configuration fixing process completed');
