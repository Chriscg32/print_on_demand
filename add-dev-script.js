const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');

console.log('🔧 Adding dev script to package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // Add dev script
  packageJson.scripts.dev = 'next dev';
  console.log('Added dev script: next dev');
  
  // Add start script if it doesn't exist
  if (!packageJson.scripts.start) {
    packageJson.scripts.start = 'next start';
    console.log('Added start script: next start');
  }
  
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ package.json updated successfully');
} catch (error) {
  console.error(`❌ Error updating package.json: ${error.message}`);
}
