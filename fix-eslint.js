const fs = require('fs');
const path = require('path');

// Create a clean ESLint config
const eslintConfigPath = path.join(process.cwd(), '.eslintrc.js');
const eslintConfig = `module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react', 'react-hooks'],
  rules: {
    'no-console': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
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
