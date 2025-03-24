const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, 'package.json');

console.log('🔧 Fixing prebuild script in package.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.prebuild) {
    console.log('Current prebuild script:', packageJson.scripts.prebuild);
    
    // Either remove the prebuild script or fix it
    // Option 1: Remove it
    delete packageJson.scripts.prebuild;
    
    // Option 2: Fix it (uncomment if you prefer to fix rather than remove)
    // packageJson.scripts.prebuild = 'echo "Prebuild step skipped"';
    
    fs.writeFileSync(
      packageJsonPath, 
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log('✅ Removed problematic prebuild script');
  }
  
  console.log('✅ package.json updated successfully');
} catch (error) {
  console.error(`❌ Error updating package.json: ${error.message}`);
}
