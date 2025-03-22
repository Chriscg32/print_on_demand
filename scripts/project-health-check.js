#!/usr/bin/env node

/**
 * Project Health Check Script
 * 
 * This script performs a comprehensive health check of the project:
 * 1. Checks for linting issues
 * 2. Validates markdown files
 * 3. Verifies file structure
 * 4. Checks for broken dependencies
 * 5. Validates configuration files
 * 6. Fixes common issues automatically when possible
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const ignoreDirs = [
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage'
];

// Track issues
const issues = {
  critical: [],
  major: [],
  minor: [],
  fixed: []
};

/**
 * Run a command and return the output
 */
function runCommand(command, silent = false) {
  try {
    if (!silent) {
      console.log(chalk.blue(`> ${command}`));
    }
    
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: rootDir,
      stdio: silent ? 'pipe' : 'inherit'
    });
    
    return { success: true, output };
  } catch (error) {
    if (!silent) {
      console.error(chalk.red('Command failed:'), error.message);
    }
    
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

/**
 * Check if a package is installed
 */
function isPackageInstalled(packageName) {
  try {
    require.resolve(packageName, { paths: [rootDir] });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check for package.json and validate it
 */
function checkPackageJson() {
  console.log(chalk.yellow('\n=== Checking package.json ==='));
  
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    issues.critical.push('package.json file is missing');
    return;
  }
  
  try {
    const packageJson = require(packageJsonPath);
    
    // Check for required fields
    if (!packageJson.name) {
      issues.major.push('package.json is missing "name" field');
    }
    
    if (!packageJson.version) {
      issues.minor.push('package.json is missing "version" field');
    }
    
    // Check for scripts
    if (!packageJson.scripts || Object.keys(packageJson.scripts).length === 0) {
      issues.major.push('package.json has no scripts defined');
    } else {
      // Check for essential scripts
      const essentialScripts = ['start', 'build', 'test'];
      const missingScripts = essentialScripts.filter(script => !packageJson.scripts[script]);
      
      if (missingScripts.length > 0) {
        issues.minor.push(`package.json is missing essential scripts: ${missingScripts.join(', ')}`);
      }
    }
    
    // Check dependencies
    if (packageJson.dependencies) {
      const dependencies = Object.keys(packageJson.dependencies);
      console.log(chalk.blue(`Found ${dependencies.length} dependencies`));
      
      // Check for duplicate dependencies in devDependencies
      if (packageJson.devDependencies) {
        const duplicates = Object.keys(packageJson.devDependencies)
          .filter(dep => dependencies.includes(dep));
        
        if (duplicates.length > 0) {
          issues.minor.push(`Duplicate dependencies found in both dependencies and devDependencies: ${duplicates.join(', ')}`);
        }
      }
    }
    
    console.log(chalk.green('✓ package.json is valid'));
  } catch (error) {
    issues.critical.push(`package.json is invalid: ${error.message}`);
  }
}

/**
 * Check for dependency issues
 */
function checkDependencies() {
  console.log(chalk.yellow('\n=== Checking dependencies ==='));
  
  // Check if node_modules exists
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    issues.major.push('node_modules directory is missing. Run npm install');
    return;
  }
  
  // Run npm check for outdated packages
  const npmCheckResult = runCommand('npm outdated --json', true);
  if (npmCheckResult.success) {
    try {
      const outdated = JSON.parse(npmCheckResult.output);
      const outdatedCount = Object.keys(outdated).length;
      
      if (outdatedCount > 0) {
        issues.minor.push(`${outdatedCount} outdated dependencies found. Consider running npm update`);
        console.log(chalk.yellow(`Found ${outdatedCount} outdated dependencies`));
      } else {
        console.log(chalk.green('✓ All dependencies are up to date'));
      }
    } catch (error) {
      // If there's no outdated packages, the output might be empty
      console.log(chalk.green('✓ No outdated dependencies found'));
    }
  } else {
    issues.minor.push('Failed to check for outdated dependencies');
  }
  
  // Check for security vulnerabilities
  console.log(chalk.blue('Checking for security vulnerabilities...'));
  const npmAuditResult = runCommand('npm audit --json', true);
  if (npmAuditResult.success) {
    try {
      const audit = JSON.parse(npmAuditResult.output);
      
      if (audit.vulnerabilities) {
        const totalVulnerabilities = 
          (audit.vulnerabilities.critical || 0) + 
          (audit.vulnerabilities.high || 0) + 
          (audit.vulnerabilities.moderate || 0) + 
          (audit.vulnerabilities.low || 0);
        
        if (totalVulnerabilities > 0) {
          if (audit.vulnerabilities.critical > 0 || audit.vulnerabilities.high > 0) {
            issues.major.push(`Found ${audit.vulnerabilities.critical || 0} critical and ${audit.vulnerabilities.high || 0} high severity vulnerabilities`);
          } else {
            issues.minor.push(`Found ${totalVulnerabilities} vulnerabilities (moderate or low severity)`);
          }
          
          console.log(chalk.yellow(`Found vulnerabilities: ${JSON.stringify(audit.vulnerabilities)}`));
        } else {
          console.log(chalk.green('✓ No security vulnerabilities found'));
        }
      } else {
        console.log(chalk.green('✓ No security vulnerabilities found'));
      }
    } catch (error) {
      console.log(chalk.green('✓ No security vulnerabilities found'));
    }
  } else {
    issues.minor.push('Failed to check for security vulnerabilities');
  }
}

/**
 * Check for linting issues
 */
function checkLinting() {
  console.log(chalk.yellow('\n=== Checking for linting issues ==='));
  
  // Check if ESLint is installed
  if (!isPackageInstalled('eslint')) {
    issues.minor.push('ESLint is not installed. Consider adding ESLint for code quality');
    return;
  }
  
  // Run ESLint
  const eslintResult = runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --format json', true);
  if (eslintResult.success) {
    console.log(chalk.green('✓ No linting issues found'));
  } else {
    try {
      const lintResults = JSON.parse(eslintResult.stdout || '[]');
      const errorCount = lintResults.reduce((sum, file) => sum + file.errorCount, 0);
      const warningCount = lintResults.reduce((sum, file) => sum + file.warningCount, 0);
      
      if (errorCount > 0) {
        issues.major.push(`Found ${errorCount} ESLint errors`);
      }
      
      if (warningCount > 0) {
        issues.minor.push(`Found ${warningCount} ESLint warnings`);
      }
      
      console.log(chalk.yellow(`Found ${errorCount} errors and ${warningCount} warnings`));
      
      // Try to fix automatically
      if (errorCount > 0 || warningCount > 0) {
        console.log(chalk.blue('Attempting to fix linting issues automatically...'));
        const fixResult = runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --fix', true);
        
        if (fixResult.success) {
          issues.fixed.push('Fixed some linting issues automatically');
          console.log(chalk.green('✓ Fixed some linting issues automatically'));
        } else {
          console.log(chalk.yellow('Could not fix all linting issues automatically'));
        }
      }
    } catch (error) {
      issues.minor.push('Failed to parse ESLint results');
    }
  }
}

/**
 * Check markdown files for common issues
 */
function checkMarkdownFiles() {
  console.log(chalk.yellow('\n=== Checking markdown files ==='));
  
  // Check if markdownlint is installed
  if (!isPackageInstalled('markdownlint')) {
    console.log(chalk.blue('Installing markdownlint-cli for markdown validation...'));
    runCommand('npm install --no-save markdownlint-cli', true);
  }
  
  // Find all markdown files
  const markdownFiles = findFiles(rootDir, '.md');
  console.log(chalk.blue(`Found ${markdownFiles.length} markdown files`));
  
  if (markdownFiles.length === 0) {
    return;
  }
  
  // Create a temporary markdownlint config
  const markdownlintConfig = {
    "default": true,
    "MD013": false, // Line length
    "MD033": false, // Inline HTML
    "MD041": false  // First line should be a top level heading
  };
  
  const configPath = path.join(rootDir, '.markdownlint-temp.json');
  fs.writeFileSync(configPath, JSON.stringify(markdownlintConfig, null, 2));
  
  // Run markdownlint
  const markdownlintResult = runCommand(`npx markdownlint ${markdownFiles.join(' ')} --config .markdownlint-temp.json`, true);
  
  // Clean up temp config
  fs.unlinkSync(configPath);
  
  if (markdownlintResult.success) {
    console.log(chalk.green('✓ No markdown issues found'));
  } else {
    const issuesText = markdownlintResult.stderr || markdownlintResult.stdout;
    const issueCount = (issuesText.match(/\n/g) || []).length + 1;
    
    issues.minor.push(`Found ${issueCount} markdown issues`);
    console.log(chalk.yellow(`Found ${issueCount} markdown issues`));
    
    // Fix common markdown issues
    console.log(chalk.blue('Fixing common markdown issues...'));
    fixMarkdownIssues(markdownFiles);
  }
}

/**
 * Fix common markdown issues
 */
function fixMarkdownIssues(markdownFiles) {
  let fixedCount = 0;
  
  for (const file of markdownFiles) {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    // Fix: Missing blank lines around headings (MD022)
    const headingRegex = /^(#{1,6} .+)$/gm;
    content = content.replace(headingRegex, (match, heading) => {
      const prevChar = content.substring(content.indexOf(match) - 1, content.indexOf(match));
      const nextChar = content.substring(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 1);
      
      let result = match;
      
      if (prevChar !== '\n' && content.indexOf(match) > 0) {
        result = '\n' + result;
        modified = true;
      }
      
      if (nextChar !== '\n') {
        result = result + '\n';
        modified = true;
      }
      
      return result;
    });
    
    // Fix: Trailing punctuation in headings (MD026)
    const headingPunctuationRegex = /^(#{1,6} .+[:.!?])$/gm;
    content = content.replace(headingPunctuationRegex, (match) => {
      modified = true;
      return match.replace(/[:.!?]$/, '');
    });
    
    // Fix: Missing blank lines around lists (MD032)
    const listRegex = /^([ \t]*[-*+] .+)$/gm;
    content = content.replace(listRegex, (match, list) => {
      const prevChar = content.substring(content.indexOf(match) - 1, content.indexOf(match));
      const nextChar = content.substring(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 1);
      
      let result = match;
      
      if (prevChar !== '\n' && content.indexOf(match) > 0) {
        result = '\n' + result;
        modified = true;
      }
      
      if (nextChar !== '\n') {
        result = result + '\n';
        modified = true;
      }
      
      return result;
    });
    
    // Fix: Missing blank lines around fenced code blocks (MD031)
    const codeBlockRegex = /^(```[a-z]*)$/gm;
    content = content.replace(codeBlockRegex, (match) => {
      const prevChar = content.substring(content.indexOf(match) - 1, content.indexOf(match));
      
      let result = match;
      
      if (prevChar !== '\n' && content.indexOf(match) > 0) {
        result = '\n' + result;
        modified = true;
      }
      
      return result;
    });
    
    // Fix: Files should end with a single newline character (MD047)
    if (!content.endsWith('\n')) {
      content += '\n';
      modified = true;
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(file, content);
      fixedCount++;
    }
  }
  
  if (fixedCount > 0) {
    issues.fixed.push(`Fixed markdown issues in ${fixedCount} files`);
    console.log(chalk.green(`✓ Fixed markdown issues in ${fixedCount} files`));
  }
}

/**
 * Check for file structure issues
 */
function checkFileStructure() {
  console.log(chalk.yellow('\n=== Checking file structure ==='));
  
  // Check for essential directories
  const essentialDirs = ['src', 'public', 'scripts', 'docs'];
  const missingDirs = essentialDirs.filter(dir => !fs.existsSync(path.join(rootDir, dir)));
  
  if (missingDirs.length > 0) {
    issues.major.push(`Missing essential directories: ${missingDirs.join(', ')}`);
    
    // Create missing directories
    for (const dir of missingDirs) {
      console.log(chalk.blue(`Creating missing directory: ${dir}`));
      fs.mkdirSync(path.join(rootDir, dir), { recursive: true });
      issues.fixed.push(`Created missing directory: ${dir}`);
    }
  } else {
    console.log(chalk.green('✓ All essential directories exist'));
  }
  
  // Check for essential files
  const essentialFiles = [
    'README.md',
    '.gitignore',
    'package.json'
  ];
  
  const missingFiles = essentialFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));
  
  if (missingFiles.length > 0) {
    issues.major.push(`Missing essential files: ${missingFiles.join(', ')}`);
    
    // Create basic versions of missing files
    for (const file of missingFiles) {
      if (file === 'README.md') {
        console.log(chalk.blue('Creating basic README.md'));
        const packageJson = require(path.join(rootDir, 'package.json'));
        const readmeContent = `# ${packageJson.name || 'Print-on-Demand Application'}\n\n${packageJson.description || 'A React-based web application for selecting and publishing print-on-demand designs.'}\n`;
        fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);
        issues.fixed.push('Created basic README.md');
      }
      
      if (file === '.gitignore') {
        console.log(chalk.blue('Creating basic .gitignore'));
        const gitignoreContent = `# Dependencies\nnode_modules/\n\n# Production\nbuild/\ndist/\n\n# Testing\ncoverage/\n\n# Environment\n.env\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local\n\n# Logs\nnpm-debug.log*\nyarn-debug.log*\nyarn-error.log*\n\n# Editor\n.idea/\n.vscode/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n`;
        fs.writeFileSync(path.join(rootDir, '.gitignore'), gitignoreContent);
        issues.fixed.push('Created basic .gitignore');
      }
    }
  } else {
    console.log(chalk.green('✓ All essential files exist'));
  }
  
  // Check for empty directories
  const allDirs = findDirectories(rootDir);
  const emptyDirs = allDirs.filter(dir => {
    const files = fs.readdirSync(dir);
    return files.length === 0;
  });
  
  if (emptyDirs.length > 0) {
    const relativePaths = emptyDirs.map(dir => path.relative(rootDir, dir));
    issues.minor.push(`Found ${emptyDirs.length} empty directories: ${relativePaths.join(', ')}`);
    
    // Create .gitkeep files in empty directories
    for (const dir of emptyDirs) {
      console.log(chalk.blue(`Adding .gitkeep to empty directory: ${path.relative(rootDir, dir)}`));
      fs.writeFileSync(path.join(dir, '.gitkeep'), '');
      issues.fixed.push(`Added .gitkeep to empty directory: ${path.relative(rootDir, dir)}`);
    }
  } else {
    console.log(chalk.green('✓ No empty directories found'));
  }
}

/**
 * Check for configuration files
 */
function checkConfigFiles() {
  console.log(chalk.yellow('\n=== Checking configuration files ==='));
  
  // Check for environment files
  const envFiles = ['.env', '.env.example', '.env.staging', '.env.production'];
  const missingEnvFiles = envFiles.filter(file => !fs.existsSync(path.join(rootDir, file)));
  
  if (missingEnvFiles.includes('.env.example') && !missingEnvFiles.includes('.env')) {
    console.log(chalk.blue('Creating .env.example from .env'));
    const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
    const exampleContent = envContent.replace(/=.*/g, '=');
    fs.writeFileSync(path.join(rootDir, '.env.example'), exampleContent);
    issues.fixed.push('Created .env.example from .env');
    missingEnvFiles.splice(missingEnvFiles.indexOf('.env.example'), 1);
  }
  
  if (missingEnvFiles.length > 0) {
    issues.minor.push(`Missing environment files: ${missingEnvFiles.join(', ')}`);
  } else {
    console.log(chalk.green('✓ All environment files exist'));
  }
  
  // Check for editor config
  if (!fs.existsSync(path.join(rootDir, '.editorconfig'))) {
    console.log(chalk.blue('Creating .editorconfig'));
    const editorConfigContent = `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
`;
    fs.writeFileSync(path.join(rootDir, '.editorconfig'), editorConfigContent);
    issues.fixed.push('Created .editorconfig');
  }
  
  // Check for prettier config
  if (!fs.existsSync(path.join(rootDir, '.prettierrc')) && isPackageInstalled('prettier')) {
    console.log(chalk.blue('Creating .prettierrc'));
    const prettierConfigContent = `{
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
`;
    fs.writeFileSync(path.join(rootDir, '.prettierrc'), prettierConfigContent);
    issues.fixed.push('Created .prettierrc');
  }
}

/**
 * Find all files with a specific extension
 */
function findFiles(dir, extension, files = []) {
  if (ignoreDirs.some(ignoreDir => dir.includes(ignoreDir))) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFiles(fullPath, extension, files);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Find all directories
 */
function findDirectories(dir, directories = []) {
  if (ignoreDirs.some(ignoreDir => dir.includes(ignoreDir))) {
    return directories;
  }
  
  directories.push(dir);
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dir, entry.name);
      findDirectories(fullPath, directories);
    }
  }
  
  return directories;
}

