const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Tests environment configuration to ensure all required
 * environment variables are defined and accessible.
 */
exports.testEnvironmentConfig = async () => {
  try {
    // Check for .env files
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production'
    ];
    
    const foundEnvFiles = envFiles.filter(file => 
      fs.existsSync(path.join(process.cwd(), file))
    );
    
    if (foundEnvFiles.length === 0) {
      return {
        success: false,
        errors: [{
          message: 'No environment configuration files found',
          fix: 'Create at least a .env file with your environment variables'
        }]
      };
    }
    
    // Check for .env.example
    const hasEnvExample = fs.existsSync(path.join(process.cwd(), '.env.example'));
    
    if (!hasEnvExample) {
      return {
        success: false,
        errors: [{
          message: '.env.example file is missing',
          fix: 'Create a .env.example file with placeholder values for required environment variables'
        }]
      };
    }
    
    // Load .env.example to determine required variables
    const envExampleContent = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
    const requiredVars = envExampleContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0].trim());
    
    if (requiredVars.length === 0) {
      return {
        success: false,
        errors: [{
          message: '.env.example file does not define any variables',
          fix: 'Add required environment variables to your .env.example file'
        }]
      };
    }
    
    // Load actual environment variables
    const envPath = path.join(process.cwd(), '.env');
    let envVars = {};
    
    if (fs.existsSync(envPath)) {
      envVars = dotenv.parse(fs.readFileSync(envPath));
    }
    
    // Check for missing required variables
    const missingVars = requiredVars.filter(varName => !envVars[varName]);
    
    if (missingVars.length > 0) {
      return {
        success: false,
        errors: [{
          message: `Missing required environment variables: ${missingVars.join(', ')}`,
          fix: `Add the missing variables to your .env file: ${missingVars.join(', ')}`
        }]
      };
    }
    
    // Check for Vercel-specific environment configuration
    const hasVercelEnv = foundEnvFiles.some(file => file.includes('vercel'));
    
    return {
      success: true,
      details: {
        envFilesFound: foundEnvFiles,
        requiredVariablesCount: requiredVars.length,
        hasVercelSpecificConfig: hasVercelEnv
      },
      warnings: hasVercelEnv ? [] : [{
        message: 'No Vercel-specific environment configuration found',
        fix: 'Consider adding a .env.production file for Vercel-specific configuration'
      }]
    };
  } catch (error) {
    return {
      success: false,
      errors: [{
        message: `Environment configuration test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check your environment files for syntax errors'
      }]
    };
  }
};