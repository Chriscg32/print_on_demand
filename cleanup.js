const fs = require('fs');
const path = require('path');

// List of files to remove
const filesToRemove = [
  'add-dev-script.js',
  'analyze-project.js',
  '__tests__/eslintrc.test.js'
];

// Remove unnecessary files
for (const file of filesToRemove) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed ${file}`);
    } catch (error) {
      console.error(`❌ Error removing ${file}:`, error.message);
    }
  }
}

// Remove .babelrc.js if it exists (let Next.js handle it)
const babelrcPath = path.join(process.cwd(), '.babelrc.js');
if (fs.existsSync(babelrcPath)) {
  try {
    fs.unlinkSync(babelrcPath);
    console.log('✅ Removed .babelrc.js');
  } catch (error) {
    console.error('❌ Error removing .babelrc.js:', error.message);
  }
}
