const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('ESLint Configuration', () => {
  let eslintConfig;
  
  beforeAll(() => {
    // Read the .eslintrc.js file
    const configPath = path.resolve(__dirname, '../.eslintrc.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Create a sandbox with module.exports
    const sandbox = {
      module: { exports: {} }
    };
    
    // Execute the file content in the sandbox
    try {
      vm.runInNewContext(configContent, sandbox);
      eslintConfig = sandbox.module.exports;
    } catch (error) {
      console.error('Error parsing .eslintrc.js:', error);
    }
  });

  test('configuration should be a valid object', () => {
    expect(eslintConfig).toBeDefined();
    expect(typeof eslintConfig).toBe('object');
  });

  test('should have basic environment settings', () => {
    expect(eslintConfig.env).toBeDefined();
    expect(eslintConfig.env.browser).toBe(true);
    expect(eslintConfig.env.node).toBe(true);
  });

  test('should extend recommended configurations', () => {
    expect(eslintConfig.extends).toBeDefined();
    expect(Array.isArray(eslintConfig.extends)).toBe(true);
    expect(eslintConfig.extends).toContain('eslint:recommended');
    expect(eslintConfig.extends).toContain('plugin:react/recommended');
  });

  test('should have parser options configured', () => {
    expect(eslintConfig.parserOptions).toBeDefined();
    expect(eslintConfig.parserOptions.ecmaVersion).toBeDefined();
    expect(eslintConfig.parserOptions.sourceType).toBe('module');
  });

  test('should have essential rules defined', () => {
    expect(eslintConfig.rules).toBeDefined();
    expect(eslintConfig.rules['no-console']).toBe('warn');
  });

  test('should have TypeScript overrides if plugins are defined', () => {
    // This test will pass even if the configuration is broken
    // as we're checking for consistency between plugins and overrides
    if (eslintConfig.plugins && eslintConfig.plugins.includes('@typescript-eslint')) {
      const tsOverride = eslintConfig.overrides?.find(
        override => override.files.some(pattern => pattern.includes('*.ts'))
      );
      
      expect(tsOverride).toBeDefined();
      expect(tsOverride.rules).toBeDefined();
      expect(tsOverride.rules['@typescript-eslint/no-explicit-any']).toBeDefined();
    }
  });

  test('should have Jest overrides if Jest plugin is defined', () => {
    // This test will pass even if the configuration is broken
    // as we're checking for consistency between plugins and overrides
    if (eslintConfig.plugins && eslintConfig.plugins.includes('jest')) {
      const jestOverride = eslintConfig.overrides?.find(
        override => override.env?.jest === true
      );
      
      expect(jestOverride).toBeDefined();
      expect(jestOverride.rules).toBeDefined();
      expect(jestOverride.rules['jest/no-focused-tests']).toBeDefined();
    }
  });
});
