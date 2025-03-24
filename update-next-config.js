const fs = require('fs');
const path = require('path');

console.log('🔧 Updating Next.js configuration...');

const nextConfigPath = path.join(process.cwd(), 'next.config.js');

try {
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compiler: {
    // Optional: Add any specific SWC compiler options here
    styledComponents: false, // Enable if you use styled-components
  },
  reactStrictMode: true,
  eslint: { 
    ignoreDuringBuilds: true 
  },
  typescript: { 
    ignoreBuildErrors: true 
  },
  publicRuntimeConfig: {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig
`;

  fs.writeFileSync(nextConfigPath, nextConfig);
  console.log('✅ Updated next.config.js');
} catch (error) {
  console.error('❌ Error updating next.config.js:', error.message);
}

console.log('🎉 Next.js configuration update completed');
