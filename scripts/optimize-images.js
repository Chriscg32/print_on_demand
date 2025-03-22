#!/usr/bin/env node

/**
 * Image Analysis Script
 * 
 * This script finds and analyzes images in the public directory
 * to help identify optimization opportunities without requiring
 * external dependencies.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const publicDir = path.resolve(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const largeImageThreshold = 200 * 1024; // 200KB

// Track statistics
const stats = {
  found: 0,
  large: 0,
  totalSize: 0
};

/**
 * Find all image files in a directory
 */
function findImageFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return files;
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        findImageFiles(fullPath, files);
      } else if (entry.isFile() && imageExtensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(fullPath);
        stats.found++;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Analyze an image file
 */
function analyzeImage(filePath) {
  try {
    const fileSize = fs.statSync(filePath).size;
    stats.totalSize += fileSize;
    
    const relativePath = path.relative(publicDir, filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Check if the image is large
    if (fileSize > largeImageThreshold) {
      stats.large++;
      console.log(`Large image: ${relativePath} - ${formatBytes(fileSize)}`);
      
      // Provide optimization suggestions based on file type
      if (ext === '.jpg' || ext === '.jpeg') {
        console.log(`  Suggestion: Compress this JPEG with a tool like ImageOptim or TinyJPG`);
      } else if (ext === '.png') {
        console.log(`  Suggestion: Consider converting to WebP or compress with a PNG optimizer`);
      } else if (ext === '.gif') {
        console.log(`  Suggestion: Consider using an MP4 video or WebP if animation is needed`);
      }
    } else {
      console.log(`Image: ${relativePath} - ${formatBytes(fileSize)}`);
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}: ${error.message}`);
  }
}

/**
 * Format bytes to a human-readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Main function
 */
function main() {
  console.log('=== Image Analysis ===');
  console.log(`Scanning directory: ${publicDir}`);
  
  // Find all image files
  const imageFiles = findImageFiles(publicDir);
  console.log(`Found ${imageFiles.length} images\n`);
  
  // Analyze each image
  for (const file of imageFiles) {
    analyzeImage(file);
  }
  
  // Print summary
  console.log('\n=== Summary ===');
  console.log(`Images found: ${stats.found}`);
  console.log(`Large images (>${formatBytes(largeImageThreshold)}): ${stats.large}`);
  console.log(`Total size: ${formatBytes(stats.totalSize)}`);
  
  console.log('\n=== Optimization Tips ===');
  console.log('1. Use modern formats like WebP where possible');
  console.log('2. Resize images to match their display size');
  console.log('3. For actual optimization, consider these tools:');
  console.log('   - sharp (npm package, requires installation)');
  console.log('   - ImageOptim (desktop app)');
  console.log('   - TinyPNG/TinyJPG (online service)');
  console.log('   - squoosh.app (browser-based tool)');
}

// Run the script
main();
