const fs = require('fs');
const path = require('path');

console.log('🚀 Fixing Vercel deployment...');

// Fix package.json for Vercel
const packageJsonPath = path.join(process.cwd(), 'package.json');
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Ensure next is in dependencies (not devDependencies)
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }
  
  // Move next from devDependencies to dependencies if needed
  if (packageJson.devDependencies && packageJson.devDependencies.next) {
    packageJson.dependencies.next = packageJson.devDependencies.next;
    delete packageJson.devDependencies.next;
    console.log('✅ Moved next from devDependencies to dependencies');
  }
  
  // Ensure next is in dependencies with a specific version
  if (!packageJson.dependencies.next) {
    packageJson.dependencies.next = "^14.2.25";
    console.log('✅ Added next to dependencies');
  }
  
  // Ensure react and react-dom are in dependencies
  if (!packageJson.dependencies.react) {
    packageJson.dependencies.react = "^18.2.0";
    console.log('✅ Added react to dependencies');
  }
  
  if (!packageJson.dependencies['react-dom']) {
    packageJson.dependencies['react-dom'] = "^18.2.0";
    console.log('✅ Added react-dom to dependencies');
  }
  
  fs.writeFileSync(
    packageJsonPath, 
    JSON.stringify(packageJson, null, 2) + '\n'
  );
  console.log('✅ Updated package.json for Vercel');
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

// Create vercel.json in the root directory
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
  console.log('✅ Created vercel.json in the root directory');
} catch (error) {
  console.error('❌ Error creating vercel.json:', error.message);
}

console.log('🎉 Vercel deployment fix completed');
