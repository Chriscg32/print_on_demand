#!/usr/bin/env node

/**
 * Fix All Markdown Issues Script
 * 
 * This script runs all markdown fixers to address common issues:
 * - MD022: Headings should be surrounded by blank lines
 * - MD024: Multiple headings with the same content
 * - MD026: Trailing punctuation in headings
 * - MD031: Fenced code blocks should be surrounded by blank lines
 * - MD032: Lists should be surrounded by blank lines
 * - MD047: Files should end with a single newline character
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuration
const rootDir = process.argv[2] || path.resolve(__dirname, '..');

console.log('=== Fix All Markdown Issues ===');
console.log(`Working directory: ${rootDir}`);

// Run the markdown fixer
console.log('\n1. Running general markdown fixer...');
try {
  execSync(`node ${path.join(__dirname, 'fix-markdown.js')} "${rootDir}"`, { 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('Error running markdown fixer:', error.message);
}

// Run the duplicate heading fixer
console.log('\n2. Running duplicate heading fixer...');
try {
  execSync(`node ${path.join(__dirname, 'fix-duplicate-headings.js')} "${rootDir}"`, { 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('Error running duplicate heading fixer:', error.message);
}

// Run the markdown fixer again to ensure any new issues are fixed
console.log('\n3. Running final pass of markdown fixer...');
try {
  execSync(`node ${path.join(__dirname, 'fix-markdown.js')} "${rootDir}"`, { 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('Error running final markdown fixer pass:', error.message);
}

console.log('\n=== All Done! ===');
console.log('All markdown issues should now be fixed.');
console.log('If you still see issues, you may need to run the scripts again or fix some issues manually.');