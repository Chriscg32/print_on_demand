const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Tests the environment configuration
 * @returns {Promise<{success: boolean, details: Object, errors: Array}>}
 */
const testEnvironmentConfig = async () => {
  try {
    console.log('Testing environment configuration...');
    
    // Check for .env files
    const rootDir = process.cwd();
    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.test'
    ];
    
    const foundEnvFiles = [];
    
    for (const file of envFiles) {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        foundEnvFiles.push(file);
      }
    }
    
    if (foundEnvFiles.length === 0) {
      return {
        success: false,
        details: { envFiles },
        errors: [{
          message: 'No environment configuration files found',
          fix: 'Create .env files with necessary environment variables'
        }]
      };
    }
    
    // Check for required environment variables
    const requiredVars = [
      'NODE_ENV',
      'REACT_APP_API_URL',
      'REACT_APP_AUTH_DOMAIN'
    ];
    
    // Load environment variables from .env file
    const envPath = path.join(rootDir, '.env');
    let envVars = {};
    
    if (fs.existsSync(envPath)) {
      envVars = dotenv.parse(fs.readFileSync(envPath));
    }
    
    // Check for missing required variables
    const missingVars = [];
    
    for (const variable of requiredVars) {
      if (!envVars[variable] && !process.env[variable]) {
        missingVars.push(variable);
      }
    }
    
    if (missingVars.length > 0) {
      return {
        success: false,
        details: { 
          foundEnvFiles,
          missingVars
        },
        errors: [{
          message: `Missing required environment variables: ${missingVars.join(', ')}`,
          fix: 'Add the missing variables to your .env file'
        }]
      };
    }
    
    // Check for environment-specific configurations
    const hasDevConfig = fs.existsSync(path.join(rootDir, '.env.development'));
    const hasProdConfig = fs.existsSync(path.join(rootDir, '.env.production'));
    
    if (!hasDevConfig || !hasProdConfig) {
      return {
        success: true,
        details: {
          foundEnvFiles,
          hasDevConfig,
          hasProdConfig
        },
        warnings: [{
          message: `Missing environment-specific configuration: ${!hasDevConfig ? '.env.development' : '.env.production'}`,
          fix: 'Create environment-specific .env files for better configuration management'
        }]
      };
    }
    
    return {
      success: true,
      details: {
        foundEnvFiles,
        hasDevConfig,
        hasProdConfig
      },
      errors: []
    };
  } catch (error) {
    return {
      success: false,
      details: {},
      errors: [{
        message: `Environment configuration test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check environment configuration files'
      }]
    };
  }
};

module.exports = {
  testEnvironmentConfig
};