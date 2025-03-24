const fs = require('fs');
const path = require('path');

console.log('🔧 Removing custom Babel configuration...');

const babelrcPath = path.join(process.cwd(), '.babelrc.js');
if (fs.existsSync(babelrcPath)) {
  try {
    fs.unlinkSync(babelrcPath);
    console.log('✅ Removed .babelrc.js');
  } catch (error) {
    console.error('❌ Error removing .babelrc.js:', error.message);
  }
}

const babelrcJsonPath = path.join(process.cwd(), '.babelrc');
if (fs.existsSync(babelrcJsonPath)) {
  try {
    fs.unlinkSync(babelrcJsonPath);
    console.log('✅ Removed .babelrc');
  } catch (error) {
    console.error('❌ Error removing .babelrc:', error.message);
  }
}

console.log('🎉 Babel configuration removal completed');
