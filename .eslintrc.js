module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:jest/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'jest', 'react-hooks'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    'complexity': ['error', 10],
    '@typescript-eslint/explicit-function-return-type': 'error',
    'react/prop-types': 'off',
    'jsx-a11y/aria-role': 'error',
    'no-console': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn',
    'no-const-assign': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  overrides: [
    // Override for TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn'
      }
    },
    // Override for test files
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      env: {
        jest: true
      },
      rules: {
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error'
      }
    }
  ]
};
