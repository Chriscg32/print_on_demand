const fs = require('fs');
const path = require('path');

// Update package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts to use Next.js
  packageJson.scripts = {
    "build": "next build",
    "dev": "next dev",
    "start": "next start"
  };
  
  // Remove any problematic prebuild script
  if (packageJson.scripts.prebuild) {
    delete packageJson.scripts.prebuild;
  }
  
  // Ensure next is in dependencies
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  
  if (!packageJson.dependencies.next) {
    packageJson.dependencies.next = "^14.2.25";
  }
  
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ Fixed package.json');
} catch (error) {
  console.error('❌ Error fixing package.json:', error.message);
}

