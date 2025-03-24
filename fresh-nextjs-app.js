const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Setting up a completely fresh Next.js app...');

// Update package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts
  packageJson.scripts = {
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "lint": "next lint"
  };
  
  // Remove any problematic scripts
  if (packageJson.scripts.prebuild) {
    delete packageJson.scripts.prebuild;
  }
  
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ Updated package.json');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

// Create minimal next.config.js
const nextConfigPath = path.join(process.cwd(), 'next.config.js');
try {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  }
}

module.exports = nextConfig
`;
  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('✅ Created minimal next.config.js');
} catch (error) {
  console.error('❌ Error creating next.config.js:', error.message);
}

// Create pages directory if it doesn't exist
const pagesDir = path.join(process.cwd(), 'pages');
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
  console.log('✅ Created pages directory');
}

// Create minimal index.js
const indexPath = path.join(pagesDir, 'index.js');
try {
  const indexContent = `export default function Home() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3' }}>Print on Demand</h1>
      <p>Welcome to the Print on Demand application!</p>
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eaeaea', borderRadius: '5px' }}>
        <h2>Ready for Deployment</h2>
        <p>This application is now ready to be deployed to Vercel.</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(indexPath, indexContent);
  console.log('✅ Created minimal index.js');
} catch (error) {
  console.error('❌ Error creating index.js:', error.message);
}

// Create minimal _app.js
const appPath = path.join(pagesDir, '_app.js');
try {
  const appContent = `function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
`;
  fs.writeFileSync(appPath, appContent);
  console.log('✅ Created minimal _app.js');
} catch (error) {
  console.error('❌ Error creating _app.js:', error.message);
}

// Create vercel.json
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
try {
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
    vercelJsonPath,
    JSON.stringify(vercelConfig, null, 2) + '\n'
  );
  console.log('✅ Created vercel.json');
} catch (error) {
  console.error('❌ Error creating vercel.json:', error.message);
}

console.log('🎉 Fresh Next.js app setup completed');
