#!/usr/bin/env node

/**
 * Deployment Monitoring Script for Print-on-Demand Application
 * 
 * This script monitors the health of a deployed environment:
 * 1. Checks application availability at regular intervals
 * 2. Monitors API response times
 * 3. Checks for error rates
 * 4. Sends alerts if issues are detected
 * 5. Generates a monitoring report
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const nodemailer = require('nodemailer');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    description: 'Base URL to monitor',
    type: 'string',
    default: 'https://staging.printapp.example.com'
  })
  .option('duration', {
    alias: 'd',
    description: 'Monitoring duration in minutes',
    type: 'number',
    default: 60
  })
  .option('interval', {
    alias: 'i',
    description: 'Check interval in seconds',
    type: 'number',
    default: 30
  })
  .option('threshold', {
    alias: 't',
    description: 'Error threshold percentage to trigger alert',
    type: 'number',
    default: 5
  })
  .option('response-time', {
    alias: 'r',
    description: 'Maximum acceptable response time in ms',
    type: 'number',
    default: 1000
  })
  .option('alert-email', {
    alias: 'e',
    description: 'Email to send alerts to',
    type: 'string'
  })
  .option('verbose', {
    alias: 'v',
    description: 'Verbose output',
    type: 'boolean',
    default: false
  })
  .help()
  .alias('help', 'h')
  .argv;

// Endpoints to monitor
const endpoints = [
  { path: '/', name: 'Home Page' },
  { path: '/designs', name: 'Designs Page' },
  { path: '/publish', name: 'Publish Page' },
  { path: '/api/health', name: 'Health API' },
  { path: '/api/designs/trending', name: 'Trending Designs API' }
];

// Monitoring results
const monitoringResults = {
  startTime: new Date(),
  endTime: null,
  checks: 0,
  errors: 0,
  endpoints: {},
  alerts: [],
  summary: {
    availability: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    errorRate: 0
  }
};

// Initialize endpoint results
endpoints.forEach(endpoint => {
  monitoringResults.endpoints[endpoint.path] = {
    name: endpoint.name,
    checks: 0,
    errors: 0,
    totalResponseTime: 0,
    averageResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity,
    availability: 0,
    errorRate: 0
  };
});

// Email transporter for alerts
let emailTransporter = null;
if (argv.alertEmail) {
  emailTransporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Helper function to log with timestamp
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : type === 'warning' ? '⚠️ ' : '';
  
  if (type === 'error') {
    console.error(`[${timestamp}] ${prefix}${message}`);
  } else if (argv.verbose || type === 'success' || type === 'error' || type === 'warning') {
    console.log(`[${timestamp}] ${prefix}${message}`);
  }
}

// Helper function to send an alert
async function sendAlert(subject, message) {
  if (!emailTransporter || !argv.alertEmail) {
    log(`Alert: ${subject} - ${message}`, 'warning');
    return;
  }
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: argv.alertEmail,
      subject: `[ALERT] ${subject}`,
      text: message,
      html: `<h2>${subject}</h2><p>${message}</p>`
    };
    
    await emailTransporter.sendMail(mailOptions);
    log(`Alert email sent: ${subject}`, 'warning');
  } catch (error) {
    log(`Failed to send alert email: ${error}`, 'error');
  }
}

// Function to check an endpoint
async function checkEndpoint(endpoint) {
  const url = `${argv.url}${endpoint.path}`;
  const startTime = Date.now();
  let success = false;
  let responseTime = 0;
  let errorMessage = null;
  
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      validateStatus: false
    });
    
    responseTime = Date.now() - startTime;
    success = response.status >= 200 && response.status < 300;
    
    if (!success) {
      errorMessage = `HTTP status ${response.status}`;
    }
  } catch (error) {
    responseTime = Date.now() - startTime;
    success = false;
    errorMessage = error.message;
  }
  
  // Update endpoint results
  const endpointResults = monitoringResults.endpoints[endpoint.path];
  endpointResults.checks++;
  
  if (!success) {
    endpointResults.errors++;
    log(`Check failed for ${endpoint.name}: ${errorMessage}`, 'error');
  } else {
    log(`Check passed for ${endpoint.name} (${responseTime}ms)`, success ? 'success' : 'info');
  }
  
  endpointResults.totalResponseTime += responseTime;
  endpointResults.averageResponseTime = endpointResults.totalResponseTime / endpointResults.checks;
  endpointResults.maxResponseTime = Math.max(endpointResults.maxResponseTime, responseTime);
  endpointResults.minResponseTime = Math.min(endpointResults.minResponseTime, responseTime);
  endpointResults.availability = ((endpointResults.checks - endpointResults.errors) / endpointResults.checks) * 100;
  endpointResults.errorRate = (endpointResults.errors / endpointResults.checks) * 100;
  
  // Check for alerts
  if (endpointResults.errorRate > argv.threshold) {
    const alertMessage = `Error rate for ${endpoint.name} is ${endpointResults.errorRate.toFixed(2)}% (threshold: ${argv.threshold}%)`;
    monitoringResults.alerts.push({
      timestamp: new Date(),
      endpoint: endpoint.path,
      message: alertMessage
    });
    
    await sendAlert(`High Error Rate - ${endpoint.name}`, alertMessage);
  }
  
  if (responseTime > argv.responseTime && success) {
    const alertMessage = `Slow response time for ${endpoint.name}: ${responseTime}ms (threshold: ${argv.responseTime}ms)`;
    monitoringResults.alerts.push({
      timestamp: new Date(),
      endpoint: endpoint.path,
      message: alertMessage
    });
    
    await sendAlert(`Slow Response - ${endpoint.name}`, alertMessage);
  }
  
  // Update global results
  monitoringResults.checks++;
  if (!success) {
    monitoringResults.errors++;
  }
  
  return { success, responseTime, errorMessage };
}

// Function to run a monitoring cycle
async function runMonitoringCycle() {
  log('Starting monitoring cycle', 'info');
  
  for (const endpoint of endpoints) {
    await checkEndpoint(endpoint);
  }
  
  // Update summary
  const totalChecks = Object.values(monitoringResults.endpoints).reduce((sum, endpoint) => sum + endpoint.checks, 0);
  const totalErrors = Object.values(monitoringResults.endpoints).reduce((sum, endpoint) => sum + endpoint.errors, 0);
  const totalResponseTime = Object.values(monitoringResults.endpoints).reduce((sum, endpoint) => sum + endpoint.totalResponseTime, 0);
  
  monitoringResults.summary.availability = ((totalChecks - totalErrors) / totalChecks) * 100;
  monitoringResults.summary.averageResponseTime = totalResponseTime / totalChecks;
  monitoringResults.summary.maxResponseTime = Math.max(...Object.values(monitoringResults.endpoints).map(e => e.maxResponseTime));
  monitoringResults.summary.errorRate = (totalErrors / totalChecks) * 100;
  
  log('Monitoring cycle completed', 'info');
}

// Function to generate a monitoring report
function generateReport() {
  monitoringResults.endTime = new Date();
  
  // Calculate duration
  const durationMs = monitoringResults.endTime - monitoringResults.startTime;
  const durationMinutes = Math.round(durationMs / 60000);
  
  // Create report
  const report = {
    title: `Deployment Monitoring Report - ${argv.url}`,
    duration: `${durationMinutes} minutes`,
    startTime: monitoringResults.startTime.toISOString(),
    endTime: monitoringResults.endTime.toISOString(),
    summary: {
      totalChecks: monitoringResults.checks,
      totalErrors: monitoringResults.errors,
      availability: `${monitoringResults.summary.availability.toFixed(2)}%`,
      averageResponseTime: `${monitoringResults.summary.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${monitoringResults.summary.maxResponseTime}ms`,
      errorRate: `${monitoringResults.summary.errorRate.toFixed(2)}%`
    },
    endpoints: Object.entries(monitoringResults.endpoints).map(([path, data]) => ({
      name: data.name,
      path,
      checks: data.checks,
      errors: data.errors,
      availability: `${data.availability.toFixed(2)}%`,
      averageResponseTime: `${data.averageResponseTime.toFixed(2)}ms`,
      maxResponseTime: `${data.maxResponseTime}ms`,
      minResponseTime: data.minResponseTime === Infinity ? 'N/A' : `${data.minResponseTime}ms`,
      errorRate: `${data.errorRate.toFixed(2)}%`
    })),
    alerts: monitoringResults.alerts
  };
  
  // Save report to file
  const reportsDir = path.join(__dirname, '../monitoring-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const timestamp = monitoringResults.startTime.toISOString().replace(/:/g, '-');
  const reportPath = path.join(reportsDir, `monitoring-report-${timestamp}.json`);
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Monitoring report saved to ${reportPath}`, 'success');
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  const htmlReportPath = path.join(reportsDir, `monitoring-report-${timestamp}.html`);
  
  fs.writeFileSync(htmlReportPath, htmlReport);
  log(`HTML report saved to ${htmlReportPath}`, 'success');
  
  // Print summary to console
  console.log('\n=== Monitoring Summary ===');
  console.log(`Duration: ${report.duration}`);
  console.log(`Total Checks: ${report.summary.totalChecks}`);
  console.log(`Total Errors: ${report.summary.totalErrors}`);
  console.log(`Overall Availability: ${report.summary.availability}`);
  console.log(`Average Response Time: ${report.summary.averageResponseTime}`);
  console.log(`Error Rate: ${report.summary.errorRate}`);
  
  if (report.alerts.length > 0) {
    console.log('\n=== Alerts ===');
    report.alerts.forEach((alert, index) => {
      console.log(`${index + 1}. [${new Date(alert.timestamp).toLocaleString()}] ${alert.message}`);
    });
  }
  
  return report;
}

// Function to generate HTML report
function generateHtmlReport(report) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
    h1, h2, h3 { color: #2c3e50; }
    .container { max-width: 1200px; margin: 0 auto; }
    .card { background: #fff; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .summary-item { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
    .summary-item h3 { margin-top: 0; }
    .summary-value { font-size: 24px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f8f9fa; }
    tr:hover { background-color: #f1f1f1; }
    .good { color: #28a745; }
    .warning { color: #ffc107; }
    .danger { color: #dc3545; }
    .alert-item { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px 15px; margin-bottom: 10px; }
    .alert-timestamp { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${report.title}</h1>
    <p>Monitoring period: ${report.startTime} to ${report.endTime} (${report.duration})</p>
    
    <div class="card">
      <h2>Summary</h2>
      <div class="summary">
        <div class="summary-item">
          <h3>Availability</h3>
          <div class="summary-value ${parseFloat(report.summary.availability) > 99 ? 'good' : parseFloat(report.summary.availability) > 95 ? 'warning' : 'danger'}">${report.summary.availability}</div>
        </div>
        <div class="summary-item">
          <h3>Error Rate</h3>
          <div class="summary-value ${parseFloat(report.summary.errorRate) < 1 ? 'good' : parseFloat(report.summary.errorRate) < 5 ? 'warning' : 'danger'}">${report.summary.errorRate}</div>
        </div>
        <div class="summary-item">
          <h3>Avg Response Time</h3>
          <div class="summary-value ${parseFloat(report.summary.averageResponseTime) < 500 ? 'good' : parseFloat(report.summary.averageResponseTime) < 1000 ? 'warning' : 'danger'}">${report.summary.averageResponseTime}</div>
        </div>
        <div class="summary-item">
          <h3>Total Checks</h3>
          <div class="summary-value">${report.summary.totalChecks}</div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <h2>Endpoint Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Availability</th>
            <th>Avg Response</th>
            <th>Max Response</th>
            <th>Error Rate</th>
            <th>Checks</th>
          </tr>
        </thead>
        <tbody>
          ${report.endpoints.map(endpoint => `
            <tr>
              <td><strong>${endpoint.name}</strong><br><small>${endpoint.path}</small></td>
              <td class="${parseFloat(endpoint.availability) > 99 ? 'good' : parseFloat(endpoint.availability) > 95 ? 'warning' : 'danger'}">${endpoint.availability}</td>
              <td class="${parseFloat(endpoint.averageResponseTime) < 500 ? 'good' : parseFloat(endpoint.averageResponseTime) < 1000 ? 'warning' : 'danger'}">${endpoint.averageResponseTime}</td>
              <td>${endpoint.maxResponseTime}</td>
              <td class="${parseFloat(endpoint.errorRate) < 1 ? 'good' : parseFloat(endpoint.errorRate) < 5 ? 'warning' : 'danger'}">${endpoint.errorRate}</td>
              <td>${endpoint.checks} (${endpoint.errors} errors)</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    ${report.alerts.length > 0 ? `
    <div class="card">
      <h2>Alerts (${report.alerts.length})</h2>
      ${report.alerts.map(alert => `
        <div class="alert-item">
          <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
          <div>${alert.message}</div>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="card">
      <h2>Monitoring Configuration</h2>
      <ul>
        <li><strong>URL:</strong> ${argv.url}</li>
        <li><strong>Duration:</strong> ${argv.duration} minutes</li>
        <li><strong>Check Interval:</strong> ${argv.interval} seconds</li>
        <li><strong>Error Threshold:</strong> ${argv.threshold}%</li>
        <li><strong>Response Time Threshold:</strong> ${argv.responseTime}ms</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `;
}

// Main monitoring function
async function startMonitoring() {
  log(`Starting deployment monitoring for ${argv.url}`, 'info');
  log(`Monitoring will run for ${argv.duration} minutes with checks every ${argv.interval} seconds`, 'info');
  
  // Calculate total cycles
  const totalCycles = Math.floor((argv.duration * 60) / argv.interval);
  let currentCycle = 0;
  
  // Run first cycle immediately
  await runMonitoringCycle();
  currentCycle++;
  
  // Set up interval for remaining cycles
  const intervalId = setInterval(async () => {
    await runMonitoringCycle();
    currentCycle++;
    
    // Log progress
    const progress = Math.round((currentCycle / totalCycles) * 100);
    log(`Monitoring progress: ${progress}% (${currentCycle}/${totalCycles} cycles)`, 'info');
    
    // Check if monitoring is complete
    if (currentCycle >= totalCycles) {
      clearInterval(intervalId);
      const report = generateReport();
      
      // Send final report if email is configured
      if (emailTransporter && argv.alertEmail) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: argv.alertEmail,
            subject: `Deployment Monitoring Report - ${argv.url}`,
            text: `Monitoring report for ${argv.url}. See attached HTML report for details.`,
            html: generateHtmlReport(report),
            attachments: [
              {
                filename: 'monitoring-report.json',
                content: JSON.stringify(report, null, 2)
              }
            ]
          };
          
          await emailTransporter.sendMail(mailOptions);
          log('Monitoring report email sent', 'success');
        } catch (error) {
          log(`Failed to send report email: ${error}`, 'error');
        }
      }
      
      log('Monitoring completed', 'success');
      process.exit(0);
    }
  }, argv.interval * 1000);
  
  // Handle process termination
  process.on('SIGINT', () => {
    clearInterval(intervalId);
    log('Monitoring interrupted', 'warning');
    generateReport();
    process.exit(0);
  });
}

// Start monitoring
startMonitoring().catch(error => {
  log(`Unhandled error: ${error}`, 'error');
  process.exit(1);
});