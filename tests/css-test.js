const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Tests the CSS compilation process
 * @returns {Promise<{success: boolean, details: Object, errors: Array}>}
 */
const testCssCompilation = async () => {
  try {
    console.log('Testing CSS compilation...');
    
    // Check if source CSS/SCSS files exist
    const srcDir = path.join(process.cwd(), 'src');
    const stylesDir = path.join(srcDir, 'styles');
    const stylesExist = fs.existsSync(stylesDir);
    
    if (!stylesExist) {
      return {
        success: false,
        details: { stylesDir },
        errors: [{
          message: 'Styles directory does not exist',
          fix: 'Ensure the project has a styles directory with CSS/SCSS files'
        }]
      };
    }
    
    // Check for CSS preprocessor configuration
    const hasPostCSS = fs.existsSync(path.join(process.cwd(), 'postcss.config.js'));
    const hasTailwind = fs.existsSync(path.join(process.cwd(), 'tailwind.config.js'));
    const hasSass = fs.existsSync(path.join(process.cwd(), 'src/styles/index.scss')) || 
                   fs.existsSync(path.join(process.cwd(), 'src/styles/main.scss'));
    
    // Try to compile CSS
    try {
      if (hasTailwind) {
        // For Tailwind projects, we can test the compilation
        execSync('npx tailwindcss -i ./src/styles/index.css -o ./test-output.css', { stdio: 'pipe' });
        
        // Clean up test output
        if (fs.existsSync('./test-output.css')) {
          fs.unlinkSync('./test-output.css');
        }
      } else if (hasSass) {
        // For Sass projects
        execSync('npx sass ./src/styles/index.scss ./test-output.css', { stdio: 'pipe' });
        
        // Clean up test output
        if (fs.existsSync('./test-output.css')) {
          fs.unlinkSync('./test-output.css');
        }
      }
    } catch (compileError) {
      return {
        success: false,
        details: { 
          hasTailwind,
          hasPostCSS,
          hasSass
        },
        errors: [{
          message: `CSS compilation failed: ${compileError.message}`,
          stack: compileError.stack,
          fix: 'Check CSS syntax and preprocessor configuration'
        }]
      };
    }
    
    // Check for CSS validation issues
    const cssFiles = findCssFiles(stylesDir);
    const cssIssues = [];
    
    for (const file of cssFiles) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Simple CSS validation checks
      const unclosedBraces = (content.match(/{/g) || []).length !== (content.match(/}/g) || []).length;
      const unclosedComments = (content.match(/\/\*/g) || []).length !== (content.match(/\*\//g) || []).length;
      const invalidSelectors = content.includes('..') || content.includes('##');
      
      if (unclosedBraces || unclosedComments || invalidSelectors) {
        cssIssues.push({
          file: path.relative(process.cwd(), file),
          issues: {
            unclosedBraces,
            unclosedComments,
            invalidSelectors
          }
        });
      }
    }
    
    if (cssIssues.length > 0) {
      return {
        success: false,
        details: { 
          cssIssues,
          hasTailwind,
          hasPostCSS,
          hasSass
        },
        errors: [{
          message: `CSS validation issues found in ${cssIssues.length} files`,
          fix: 'Fix syntax errors in CSS files'
        }]
      };
    }
    
    return {
      success: true,
      details: {
        cssFiles: cssFiles.map(file => path.relative(process.cwd(), file)),
        hasTailwind,
        hasPostCSS,
        hasSass
      },
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      details: {},
      errors: [{
        message: `CSS compilation test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check CSS files and build configuration'
      }]
    };
  }
};

/**
 * Recursively finds all CSS files in a directory
 * @param {string} dir - Directory to search
 * @returns {Array<string>} Array of file paths
 */
function findCssFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findCssFiles(filePath));
    } else if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.sass')) {
      results.push(filePath);
    }
  }
  
  return results;
}

module.exports = {
  testCssCompilation
};