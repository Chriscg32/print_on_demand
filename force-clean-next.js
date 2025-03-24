const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Force cleaning .next directory...');

const dotNextDir = path.join(process.cwd(), '.next');

// Check if .next directory exists
if (fs.existsSync(dotNextDir)) {
  console.log('.next directory exists, attempting to force remove it...');
  
  try {
    // Use attrib to remove read-only attributes
    execSync(`attrib -R "${dotNextDir}\\*.*" /S /D`, { stdio: 'inherit' });
    console.log('✅ Removed read-only attributes');
    
    // Use rmdir with /s /q flags
    execSync(`rmdir /s /q "${dotNextDir}"`, { stdio: 'inherit' });
    console.log('✅ Successfully removed .next directory');
  } catch (error) {
    console.error('❌ Error removing .next directory:', error.message);
    
    // If rmdir fails, try to use del command for files first
    try {
      console.log('Trying to delete files first...');
      execSync(`del /f /s /q "${dotNextDir}\\*.*"`, { stdio: 'inherit' });
      execSync(`rmdir /s /q "${dotNextDir}"`, { stdio: 'inherit' });
      console.log('✅ Successfully removed .next directory with del + rmdir');
    } catch (delError) {
      console.error('❌ Error removing .next directory with del + rmdir:', delError.message);
    }
  }
} else {
  console.log('.next directory does not exist, nothing to clean');
}

console.log('🎉 Force cleaning process completed');
