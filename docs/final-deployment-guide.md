# Print-on-Demand Application Deployment Guide

This guide provides comprehensive instructions for deploying the Print-on-Demand application using our blue-green deployment strategy.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Deployment Process](#deployment-process)
4. [Monitoring](#monitoring)
5. [Rollback Procedure](#rollback-procedure)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following:

- AWS CLI configured with appropriate permissions
- Node.js (v14 or higher)
- npm (v6 or higher)
- Access to the application's Git repository
- Environment variables configured in `.env` files
- AWS CloudFormation access for infrastructure setup

Required environment variables:

```
REACT_APP_PRINTIFY_API_URL=https://api.printify.com/v1
REACT_APP_PRINTIFY_API_KEY=your_printify_api_key
REACT_APP_SHOPIFY_API_URL=https://your-store.myshopify.com/admin/api/2023-04
REACT_APP_SHOPIFY_API_KEY=your_shopify_api_key
REACT_APP_SHOPIFY_API_PASSWORD=your_shopify_api_password
AWS_REGION=us-east-1
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
```

## Infrastructure Setup

Our deployment uses a blue-green strategy with AWS CloudFormation for infrastructure.

### Setting Up the Infrastructure

1. Deploy the CloudFormation template:

```bash
aws cloudformation create-stack \
  --stack-name printapp-blue-green \
  --template-body file://infrastructure/blue-green-deployment.yml \
  --parameters ParameterKey=Environment,ParameterValue=production \
               ParameterKey=DomainName,ParameterValue=printapp.example.com \
  --capabilities CAPABILITY_IAM
```

2. Wait for the stack creation to complete:

```bash
aws cloudformation wait stack-create-complete --stack-name printapp-blue-green
```

3. Get the outputs from the CloudFormation stack:

```bash
aws cloudformation describe-stacks --stack-name printapp-blue-green --query "Stacks[0].Outputs"
```

Note the following values from the outputs:

- `BlueBucketName`
- `GreenBucketName`
- `CloudFrontDistributionId`
- `ActiveEnvironment`

## Deployment Process

Our deployment process follows these steps:

1. Pre-deployment testing
2. Building the application
3. Deploying to the inactive environment
4. Verifying the deployment
5. Switching traffic to the new environment
6. Post-deployment monitoring

### Step 1: Run Pre-deployment Checks

Run the deployment checklist to ensure everything is ready:

```bash
npm run checklist
```

This will verify:

- All tests are passing
- Code quality checks pass
- Security audit passes
- Environment variables are configured correctly

### Step 2: Deploy Using Blue-Green Strategy

Run the blue-green deployment script:

```bash

# For staging environment

node scripts/blue-green-deploy.js staging

# For production environment

node scripts/blue-green-deploy.js production
```

The script will:
1. Determine the inactive environment (blue or green)
2. Build the application for the target environment
3. Deploy to the inactive environment
4. Run verification tests
5. Prompt for confirmation before switching traffic
6. Switch traffic to the new environment
7. Verify the new active environment

### Step 3: Monitor the Deployment

After deployment, run the monitoring script to ensure everything is working correctly:

```bash

# Monitor for 60 minutes with checks every 30 seconds

node scripts/monitor-deployment.js --url https://printapp.example.com --duration 60 --interval 30 --alert-email alerts@example.com
```

The monitoring script will:
1. Check application availability
2. Monitor API response times
3. Track error rates
4. Send alerts if issues are detected
5. Generate a monitoring report

## Monitoring

### Real-time Monitoring

During and after deployment, monitor the following:

1. **CloudWatch Metrics**:
   ```bash
   aws cloudwatch get-metric-statistics --namespace AWS/CloudFront --metric-name Requests --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ) --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) --period 300 --statistics Sum
   ```

2. **CloudFront Logs**:
   ```bash
   aws logs filter-log-events --log-group-name /aws/cloudfront/YOUR_DISTRIBUTION_ID --filter-pattern "ERROR"
   ```

3. **Application Logs**:
   Check the application logs for any errors or warnings.

### Post-Deployment Verification

Run smoke tests to verify critical functionality:

```bash
node scripts/smoke-test.js --url https://printapp.example.com
```

## Rollback Procedure

If issues are detected after deployment, follow these steps to rollback:

### Automatic Rollback

If the deployment script detects issues during verification, it will prompt for rollback automatically.

### Manual Rollback

To manually rollback to the previous environment:

```bash

# For staging environment (2)

node scripts/rollback.js staging

# For production environment (2)

node scripts/rollback.js production
```

For immediate rollback without verification:

```bash
node scripts/rollback.js production --force --skip-verification
```

The rollback script will:
1. Switch traffic back to the previous environment
2. Verify the rollback was successful
3. Record the rollback in the deployment logs

## Troubleshooting

### Common Issues and Solutions

1. **CloudFront Distribution Not Updating**:

   - Check the distribution status:

     ```bash
     aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
     ```

   - Create a manual invalidation:

     ```bash
     aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
     ```

2. **S3 Deployment Failures**:

   - Check S3 bucket permissions
   - Verify AWS credentials are correct
   - Check for S3 service issues

3. **Application Errors After Deployment**:

   - Check browser console for JavaScript errors
   - Verify API endpoints are responding correctly
   - Check environment variables are set correctly

4. **Slow Response Times**:

   - Check CloudFront cache settings
   - Verify API performance
   - Check for database bottlenecks

### Getting Help

If you encounter issues not covered in this guide:

1. Check the deployment logs in `deployment-logs/` directory
2. Review monitoring reports in `monitoring-reports/` directory
3. Contact the DevOps team at devops@example.com
4. For urgent issues, call the on-call engineer at +1-555-123-4567

## Conclusion

Following this deployment guide will ensure a smooth, reliable deployment process with minimal downtime and risk. The blue-green deployment strategy allows for easy rollbacks if issues are detected, and the monitoring tools provide visibility into the application's health during and after deployment.
