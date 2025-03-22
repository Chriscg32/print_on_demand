#!/usr/bin/env node

/**
 * Monitoring Dashboard for Print-on-Demand Application
 * 
 * This script creates a simple web dashboard to visualize the application's health
 * by reading monitoring reports and displaying metrics.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const moment = require('moment');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('port', {
    alias: 'p',
    description: 'Port to run the dashboard on',
    type: 'number',
    default: 3030
  })
  .option('reports-dir', {
    alias: 'r',
    description: 'Directory containing monitoring reports',
    type: 'string',
    default: path.join(__dirname, '../monitoring-reports')
  })
  .option('logs-dir', {
    alias: 'l',
    description: 'Directory containing deployment logs',
    type: 'string',
    default: path.join(__dirname, '../deployment-logs')
  })
  .help()
  .alias('help', 'h')
  .argv;

// Create Express app
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to read monitoring reports
function getMonitoringReports() {
  try {
    if (!fs.existsSync(argv.reportsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(argv.reportsDir)
      .filter(file => file.startsWith('monitoring-report-') && file.endsWith('.json'))
      .sort()
      .reverse();
    
    return files.map(file => {
      const filePath = path.join(argv.reportsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
        return null;
      }
    }).filter(report => report !== null);
  } catch (error) {
    console.error('Error reading monitoring reports:', error);
    return [];
  }
}

// Helper function to read deployment logs
function getDeploymentLogs() {
  try {
    if (!fs.existsSync(argv.logsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(argv.logsDir)
      .filter(file => (file.startsWith('deployment-') || file.startsWith('rollback-')) && file.endsWith('.json'))
      .sort()
      .reverse();
    
    return files.map(file => {
      const filePath = path.join(argv.logsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        const log = JSON.parse(content);
        log.type = file.startsWith('deployment-') ? 'deployment' : 'rollback';
        return log;
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
        return null;
      }
    }).filter(log => log !== null);
  } catch (error) {
    console.error('Error reading deployment logs:', error);
    return [];
  }
}

// API endpoint to get monitoring data
app.get('/api/monitoring', (req, res) => {
  const reports = getMonitoringReports();
  res.json(reports);
});

// API endpoint to get deployment logs
app.get('/api/deployments', (req, res) => {
  const logs = getDeploymentLogs();
  res.json(logs);
});

// API endpoint to get summary data
app.get('/api/summary', (req, res) => {
  const reports = getMonitoringReports();
  const logs = getDeploymentLogs();
  
  // Get the latest report
  const latestReport = reports.length > 0 ? reports[0] : null;
  
  // Get the latest deployment
  const latestDeployment = logs.length > 0 ? logs[0] : null;
  
  // Calculate availability over time
  const availabilityData = reports.map(report => ({
    timestamp: report.startTime,
    availability: parseFloat(report.summary.availability)
  })).reverse();
  
  // Calculate response time over time
  const responseTimeData = reports.map(report => ({
    timestamp: report.startTime,
    responseTime: parseFloat(report.summary.averageResponseTime)
  })).reverse();
  
  // Calculate error rate over time
  const errorRateData = reports.map(report => ({
    timestamp: report.startTime,
    errorRate: parseFloat(report.summary.errorRate)
  })).reverse();
  
  // Count deployments and rollbacks
  const deploymentCount = logs.filter(log => log.type === 'deployment').length;
  const rollbackCount = logs.filter(log => log.type === 'rollback').length;
  
  // Get recent alerts
  const recentAlerts = reports
    .flatMap(report => (report.alerts || []).map(alert => ({
      ...alert,
      reportTime: report.startTime
    })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
  
  res.json({
    latestReport,
    latestDeployment,
    availabilityData,
    responseTimeData,
    errorRateData,
    deploymentCount,
    rollbackCount,
    recentAlerts
  });
});

// Serve the dashboard HTML
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Print-on-Demand Monitoring Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { padding-top: 20px; }
    .card { margin-bottom: 20px; }
    .status-indicator {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 5px;
    }
    .status-good { background-color: #28a745; }
    .status-warning { background-color: #ffc107; }
    .status-danger { background-color: #dc3545; }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
    }
    .metric-label {
      font-size: 14px;
      color: #6c757d;
    }
    .alert-item {
      padding: 10px;
      margin-bottom: 5px;
      border-radius: 4px;
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }
    .deployment-item {
      padding: 10px;
      margin-bottom: 5px;
      border-radius: 4px;
      background-color: #f8f9fa;
      border-left: 4px solid #6c757d;
    }
    .deployment-item.success {
      border-left-color: #28a745;
    }
    .deployment-item.rollback {
      border-left-color: #dc3545;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1 class="mb-4">Print-on-Demand Monitoring Dashboard</h1>
    
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Current Status</h5>
            <div id="current-status">Loading...</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Key Metrics</h5>
            <div class="row" id="key-metrics">Loading...</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Availability Over Time</h5>
            <canvas id="availability-chart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Response Time Over Time</h5>
            <canvas id="response-time-chart"></canvas>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Recent Alerts</h5>
            <div id="recent-alerts">Loading...</div>
          </div>
        </div>
      </div>
      
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Recent Deployments</h5>
            <div id="recent-deployments">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // Fetch summary data
    async function fetchSummaryData() {
      try {
        const response = await fetch('/api/summary');
        const data = await response.json();
        updateDashboard(data);
      } catch (error) {
        console.error('Error fetching summary data:', error);
      }
    }
    
    // Update the dashboard with data
    function updateDashboard(data) {
      // Update current status
      updateCurrentStatus(data.latestReport);
      
      // Update key metrics
      updateKeyMetrics(data.latestReport, data.deploymentCount, data.rollbackCount);
      
      // Update charts
      updateAvailabilityChart(data.availabilityData);
      updateResponseTimeChart(data.responseTimeData);
      
      // Update alerts and deployments
      updateRecentAlerts(data.recentAlerts);
      updateRecentDeployments(data.latestDeployment);
    }
    
    // Update current status section
    function updateCurrentStatus(report) {
      if (!report) {
        document.getElementById('current-status').innerHTML = '<p>No monitoring data available</p>';
        return;
      }
      
      const availability = parseFloat(report.summary.availability);
      const statusClass = availability > 99 ? 'status-good' : availability > 95 ? 'status-warning' : 'status-danger';
      const statusText = availability > 99 ? 'Healthy' : availability > 95 ? 'Degraded' : 'Critical';
      
      document.getElementById('current-status').innerHTML = \`
        <div class="d-flex align-items-center mb-3">
          <span class="status-indicator \${statusClass}"></span>
          <span class="h4 mb-0">\${statusText}</span>
        </div>
        <p>Last updated: \${new Date(report.endTime).toLocaleString()}</p>
        <p>Environment: \${report.title.includes('staging') ? 'Staging' : 'Production'}</p>
        <p>Monitoring duration: \${report.duration}</p>
      \`;
    }
    
    // Update key metrics section
    function updateKeyMetrics(report, deploymentCount, rollbackCount) {
      if (!report) {
        document.getElementById('key-metrics').innerHTML = '<p>No monitoring data available</p>';
        return;
      }
      
      document.getElementById('key-metrics').innerHTML = \`
        <div class="col-md-3 text-center">
          <div class="metric-value">\${report.summary.availability}</div>
          <div class="metric-label">Availability</div>
        </div>
        <div class="col-md-3 text-center">
          <div class="metric-value">\${report.summary.averageResponseTime}</div>
          <div class="metric-label">Avg Response Time</div>
        </div>
        <div class="col-md-3 text-center">
          <div class="metric-value">\${deploymentCount}</div>
          <div class="metric-label">Deployments</div>
        </div>
        <div class="col-md-3 text-center">
          <div class="metric-value">\${rollbackCount}</div>
          <div class="metric-label">Rollbacks</div>
        </div>
      \`;
    }
    
    // Update availability chart
    function updateAvailabilityChart(data) {
      if (!data || data.length === 0) {
        return;
      }
      
      const ctx = document.getElementById('availability-chart').getContext('2d');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => new Date(item.timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Availability (%)',
            data: data.map(item => item.availability),
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              min: Math.min(90, Math.floor(Math.min(...data.map(item => item.availability)))),
              max: 100
            }
          }
        }
      });
    }
    
    // Update response time chart
    function updateResponseTimeChart(data) {
      if (!data || data.length === 0) {
        return;
      }
      
      const ctx = document.getElementById('response-time-chart').getContext('2d');
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.map(item => new Date(item.timestamp).toLocaleTimeString()),
          datasets: [{
            label: 'Response Time (ms)',
            data: data.map(item => item.responseTime),
            borderColor: '#007bff',
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true
        }
      });
    }
    
    // Update recent alerts section
    function updateRecentAlerts(alerts) {
      if (!alerts || alerts.length === 0) {
        document.getElementById('recent-alerts').innerHTML = '<p>No recent alerts</p>';
        return;
      }
      
      const alertsHtml = alerts.map(alert => \`
        <div class="alert-item">
          <div><strong>\${new Date(alert.timestamp).toLocaleString()}</strong></div>
          <div>\${alert.message}</div>
        </div>
      \`).join('');
      
      document.getElementById('recent-alerts').innerHTML = alertsHtml;
    }
    
    // Update recent deployments section
    function updateRecentDeployments(deployment) {
      if (!deployment) {
        document.getElementById('recent-deployments').innerHTML = '<p>No recent deployments</p>';
        return;
      }
      
      // Fetch more deployments
      fetch('/api/deployments')
        .then(response => response.json())
        .then(deployments => {
          const recentDeployments = deployments.slice(0, 5);
          
          const deploymentsHtml = recentDeployments.map(deployment => \`
            <div class="deployment-item \${deployment.type === 'rollback' ? 'rollback' : deployment.success ? 'success' : ''}">
              <div><strong>\${new Date(deployment.timestamp).toLocaleString()}</strong></div>
              <div>
                <span class="badge \${deployment.type === 'rollback' ? 'bg-danger' : deployment.success ? 'bg-success' : 'bg-secondary'}">
                  \${deployment.type === 'rollback' ? 'Rollback' : 'Deployment'}
                </span>
                <span class="ms-2">Environment: \${deployment.environment}</span>
              </div>
              <div>Version: \${deployment.version}</div>
            </div>
          \`).join('');
          
          document.getElementById('recent-deployments').innerHTML = deploymentsHtml;
        })
        .catch(error => {
          console.error('Error fetching deployments:', error);
          document.getElementById('recent-deployments').innerHTML = '<p>Error loading deployments</p>';
        });
    }
    
    // Initial data fetch
    fetchSummaryData();
    
    // Refresh data every 30 seconds
    setInterval(fetchSummaryData, 30000);
  </script>
</body>
</html>
  `);
});

// Start the server
app.listen(argv.port, () => {
  console.log(`Monitoring dashboard running at http://localhost:${argv.port}`);
});