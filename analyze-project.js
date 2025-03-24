const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.cwd();

console.log('📊 Analyzing project structure...');

// Function to list directories and files
function listDirectories(dir, depth = 0) {
  const items = fs.readdirSync(dir);
  const result = { directories: [], files: [] };
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(rootDir, fullPath);
    
    // Skip node_modules and .next directories
    if (item === 'node_modules' || item === '.next') continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      result.directories.push(relativePath);
      const subResult = listDirectories(fullPath, depth + 1);
      result.directories = [...result.directories, ...subResult.directories];
      result.files = [...result.files, ...subResult.files];
    } else {
      // Only include relevant files
      const ext = path.extname(item).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.html'].includes(ext)) {
        result.files.push(relativePath);
      }
    }
  }
  
  return result;
}

// Analyze project structure
const structure = listDirectories(rootDir);

console.log('\n📁 Directories:');
structure.directories.forEach(dir => console.log(`  ${dir}`));

console.log('\n📄 Key Files:');
structure.files.forEach(file => console.log(`  ${file}`));

// Analyze pages directory
const pagesDir = path.join(rootDir, 'pages');
if (fs.existsSync(pagesDir)) {
  console.log('\n📑 Pages:');
  const pageFiles = fs.readdirSync(pagesDir)
    .filter(file => !file.startsWith('.') && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')));
  
  pageFiles.forEach(file => console.log(`  /${file.replace(/\.(js|jsx|ts|tsx)$/, '')}`));
  
  // Check for API routes
  const apiDir = path.join(pagesDir, 'api');
  if (fs.existsSync(apiDir)) {
    console.log('\n🔌 API Routes:');
    const apiFiles = fs.readdirSync(apiDir)
      .filter(file => !file.startsWith('.') && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')));
    
    apiFiles.forEach(file => console.log(`  /api/${file.replace(/\.(js|jsx|ts|tsx)$/, '')}`));
  }
}

// Analyze package.json
const packageJsonPath = path.join(rootDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\n📦 Dependencies:');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('  Main Dependencies:');
  Object.keys(packageJson.dependencies || {}).forEach(dep => {
    console.log(`    ${dep}: ${packageJson.dependencies[dep]}`);
  });
  
  console.log('\n  Dev Dependencies:');
  Object.keys(packageJson.devDependencies || {}).forEach(dep => {
    console.log(`    ${dep}: ${packageJson.devDependencies[dep]}`);
  });
  
  console.log('\n⚙️ Scripts:');
  Object.keys(packageJson.scripts || {}).forEach(script => {
    console.log(`  ${script}: ${packageJson.scripts[script]}`);
  });
}

console.log('\n✅ Analysis complete');
