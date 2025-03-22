const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

/**
 * Tests CSS compilation, specifically focusing on Tailwind CSS
 * to ensure it processes correctly.
 */
exports.testCssCompilation = async () => {
  try {
    // Check if the main CSS file exists
    const cssFilePath = path.join(process.cwd(), 'src', 'index.css');
    if (!fs.existsSync(cssFilePath)) {
      return {
        success: false,
        errors: [{
          message: 'Main CSS file (src/index.css) not found',
          fix: 'Create the main CSS file with Tailwind directives'
        }]
      };
    }
    
    // Read the CSS file
    const css = fs.readFileSync(cssFilePath, 'utf8');
    
    // Check for Tailwind directives
    const hasTailwindBase = css.includes('@tailwind base');
    const hasTailwindComponents = css.includes('@tailwind components');
    const hasTailwindUtilities = css.includes('@tailwind utilities');
    
    const missingDirectives = [];
    if (!hasTailwindBase) missingDirectives.push('@tailwind base');
    if (!hasTailwindComponents) missingDirectives.push('@tailwind components');
    if (!hasTailwindUtilities) missingDirectives.push('@tailwind utilities');
    
    if (missingDirectives.length > 0) {
      return {
        success: false,
        errors: [{
          message: `Missing Tailwind directives: ${missingDirectives.join(', ')}`,
          fix: `Add the following directives to your CSS file: ${missingDirectives.join(', ')}`
        }]
      };
    }
    
    // Check if tailwind.config.js exists
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.js');
    if (!fs.existsSync(tailwindConfigPath)) {
      return {
        success: false,
        errors: [{
          message: 'Tailwind configuration file (tailwind.config.js) not found',
          fix: 'Create a tailwind.config.js file with appropriate configuration'
        }]
      };
    }
    
    // Try to process the CSS with PostCSS and Tailwind
    try {
      const tailwindConfig = require(tailwindConfigPath);
      const result = await postcss([
        tailwindcss(tailwindConfig),
        autoprefixer
      ]).process(css, { from: cssFilePath });
      
      // Check if the processed CSS contains Tailwind classes
      const processedCss = result.css;
      const hasTailwindClasses = processedCss.length > css.length * 2; // Simple heuristic
      
      if (!hasTailwindClasses) {
        return {
          success: false,
          errors: [{
            message: 'Tailwind CSS processing did not generate expected output',
            fix: 'Check your Tailwind configuration and ensure content paths are correctly set'
          }]
        };
      }
      
      return {
        success: true,
        details: {
          cssFileSize: css.length,
          processedCssSize: processedCss.length,
          tailwindDirectivesFound: 3 - missingDirectives.length
        }
      };
    } catch (processingError) {
      return {
        success: false,
        errors: [{
          message: `CSS processing failed: ${processingError.message}`,
          stack: processingError.stack,
          fix: 'Check your Tailwind and PostCSS configuration'
        }]
      };
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `CSS test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Ensure all CSS-related dependencies are installed and configured correctly'
      }]
    };
  }
};