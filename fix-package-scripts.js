const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing package.json scripts...');

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
  
  // Remove any problematic prebuild script
  if (packageJson.scripts.prebuild) {
    console.log('Removing problematic prebuild script...');
    delete packageJson.scripts.prebuild;
  }
  
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ Updated package.json scripts');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

console.log('🎉 Package.json scripts fixing process completed');
