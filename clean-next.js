const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Cleaning .next directory and fixing permissions...');

const dotNextDir = path.join(process.cwd(), '.next');

// Check if .next directory exists
if (fs.existsSync(dotNextDir)) {
  console.log('.next directory exists, attempting to remove it...');
  
  try {
    // On Windows, we need to use the rmdir command with /s /q flags
    execSync(`rmdir /s /q "${dotNextDir}"`, { stdio: 'inherit' });
    console.log('✅ Successfully removed .next directory');
  } catch (error) {
    console.error('❌ Error removing .next directory with rmdir:', error.message);
    
    // Try alternative approach using Node.js fs
    try {
      console.log('Trying alternative approach with fs.rmSync...');
      fs.rmSync(dotNextDir, { recursive: true, force: true });
      console.log('✅ Successfully removed .next directory with fs.rmSync');
    } catch (fsError) {
      console.error('❌ Error removing .next directory with fs.rmSync:', fsError.message);
      
      // If all else fails, suggest manual deletion
      console.log('Please try to manually delete the .next directory:');
      console.log('1. Close any running processes (Next.js dev server, etc.)');
      console.log('2. Close any file explorer windows that might be accessing the directory');
      console.log('3. Run: rmdir /s /q ".next"');
    }
  }
} else {
  console.log('.next directory does not exist, nothing to clean');
}

// Create a clean .babelrc.js file
const babelrcPath = path.join(process.cwd(), '.babelrc.js');
try {
  const babelConfig = `module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: ['@babel/plugin-transform-runtime']
};
`;
  fs.writeFileSync(babelrcPath, babelConfig);
  console.log('✅ Created clean .babelrc.js file');
} catch (error) {
  console.error('❌ Error creating .babelrc.js:', error.message);
}

console.log('🎉 Cleaning process completed');

