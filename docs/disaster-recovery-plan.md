# Disaster Recovery Plan

This document outlines the disaster recovery procedures for the Print-on-Demand application. It provides step-by-step instructions for recovering from various failure scenarios and ensuring business continuity.

## Recovery Objectives

- **Recovery Time Objective (RTO)**: 1 hour
- **Recovery Point Objective (RPO)**: 15 minutes
- **Maximum Tolerable Downtime**: 4 hours

## Backup Strategy

### Database Backups

- **Frequency**: Automated backups every 15 minutes
- **Retention**: 7 days of point-in-time recovery
- **Storage**: Primary backups in AWS S3, cross-region replication to secondary region
- **Verification**: Weekly backup restoration tests

### Application State

- **Configuration**: All configuration stored in AWS Parameter Store
- **User-generated content**: Stored in S3 with versioning enabled
- **Deployment artifacts**: Stored in S3 with versioning enabled

### Infrastructure

- **CloudFormation templates**: Stored in version control
- **Infrastructure state**: Backed up daily

## Failure Scenarios and Recovery Procedures

### 1. Application Failure

#### Symptoms

- Application returns 5xx errors
- Monitoring alerts for high error rates
- Users report application unresponsiveness

#### Recovery Steps

1. **Verify the issue**:
   ```bash
   # Check application health
   curl -I https://printapp.example.com/api/health
   
   # Check CloudWatch logs
   aws logs filter-log-events --log-group-name /aws/lambda/printapp-api --filter-pattern "ERROR"
   ```

2. **Rollback to previous version**:
   ```bash
   # Execute rollback script
   npm run rollback:prod
   ```

3. **Verify recovery**:
   ```bash
   # Run smoke tests
   npm run test:smoke -- --url https://printapp.example.com
   ```

### 2. Database Failure

#### Symptoms (2)

- API endpoints return database connection errors
- Monitoring alerts for database availability
- High database latency alerts

#### Recovery Steps (2)

1. **Verify the issue**:
   ```bash
   # Check RDS status
   aws rds describe-db-instances --db-instance-identifier printapp-db
   ```

2. **Initiate failover to read replica**:
   ```bash
   # Promote read replica to primary
   aws rds promote-read-replica --db-instance-identifier printapp-db-replica
   ```

3. **Update application configuration**:
   ```bash
   # Update database connection parameters
   aws ssm put-parameter --name "/printapp/prod/db-host" --value "new-db-endpoint" --type "String" --overwrite
   ```

4. **Restart application services**:
   ```bash
   # Restart API services
   aws lambda update-function-configuration --function-name printapp-api --environment "Variables={DB_REFRESH=true}"
   ```

### 3. Region Failure

#### Symptoms (3)

- Multiple AWS services in the primary region are unavailable
- AWS status page reports issues in the primary region

#### Recovery Steps (3)

1. **Activate cross-region deployment**:
   ```bash
   # Deploy to secondary region
   AWS_REGION=us-west-2 npm run deploy:prod
   ```

2. **Update DNS to point to secondary region**:
   ```bash
   # Update Route 53 record
   aws route53 change-resource-record-sets --hosted-zone-id ZXXXXXXXXXXXXX --change-batch file://dns-failover.json
   ```

3. **Verify secondary region is serving traffic**:
   ```bash
   # Run smoke tests against secondary region
   npm run test:smoke -- --url https://printapp.example.com
   ```

### 4. S3 Bucket Corruption

#### Symptoms (4)

- Missing or corrupted static assets
- Monitoring alerts for S3 access issues

#### Recovery Steps (4)

1. **Identify corrupted objects**:
   ```bash
   # List objects in the bucket
   aws s3 ls s3://printapp-prod-blue --recursive > current-objects.txt
   
   # Compare with expected objects
   diff current-objects.txt expected-objects.txt
   ```

2. **Restore from backup or versioning**:
   ```bash
   # Restore previous version of an object
   aws s3api restore-object --bucket printapp-prod-blue --key index.html --version-id "version-id"
   ```

3. **Rebuild and redeploy if necessary**:
   ```bash
   # Rebuild and deploy
   npm run deploy:prod
   ```

### 5. CloudFront Distribution Issues

#### Symptoms (5)

- Slow content delivery
- SSL certificate errors
- Edge location failures

#### Recovery Steps (5)

1. **Check CloudFront distribution status**:
   ```bash
   # Get distribution status
   aws cloudfront get-distribution --id EXXXXXXXXXXXXX
   ```

2. **Create invalidation for affected paths**:
   ```bash
   # Invalidate cache
   aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"
   ```

3. **If persistent, switch to backup distribution**:
   ```bash
   # Update DNS to point to backup distribution
   aws route53 change-resource-record-sets --hosted-zone-id ZXXXXXXXXXXXXX --change-batch file://cloudfront-failover.json
   ```

## Communication Plan

### Internal Communication

1. **Initial Alert**:

   - Notify on-call engineer via PagerDuty
   - Post incident in #incidents Slack channel

2. **During Recovery**:

   - Regular updates in #incidents channel every 15 minutes
   - Incident commander to coordinate response

3. **Post-Recovery**:

   - Send incident summary to engineering team
   - Schedule post-mortem meeting

### External Communication

1. **Customer Notification**:

   - Update status page at status.printapp.example.com
   - Send email to affected customers if downtime exceeds 15 minutes
   - Post updates on social media for major outages

2. **Post-Recovery**:

   - Send all-clear notification
   - Provide incident summary for transparency

## Testing and Maintenance

### Regular Testing

- **Monthly**: Test application rollback procedure
- **Quarterly**: Test database failover
- **Bi-annually**: Full disaster recovery simulation
- **Annually**: Cross-region failover test

### Plan Maintenance

- Review and update this plan quarterly
- Update after any major infrastructure changes
- Incorporate lessons learned from incidents and drills

## Recovery Team and Responsibilities

### Primary Contacts

| Role | Name | Contact |
|------|------|---------|
| Incident Commander | Jane Smith | +1-555-123-4567 |
| DevOps Lead | John Doe | +1-555-234-5678 |
| Database Admin | Alice Johnson | +1-555-345-6789 |
| Frontend Lead | Bob Williams | +1-555-456-7890 |
| Backend Lead | Charlie Brown | +1-555-567-8901 |

### Escalation Path

1. On-call engineer
2. DevOps Lead
3. CTO
4. CEO

## Post-Recovery Procedures

1. **Verify System Integrity**:

   - Run full suite of tests
   - Verify data consistency
   - Check all integrations

2. **Document the Incident**:

   - Create detailed incident report
   - Identify root cause
   - Document recovery steps taken

3. **Implement Preventive Measures**:

   - Address root cause
   - Update monitoring if needed
   - Improve recovery procedures

4. **Conduct Post-Mortem**:

   - Review incident timeline
   - Identify what worked and what didn't
   - Update disaster recovery plan
