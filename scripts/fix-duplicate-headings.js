#!/usr/bin/env node

/**
 * Duplicate Heading Fixer Script
 * 
 * This script fixes the MD024 issue (Multiple headings with the same content)
 * by adding unique identifiers to duplicate headings.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = process.argv[2] || path.resolve(__dirname, '..');
const ignoreDirs = [
  'node_modules',
  '.git',
  'build',
  'dist',
  'coverage'
];

// Track statistics
const stats = {
  filesScanned: 0,
  filesFixed: 0,
  headingsFixed: 0
};

/**
 * Find all markdown files in a directory
 */
function findMarkdownFiles(dir, files = []) {
  if (ignoreDirs.some(ignoreDir => dir.includes(ignoreDir))) {
    return files;
  }
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findMarkdownFiles(fullPath, files);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}: ${error.message}`);
  }
  
  return files;
}

/**
 * Fix duplicate headings in a file
 */
function fixDuplicateHeadings(filePath) {
  console.log(`Processing: ${path.relative(rootDir, filePath)}`);
  stats.filesScanned++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const headings = {};
    let modified = false;
    
    // First pass: collect all headings
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headingMatch) {
        const level = headingMatch[1];
        const text = headingMatch[2];
        
        if (!headings[text]) {
          headings[text] = {
            count: 1,
            positions: [i]
          };
        } else {
          headings[text].count++;
          headings[text].positions.push(i);
        }
      }
    }
    
    // Second pass: fix duplicate headings
    const newLines = [...lines];
    
    for (const [text, info] of Object.entries(headings)) {
      if (info.count > 1) {
        // Skip the first occurrence, modify the rest
        for (let i = 1; i < info.positions.length; i++) {
          const pos = info.positions[i];
          const headingMatch = newLines[pos].match(/^(#{1,6})\s+(.+)$/);
          
          if (headingMatch) {
            const level = headingMatch[1];
            const newText = `${text} (${i + 1})`;
            newLines[pos] = `${level} ${newText}`;
            modified = true;
            stats.headingsFixed++;
          }
        }
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, newLines.join('\n'));
      stats.filesFixed++;
      console.log(`  Fixed ${Object.values(headings).filter(h => h.count > 1).length} duplicate heading types`);
    } else {
      console.log('  No duplicate headings found');
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('=== Duplicate Heading Fixer ===');
  console.log(`Scanning directory: ${rootDir}`);
  
  // Find all markdown files
  const markdownFiles = findMarkdownFiles(rootDir);
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  // Fix each file
  markdownFiles.forEach(fixDuplicateHeadings);
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files fixed: ${stats.filesFixed}`);
  console.log(`Duplicate headings fixed: ${stats.headingsFixed}`);
}

// Run the script
main();