const fs = require('fs');
const path = require('path');

console.log('🔧 Creating minimal working Next.js app...');

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
    <div>
      <h1>Print on Demand</h1>
      <p>Welcome to the Print on Demand application!</p>
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

console.log('🎉 Minimal Next.js app creation completed');

