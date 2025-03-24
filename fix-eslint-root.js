const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ESLint configuration with root:true...');

// Check which ESLint config files exist
const eslintConfigJsPath = path.join(process.cwd(), 'eslint.config.js');
const eslintRcJsPath = path.join(process.cwd(), '.eslintrc.js');
const hasEslintConfigJs = fs.existsSync(eslintConfigJsPath);
const hasEslintRcJs = fs.existsSync(eslintRcJsPath);

console.log(`eslint.config.js exists: ${hasEslintConfigJs}`);
console.log(`.eslintrc.js exists: ${hasEslintRcJs}`);

// Update .eslintrc.js with root:true
if (hasEslintRcJs) {
  console.log('Updating .eslintrc.js with root:true...');
  try {
    const eslintRcContent = `module.exports = {
  root: true,
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
    console.log('✅ Updated .eslintrc.js with root:true');
  } catch (error) {
    console.error('❌ Error updating .eslintrc.js:', error.message);
  }
}

console.log('🎉 ESLint configuration fixing process completed');
