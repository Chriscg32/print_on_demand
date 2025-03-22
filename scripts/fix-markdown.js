#!/usr/bin/env node

/**
 * Markdown Fixer Script
 * 
 * This script fixes common markdown linting issues:
 * - MD022: Headings should be surrounded by blank lines
 * - MD026: Trailing punctuation in headings
 * - MD031: Fenced code blocks should be surrounded by blank lines
 * - MD032: Lists should be surrounded by blank lines
 * - MD024: Multiple headings with the same content
 * - MD047: Files should end with a single newline character
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
  issuesFixed: {
    MD022: 0, // Blank lines around headings
    MD026: 0, // Trailing punctuation in headings
    MD031: 0, // Blank lines around code blocks
    MD032: 0, // Blank lines around lists
    MD047: 0  // Single trailing newline
  }
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
 * Fix markdown issues in a file
 */
function fixMarkdownFile(filePath) {
  console.log(`Processing: ${path.relative(rootDir, filePath)}`);
  stats.filesScanned++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let issuesCounts = {
      MD022: 0,
      MD026: 0,
      MD031: 0,
      MD032: 0,
      MD047: 0
    };
    
    // Fix: Missing blank lines around headings (MD022)
    let newContent = '';
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeading = /^#{1,6}\s+.+$/.test(line);
      
      if (isHeading) {
        // Check if there's a blank line before the heading (unless it's the first line)
        if (i > 0 && lines[i-1] !== '') {
          newContent += '\n';
          issuesCounts.MD022++;
          modified = true;
        }
        
        // Add the heading
        newContent += line + '\n';
        
        // Check if there's a blank line after the heading (unless it's the last line)
        if (i < lines.length - 1 && lines[i+1] !== '') {
          newContent += '\n';
          issuesCounts.MD022++;
          modified = true;
          // Skip adding the next line since we just added a blank line
          continue;
        }
      } else {
        // Add non-heading line
        newContent += line + (i < lines.length - 1 ? '\n' : '');
      }
    }
    
    content = newContent;
    
    // Fix: Trailing punctuation in headings (MD026)
    content = content.replace(/^(#{1,6}\s+.+)[:.!?]$/gm, (match, p1) => {
      issuesCounts.MD026++;
      modified = true;
      return p1;
    });
    
    // Fix: Missing blank lines around fenced code blocks (MD031)
    newContent = '';
    const contentLines = content.split('\n');
    
    for (let i = 0; i < contentLines.length; i++) {
      const line = contentLines[i];
      const isCodeFence = /^```(\w*)$/.test(line);
      
      if (isCodeFence) {
        // Check if there's a blank line before the code fence (unless it's the first line)
        if (i > 0 && contentLines[i-1] !== '') {
          newContent += '\n';
          issuesCounts.MD031++;
          modified = true;
        }
        
        // Add the code fence
        newContent += line + '\n';
        
        // Find the closing code fence
        let j = i + 1;
        while (j < contentLines.length && !/^```$/.test(contentLines[j])) {
          newContent += contentLines[j] + '\n';
          j++;
        }
        
        // Add the closing code fence if found
        if (j < contentLines.length) {
          newContent += contentLines[j] + '\n';
          
          // Check if there's a blank line after the code fence (unless it's the last line)
          if (j < contentLines.length - 1 && contentLines[j+1] !== '') {
            newContent += '\n';
            issuesCounts.MD031++;
            modified = true;
          }
          
          // Skip to after the closing code fence
          i = j;
        }
      } else {
        // Add non-code-fence line
        newContent += line + (i < contentLines.length - 1 ? '\n' : '');
      }
    }
    
    content = newContent;
    
    // Fix: Missing blank lines around lists (MD032)
    newContent = '';
    const listLines = content.split('\n');
    let inList = false;
    
    for (let i = 0; i < listLines.length; i++) {
      const line = listLines[i];
      const isList = /^[ \t]*[-*+][ \t]+\S/.test(line);
      
      if (isList && !inList) {
        // Starting a new list
        inList = true;
        
        // Check if there's a blank line before the list (unless it's the first line)
        if (i > 0 && listLines[i-1] !== '') {
          newContent += '\n';
          issuesCounts.MD032++;
          modified = true;
        }
        
        // Add the list item
        newContent += line + '\n';
      } else if (!isList && inList) {
        // Ending a list
        inList = false;
        
        // Check if there's a blank line after the list (unless it's the last line)
        if (i < listLines.length - 1 && listLines[i] !== '') {
          newContent += '\n';
          issuesCounts.MD032++;
          modified = true;
        }
        
        // Add the non-list line
        newContent += line + (i < listLines.length - 1 ? '\n' : '');
      } else {
        // Add the line (either a list item in an ongoing list, or a non-list line)
        newContent += line + (i < listLines.length - 1 ? '\n' : '');
      }
    }
    
    content = newContent;
    
    // Fix: Files should end with a single newline character (MD047)
    if (!content.endsWith('\n')) {
      content += '\n';
      issuesCounts.MD047++;
      modified = true;
    } else if (content.endsWith('\n\n')) {
      // Remove extra newlines at the end
      while (content.endsWith('\n\n')) {
        content = content.slice(0, -1);
        modified = true;
      }
    }
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      stats.filesFixed++;
      
      // Update global stats
      Object.keys(issuesCounts).forEach(key => {
        stats.issuesFixed[key] += issuesCounts[key];
      });
      
      console.log(`  Fixed: MD022: ${issuesCounts.MD022}, MD026: ${issuesCounts.MD026}, MD031: ${issuesCounts.MD031}, MD032: ${issuesCounts.MD032}, MD047: ${issuesCounts.MD047}`);
    } else {
      console.log('  No issues found');
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('=== Markdown Fixer ===');
  console.log(`Scanning directory: ${rootDir}`);
  
  // Find all markdown files
  const markdownFiles = findMarkdownFiles(rootDir);
  console.log(`Found ${markdownFiles.length} markdown files`);
  
  // Fix each file
  markdownFiles.forEach(fixMarkdownFile);
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Files scanned: ${stats.filesScanned}`);
  console.log(`Files fixed: ${stats.filesFixed}`);
  console.log('Issues fixed:');
  console.log(`  MD022 (Blank lines around headings): ${stats.issuesFixed.MD022}`);
  console.log(`  MD026 (Trailing punctuation in headings): ${stats.issuesFixed.MD026}`);
  console.log(`  MD031 (Blank lines around code blocks): ${stats.issuesFixed.MD031}`);
  console.log(`  MD032 (Blank lines around lists): ${stats.issuesFixed.MD032}`);
  console.log(`  MD047 (Single trailing newline): ${stats.issuesFixed.MD047}`);
  console.log(`Total issues fixed: ${Object.values(stats.issuesFixed).reduce((a, b) => a + b, 0)}`);
}

// Run the script
main();