/**
 * Run all checks
 */
function runAllChecks() {
  console.log(chalk.green('=== Starting Project Health Check ==='));
  
  checkPackageJson();
  checkDependencies();
  checkLinting();
  checkMarkdownFiles();
  checkFileStructure();
  checkConfigFiles();
  
  // Print summary
  console.log(chalk.green('\n=== Health Check Summary ==='));
  
  if (issues.critical.length > 0) {
    console.log(chalk.red(`\n${issues.critical.length} Critical Issues:`));
    issues.critical.forEach(issue => console.log(chalk.red(`- ${issue}`)));
  }
  
  if (issues.major.length > 0) {
    console.log(chalk.yellow(`\n${issues.major.length} Major Issues:`));
    issues.major.forEach(issue => console.log(chalk.yellow(`- ${issue}`)));
  }
  
  if (issues.minor.length > 0) {
    console.log(chalk.blue(`\n${issues.minor.length} Minor Issues:`));
    issues.minor.forEach(issue => console.log(chalk.blue(`- ${issue}`)));
  }
  
  if (issues.fixed.length > 0) {
    console.log(chalk.green(`\n${issues.fixed.length} Issues Fixed:`));
    issues.fixed.forEach(issue => console.log(chalk.green(`- ${issue}`)));
  }
  
  if (issues.critical.length === 0 && issues.major.length === 0 && issues.minor.length === 0) {
    console.log(chalk.green('\n✓ No issues found! Project is healthy.'));
  } else if (issues.critical.length === 0 && issues.major.length === 0) {
    console.log(chalk.green('\n✓ Only minor issues found. Project is generally healthy.'));
  } else {
    console.log(chalk.yellow('\n⚠ Some issues need attention. See above for details.'));
  }
}

// Run all checks
runAllChecks();
