/**
 * Configuration for Vercel deployment tests
 * Update this file with your specific application details
 */
module.exports = {
  // Your application URLs
  urls: {
    production: 'https://your-app.vercel.app',
    preview: 'https://your-branch-name.vercel.app', // For branch deployments
    local: 'http://localhost:3000',
  },
  
  // API endpoints to test
  apiEndpoints: [
    { path: '/api/users', method: 'GET', requiresAuth: false },
    { path: '/api/products', method: 'GET', requiresAuth: false },
    // Add more endpoints as needed
  ],
  
  // Test user credentials (for authenticated endpoints)
  testUser: {
    email: 'test@example.com',
    password: 'testPassword123'
  },
  
  // Vercel specific settings
  vercel: {
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID, // Optional
    projectId: process.env.VERCEL_PROJECT_ID
  },
  
  // Performance thresholds
  thresholds: {
    performance: 80,
    accessibility: 90,
    bestPractices: 85,
    seo: 90,
    maxResponseTime: 500 // ms
  },
  
  // Static assets to test for CDN configuration
  staticAssets: [
    '/_next/static/chunks/main.js',
    '/images/logo.png',
    '/styles/main.css'
  ],
  
  // Security headers to check
  securityHeaders: [
    'strict-transport-security',
    'content-security-policy',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'referrer-policy'
  ]
};