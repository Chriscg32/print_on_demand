const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Tests the build process for the application
 * @returns {Promise<{success: boolean, details: Object, errors: Array}>}
 */
const testBuildProcess = async () => {
  try {
    // Run the build command
    console.log('Running build process...');
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check if build directory exists
    const buildDir = path.join(process.cwd(), 'build');
    const buildExists = fs.existsSync(buildDir);
    
    if (!buildExists) {
      return {
        success: false,
        details: { buildDir },
        errors: [{
          message: 'Build directory does not exist after build process',
          fix: 'Check build configuration and ensure output directory is set correctly'
        }]
      };
    }
    
    // Check for essential build artifacts
    const requiredFiles = ['index.html', 'static/js', 'static/css'];
    const missingFiles = [];
    
    for (const file of requiredFiles) {
      const filePath = path.join(buildDir, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        details: { buildDir, missingFiles },
        errors: [{
          message: `Missing required build artifacts: ${missingFiles.join(', ')}`,
          fix: 'Check build configuration and webpack/bundler settings'
        }]
      };
    }
    
    // Check bundle sizes
    const jsDir = path.join(buildDir, 'static/js');
    const cssDir = path.join(buildDir, 'static/css');
    
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    
    const bundleSizes = {
      js: {},
      css: {}
    };
    
    let totalJsSize = 0;
    let totalCssSize = 0;
    
    for (const file of jsFiles) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      bundleSizes.js[file] = formatSize(stats.size);
      totalJsSize += stats.size;
    }
    
    for (const file of cssFiles) {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      bundleSizes.css[file] = formatSize(stats.size);
      totalCssSize += stats.size;
    }
    
    bundleSizes.totalJs = formatSize(totalJsSize);
    bundleSizes.totalCss = formatSize(totalCssSize);
    
    // Check if bundle sizes are within acceptable limits
    const maxJsSize = 1024 * 1024; // 1MB
    const maxCssSize = 200 * 1024; // 200KB
    
    const warnings = [];
    
    if (totalJsSize > maxJsSize) {
      warnings.push({
        message: `Total JS bundle size (${formatSize(totalJsSize)}) exceeds recommended limit of ${formatSize(maxJsSize)}`,
        fix: 'Consider code splitting, tree shaking, or removing unused dependencies'
      });
    }
    
    if (totalCssSize > maxCssSize) {
      warnings.push({
        message: `Total CSS bundle size (${formatSize(totalCssSize)}) exceeds recommended limit of ${formatSize(maxCssSize)}`,
        fix: 'Consider optimizing CSS, removing unused styles, or using CSS-in-JS'
      });
    }
    
    return {
      success: true,
      details: {
        buildDir,
        bundleSizes,
        warnings: warnings.length > 0 ? warnings : undefined
      },
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      details: {},
      errors: [{
        message: `Build process failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check build scripts and dependencies'
      }]
    };
  }
};

/**
 * Formats a file size in bytes to a human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

module.exports = {
  testBuildProcess
};