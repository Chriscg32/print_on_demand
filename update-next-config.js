const fs = require('fs');
const path = require('path');

process.stdout.write('🔧 Updating Next.js configuration...\n');
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
  process.stdout.write('✅ Updated next.config.js\n');
} catch (error) {  process.stderr.write(`❌ Error updating next.config.js: ${error.message}\n`);
}
