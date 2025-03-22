const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Tests the build process to ensure it completes successfully
 * and generates the expected output files.
 */
exports.testBuildProcess = async () => {
  try {
    // Run the build command
    execSync('npm run build', { stdio: 'pipe' });
    
    // Check if the build directory exists
    const buildDir = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(buildDir)) {
      return {
        success: false,
        errors: [{
          message: 'Build directory (dist) was not created',
          fix: 'Check your build configuration in vite.config.js'
        }]
      };
    }
    
    // Check for essential build artifacts
    const requiredFiles = ['index.html', 'assets'];
    const missingFiles = requiredFiles.filter(file => 
      !fs.existsSync(path.join(buildDir, file))
    );
    
    if (missingFiles.length > 0) {
      return {
        success: false,
        errors: [{
          message: `Missing required build artifacts: ${missingFiles.join(', ')}`,
          fix: 'Check your build configuration and ensure all entry points are correctly defined'
        }]
      };
    }
    
    // Check for JS and CSS files in assets
    const assetsDir = path.join(buildDir, 'assets');
    const hasJsFiles = fs.readdirSync(assetsDir).some(file => file.endsWith('.js'));
    const hasCssFiles = fs.readdirSync(assetsDir).some(file => file.endsWith('.css'));
    
    if (!hasJsFiles) {
      return {
        success: false,
        errors: [{
          message: 'No JavaScript files found in build output',
          fix: 'Check your build configuration and ensure JavaScript is being processed correctly'
        }]
      };
    }
    
    if (!hasCssFiles) {
      return {
        success: false,
        errors: [{
          message: 'No CSS files found in build output',
          fix: 'Check your build configuration and ensure CSS is being processed correctly'
        }]
      };
    }
    
    // Check index.html for correct references
    const indexHtml = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');
    if (!indexHtml.includes('assets/')) {
      return {
        success: false,
        errors: [{
          message: 'index.html does not reference assets correctly',
          fix: 'Check your build configuration and ensure asset paths are correctly generated'
        }]
      };
    }
    
    return {
      success: true,
      details: {
        buildDirectory: buildDir,
        assetsFound: fs.readdirSync(assetsDir).length
      }
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `Build process failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check the build command output for specific errors'
      }]
    };
  }
};