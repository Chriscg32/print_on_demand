# Operations Runbook

This runbook provides step-by-step instructions for common operational tasks related to the Print-on-Demand application. It serves as a reference for the operations team to efficiently manage and maintain the application.

## Table of Contents

1. [Deployment Operations](#deployment-operations)
2. [Monitoring and Alerting](#monitoring-and-alerting)
3. [Database Operations](#database-operations)
4. [User Management](#user-management)
5. [Content Management](#content-management)
6. [Security Operations](#security-operations)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Deployment Operations

### Deploying to Staging

```bash

# Run deployment checklist

npm run checklist

# Deploy to staging

npm run deploy:staging

# Monitor deployment

npm run monitor:staging
```

### Deploying to Production

```bash

# Run deployment checklist (2)

npm run checklist

# Deploy to production

npm run deploy:prod

# Monitor deployment (2)

npm run monitor:prod
```

### Rolling Back a Deployment

```bash

# Standard rollback

npm run rollback:prod

# Force rollback (emergency)

npm run rollback:force-prod
```

### Viewing Deployment Status

```bash

# Check active environment

aws ssm get-parameter --name "/production/printapp/active-environment"

# Check CloudFront distribution status

aws cloudfront get-distribution --id $(aws ssm get-parameter --name "/production/printapp/cloudfront-distribution-id" --query "Parameter.Value" --output text)
```

### Updating Environment Variables

1. Update the appropriate `.env` file
2. Update the parameters in AWS Parameter Store:

```bash

# Update a parameter

aws ssm put-parameter --name "/production/printapp/PARAMETER_NAME" --value "PARAMETER_VALUE" --type "String" --overwrite

# Restart services to pick up changes

aws lambda update-function-configuration --function-name printapp-api --environment "Variables={CONFIG_REFRESH=true}"
```

## Monitoring and Alerting

### Starting the Monitoring Dashboard

```bash

# Start the monitoring dashboard

node scripts/monitoring-dashboard.js --port 3030
```

### Viewing Monitoring Reports

```bash

# List monitoring reports

ls -la monitoring-reports/

# View the latest report

cat $(ls -t monitoring-reports/monitoring-report-*.json | head -1)
```

### Managing Alerts

#### Configuring Alert Recipients

1. Edit the `.env` file to update `EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `ALERT_EMAIL`
2. Update the Slack webhook URL in GitHub repository secrets

#### Testing Alerts

```bash

# Test email alerts

node scripts/test-alerts.js --type email

# Test Slack alerts

node scripts/test-alerts.js --type slack
```

### Viewing Application Logs

```bash

# View CloudWatch logs for the API

aws logs filter-log-events --log-group-name /aws/lambda/printapp-api --limit 100

# View CloudFront access logs

aws s3 ls s3://printapp-logs/cloudfront/
```

## Database Operations

### Backing Up the Database

```bash

# Create a manual snapshot

aws rds create-db-snapshot --db-instance-identifier printapp-db --db-snapshot-identifier printapp-manual-backup-$(date +%Y%m%d)
```

### Restoring from Backup

```bash

# Restore from snapshot

aws rds restore-db-instance-from-db-snapshot --db-instance-identifier printapp-db-restored --db-snapshot-identifier printapp-manual-backup-20230701
```

### Running Database Migrations

```bash

# Run migrations

node scripts/db-migrate.js --env production
```

### Database Performance Monitoring

```bash

# Get performance insights

aws rds describe-db-instance-performance --db-instance-identifier printapp-db
```

## User Management

### Creating an Admin User

```bash

# Create admin user

node scripts/create-admin.js --email admin@example.com --password "SecurePassword123"
```

### Resetting a User Password

```bash

# Reset user password

node scripts/reset-password.js --email user@example.com
```

### Exporting User Data

```bash

# Export all users

node scripts/export-users.js --output users.csv

# Export specific user

node scripts/export-users.js --email user@example.com --output user-data.json
```

### Deleting a User

```bash

# Delete user

node scripts/delete-user.js --email user@example.com --confirm
```

## Content Management

### Managing Designs

```bash

# List all designs

node scripts/list-designs.js

# Import designs from Printify

node scripts/import-designs.js --source printify --count 50

# Delete a design

node scripts/delete-design.js --id design-123
```

### Managing Products

```bash

# List all products

node scripts/list-products.js

# Unpublish a product

node scripts/unpublish-product.js --id product-123
```

### Updating Featured Content

```bash

# Update featured designs

node scripts/update-featured.js --ids "design-123,design-456,design-789"
```

## Security Operations

### Rotating API Keys

```bash

# Rotate Printify API key

node scripts/rotate-api-key.js --service printify

# Rotate Shopify API key

node scripts/rotate-api-key.js --service shopify
```

### Running Security Scans

```bash

# Run npm audit

npm audit --production

# Run OWASP ZAP scan

docker run -t owasp/zap2docker-stable zap-baseline.py -t https://printapp.example.com
```

### Managing SSL Certificates

```bash

# Check certificate expiration

aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/abcdef-1234-5678-abcd-123456789012

# Request new certificate

aws acm request-certificate --domain-name printapp.example.com --validation-method DNS --subject-alternative-names www.printapp.example.com
```

### Reviewing Access Logs

```bash

# Analyze CloudFront access logs

node scripts/analyze-access-logs.js --days 7
```

## Performance Optimization

### Analyzing Bundle Size

```bash

# Analyze JavaScript bundle size

npm run analyze
```

### Optimizing Images

```bash

# Optimize all images in the designs directory

node scripts/optimize-images.js --dir public/designs
```

### Clearing Caches

```bash

# Clear CloudFront cache

aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"

# Clear API cache

curl -X POST https://api.printapp.example.com/admin/clear-cache -H "Authorization: Bearer ${API_TOKEN}"
```

### Load Testing

```bash

# Run load test

npx artillery run load-tests/basic-scenario.yml
```

## Troubleshooting

### Common Issues and Solutions

#### Application Returns 5xx Errors

1. Check application logs:
   ```bash
   aws logs filter-log-events --log-group-name /aws/lambda/printapp-api --filter-pattern "ERROR"
   ```

2. Check recent deployments:
   ```bash
   ls -la deployment-logs/
   ```

3. If related to recent deployment, rollback:
   ```bash
   npm run rollback:prod
   ```

#### Slow API Response Times

1. Check database performance:
   ```bash
   aws rds describe-db-instance-performance --db-instance-identifier printapp-db
   ```

2. Check API resource utilization:
   ```bash
   aws cloudwatch get-metric-statistics --namespace AWS/Lambda --metric-name Duration --dimensions Name=FunctionName,Value=printapp-api --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) --period 300 --statistics Average
   ```

3. Scale up resources if needed:
   ```bash
   aws lambda update-function-configuration --function-name printapp-api --memory-size 1024
   ```

#### Missing or Corrupted Static Assets

1. Check S3 bucket for the assets:
   ```bash
   aws s3 ls s3://printapp-prod-blue/static/
   ```

2. Restore from previous version if available:
   ```bash
   aws s3api list-object-versions --bucket printapp-prod-blue --prefix static/js/main.js
   aws s3api restore-object --bucket printapp-prod-blue --key static/js/main.js --version-id "version-id"
   ```

3. Redeploy if necessary:
   ```bash
   npm run deploy:prod
   ```

#### Authentication Issues

1. Check Cognito user pool status:
   ```bash
   aws cognito-idp describe-user-pool --user-pool-id us-east-1_XXXXXXXXX
   ```

2. Verify JWT token configuration:
   ```bash
   aws ssm get-parameter --name "/production/printapp/jwt-issuer" --with-decryption
   ```

3. Restart authentication services:
   ```bash
   aws lambda update-function-configuration --function-name printapp-auth --environment "Variables={AUTH_REFRESH=true}"
   ```

### Diagnostic Commands

#### Check Application Health

```bash

# Check API health

curl -I https://api.printapp.example.com/health

# Run smoke tests

npm run test:smoke -- --url https://printapp.example.com
```

#### Check Infrastructure Status

```bash

# Check CloudFormation stack status

aws cloudformation describe-stacks --stack-name printapp-blue-green

# Check S3 bucket status

aws s3api list-buckets | grep printapp
```

#### Check Integration Status

```bash

# Check Printify integration

curl -I https://api.printapp.example.com/admin/integrations/printify/status -H "Authorization: Bearer ${API_TOKEN}"

# Check Shopify integration

curl -I https://api.printapp.example.com/admin/integrations/shopify/status -H "Authorization: Bearer ${API_TOKEN}"
```

### Contacting Support

If you need additional assistance, contact:

- **DevOps Team**: devops@example.com or Slack #devops
- **Backend Team**: backend@example.com or Slack #backend
- **Frontend Team**: frontend@example.com or Slack #frontend
- **Emergency Support**: +1-555-123-4567 (24/7)
