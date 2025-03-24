const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for Vercel deployment...');

// Create or update vercel.json
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
  console.log('✅ Created/updated vercel.json');
} catch (error) {
  console.error('❌ Error creating vercel.json:', error.message);
}

console.log('✅ Vercel deployment preparation complete');
