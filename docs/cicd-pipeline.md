# CI/CD Pipeline Documentation

This document provides an overview of the CI/CD pipeline for the Print-on-Demand application, explaining how the automated deployment process works.

## Overview

Our CI/CD pipeline uses GitHub Actions to automate the testing, building, and deployment of the application to both staging and production environments. The pipeline implements a blue-green deployment strategy to ensure zero-downtime deployments and easy rollbacks if issues are detected.

## Pipeline Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Commit   │────▶│    Test     │────▶│    Build    │────▶│   Deploy    │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                           ┌─────────────┐
                                                           │   Monitor   │
                                                           └─────────────┘
```

## Workflow Triggers

The CI/CD pipeline can be triggered in three ways:

1. **Push to main branch**: Automatically deploys to production
2. **Push to develop branch**: Automatically deploys to staging
3. **Manual trigger**: Can deploy to either staging or production

## Pipeline Stages

### 1. Test Stage

The test stage runs various checks to ensure the code quality and functionality:

- **Unit Tests**: Tests individual components in isolation
- **Integration Tests**: Tests interactions between components
- **Linting**: Ensures code follows style guidelines
- **Security Audit**: Checks for vulnerabilities in dependencies

### 2. Build Stage

The build stage creates optimized production-ready assets:

- Compiles the React application
- Optimizes assets (minification, tree-shaking)
- Creates a build artifact that is used in the deployment stage

### 3. Deploy Stage

The deploy stage implements a blue-green deployment strategy:

1. Determines the inactive environment (blue or green)
2. Deploys the application to the inactive environment
3. Runs verification tests on the inactive environment
4. Switches traffic to the newly deployed environment
5. Verifies the new active environment

### 4. Monitor Stage

After deployment, the application is monitored for any issues:

- Checks application availability
- Monitors API response times
- Tracks error rates
- Sends alerts if issues are detected

## Blue-Green Deployment

Our pipeline uses a blue-green deployment strategy to minimize downtime and risk:

```
                  ┌─────────────┐
                  │  CloudFront │
                  └──────┬──────┘
                         │
                         ▼
           ┌─────────────────────────┐
           │                         │
┌──────────▼─────────┐    ┌──────────▼─────────┐
│    Blue Environment│    │   Green Environment│
│    (S3 Bucket)     │    │   (S3 Bucket)      │
└───────────���────────┘    └────────────────────┘
```

1. At any given time, one environment (blue or green) is active and receiving traffic
2. New deployments go to the inactive environment
3. After verification, traffic is switched to the newly deployed environment
4. If issues are detected, traffic can be quickly switched back to the previous environment

## GitHub Actions Workflow

The GitHub Actions workflow file (`.github/workflows/ci-cd.yml`) defines the pipeline configuration:

- **Jobs**: Test, Build, Deploy-Staging, Deploy-Production, Notify
- **Environments**: Staging and Production with different configurations
- **Secrets**: AWS credentials, API keys, and notification settings

## Manual Deployment

You can manually trigger the deployment workflow from the GitHub Actions UI:

1. Go to the "Actions" tab in the GitHub repository
2. Select the "CI/CD Pipeline" workflow
3. Click "Run workflow"
4. Select the target environment (staging or production)
5. Choose whether to automatically switch traffic
6. Click "Run workflow"

## Deployment Scripts

The deployment process uses several scripts:

- **blue-green-deploy.js**: Handles the blue-green deployment process
- **rollback.js**: Provides rollback capability if issues are detected
- **smoke-test.js**: Verifies the deployment with basic functionality tests
- **monitor-deployment.js**: Monitors the application after deployment
- **deployment-checklist.js**: Ensures everything is ready for deployment

## Environment Configuration

The pipeline uses different environment configurations for staging and production:

- **Staging**: Used for testing new features before production
- **Production**: The live environment used by end users

Each environment has its own:

- S3 buckets (blue and green)
- CloudFront distribution
- Environment variables
- Domain name

## Notifications

The pipeline sends notifications at various stages:

- **Slack notifications**: For deployment success or failure
- **Email alerts**: For critical issues detected during monitoring

## Rollback Process

If issues are detected after deployment, the rollback process can be initiated:

1. **Automatic rollback**: If verification fails during deployment
2. **Manual rollback**: Using the rollback script or GitHub Actions workflow

## Troubleshooting

Common issues and solutions:

1. **Failed tests**: Check the test logs for details on which tests failed
2. **Deployment failures**: Check the deployment logs for error messages
3. **Monitoring alerts**: Investigate the specific issue reported in the alert

## Best Practices

1. Always run the deployment checklist before deploying
2. Test changes in staging before deploying to production
3. Monitor the application after deployment
4. Use feature flags for risky changes

## Further Reading

- [Blue-Green Deployment Strategy](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)
