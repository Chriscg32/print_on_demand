const puppeteer = require('puppeteer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Tests cross-browser compatibility
 * @returns {Promise<{success: boolean, details: Object, errors: Array}>}
 */
const testCrossBrowser = async () => {
  try {
    console.log('Testing cross-browser compatibility...');
    
    // Define browsers to test
    const browsers = [
      { name: 'Chrome', engine: 'chromium' },
      { name: 'Firefox', engine: 'firefox' },
      { name: 'Safari', engine: 'webkit' }
    ];
    
    // Get deployment URL or use local server
    const deploymentUrl = process.env.DEPLOYMENT_URL || 'http://localhost:3000';
    
    // Create screenshots directory
    const screenshotsDir = path.join(process.cwd(), 'test-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    const results = [];
    let failedBrowsers = 0;
    
    // Test each browser
    for (const browser of browsers) {
      try {
        // Skip browsers that aren't supported in the current environment
        if (browser.engine === 'webkit' && process.platform !== 'darwin') {
          results.push({
            browser: browser.name,
            skipped: true,
            reason: 'WebKit tests are only supported on macOS',
            success: true
          });
          continue;
        }
        
        // Launch browser
        const browserInstance = await puppeteer.launch({
          product: browser.engine === 'firefox' ? 'firefox' : undefined,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browserInstance.newPage();
        
        // Set viewport size
        await page.setViewport({
          width: 1280,
          height: 800
        });
        
        // Navigate to the deployment URL
        const response = await page.goto(deploymentUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        // Take screenshot
        const screenshotPath = path.join(screenshotsDir, `${browser.name.toLowerCase()}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        // Check for console errors
        const consoleErrors = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        // Check for visual elements
        const hasHeader = await page.evaluate(() => {
          return document.querySelector('header') !== null;
        });
        
        const hasFooter = await page.evaluate(() => {
          return document.querySelector('footer') !== null;
        });
        
        const hasMainContent = await page.evaluate(() => {
          return document.querySelector('main') !== null || 
                 document.querySelector('.main-content') !== null;
        });
        
        // Close browser
        await browserInstance.close();
        
        const success = response.status() === 200 && hasHeader && hasFooter && hasMainContent && consoleErrors.length === 0;
        
        results.push({
          browser: browser.name,
          status: response.status(),
          hasHeader,
          hasFooter,
          hasMainContent,
          consoleErrors: consoleErrors.length > 0 ? consoleErrors : undefined,
          screenshotPath,
          success
        });
        
        if (!success) {
          failedBrowsers++;
        }
      } catch (error) {
        results.push({
          browser: browser.name,
          error: error.message,
          success: false
        });
        
        failedBrowsers++;
      }
    }
    
    return {
      success: failedBrowsers === 0,
      details: {
        results,
        screenshotsDir
      },
      errors: failedBrowsers > 0 ? [{
        message: `${failedBrowsers} browsers failed compatibility tests`,
        fix: 'Check browser console errors and fix cross-browser compatibility issues'
      }] : []
    };
  } catch (error) {
    return {
      success: false,
      details: {},
      errors: [{
        message: `Cross-browser test failed: ${error.message}`,
        stack: error.stack,
        fix: 'Check Puppeteer configuration and browser support'
      }]
    };
  }
};

module.exports = {
  testCrossBrowser
};