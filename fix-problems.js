const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting to fix project problems...');

// Fix .babelrc.js
const babelrcPath = path.join(process.cwd(), '.babelrc.js');
if (fs.existsSync(babelrcPath)) {
  console.log('Checking .babelrc.js...');
  try {
    const babelConfig = `module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: ['@babel/plugin-transform-runtime']
};
`;
    fs.writeFileSync(babelrcPath, babelConfig);
    console.log('✅ Fixed .babelrc.js');
  } catch (error) {
    console.error('❌ Error fixing .babelrc.js:', error.message);
  }
}

// Install ESLint plugins
console.log('Installing ESLint plugins...');
try {
  execSync('npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y @typescript-eslint/eslint-plugin @typescript-eslint/parser', { stdio: 'inherit' });
  console.log('✅ ESLint plugins installed');
} catch (error) {
  console.error('❌ Error installing ESLint plugins:', error.message);
}

// Fix ESLint config
const eslintConfigPath = path.join(process.cwd(), '.eslintrc.js');
if (fs.existsSync(eslintConfigPath)) {
  console.log('Fixing ESLint configuration...');
  try {
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
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y', 'react-hooks'],
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
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off'
      }
    }
  ]
};
`;
    fs.writeFileSync(eslintConfigPath, eslintConfig);
    console.log('✅ ESLint config fixed');
  } catch (error) {
    console.error('❌ Error fixing ESLint config:', error.message);
  }
}

// Create a proper _app.js if it doesn't exist or is minimal
const appJsPath = path.join(process.cwd(), 'pages', '_app.js');
if (fs.existsSync(appJsPath)) {
  console.log('Checking _app.js...');
  try {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    if (appJsContent.length < 100) {
      // If the file is very small, it might be incomplete
      const newAppJs = `import '../styles/index.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
      fs.writeFileSync(appJsPath, newAppJs);
      console.log('✅ Updated _app.js');
    }
  } catch (error) {
    console.error('❌ Error checking _app.js:', error.message);
  }
}

// Create a proper _document.js if it doesn't exist or is minimal
const documentJsPath = path.join(process.cwd(), 'pages', '_document.js');
if (fs.existsSync(documentJsPath)) {
  console.log('Checking _document.js...');
  try {
    const documentJsContent = fs.readFileSync(documentJsPath, 'utf8');
    if (documentJsContent.length < 100) {
      // If the file is very small, it might be incomplete
      const newDocumentJs = `import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
`;
      fs.writeFileSync(documentJsPath, newDocumentJs);
      console.log('✅ Updated _document.js');
    }
  } catch (error) {
    console.error('❌ Error checking _document.js:', error.message);
  }
}

// Create a styles directory and index.css if they don't exist
const stylesDir = path.join(process.cwd(), 'styles');
const indexCssPath = path.join(stylesDir, 'index.css');
if (!fs.existsSync(indexCssPath)) {
  console.log('Creating styles/index.css...');
  try {
    if (!fs.existsSync(stylesDir)) {
      fs.mkdirSync(stylesDir);
    }
    
    const indexCss = `/* Global styles */
html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
`;
    fs.writeFileSync(indexCssPath, indexCss);
    console.log('✅ Created styles/index.css');
  } catch (error) {
    console.error('❌ Error creating styles/index.css:', error.message);
  }
}

// Run ESLint fix
console.log('Running ESLint fix...');
try {
  execSync('npx eslint --fix --ext .js,.jsx,.ts,.tsx .', { stdio: 'inherit' });
  console.log('✅ ESLint fix completed');
} catch (error) {
  console.error('❌ Error running ESLint fix:', error.message);
}

// Create a .gitignore file if it doesn't exist
const gitignorePath = path.join(process.cwd(), '.gitignore');
if (!fs.existsSync(gitignorePath)) {
  console.log('Creating .gitignore...');
  try {
    const gitignore = `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env.local
.env.development.local
.env.test.local
.env.production.local

# vercel
.vercel
`;
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('✅ Created .gitignore');
  } catch (error) {
    console.error('❌ Error creating .gitignore:', error.message);
  }
}

console.log('🎉 Problem fixing process completed');
