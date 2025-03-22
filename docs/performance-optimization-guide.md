# Performance Optimization Guide

This guide provides strategies and best practices for optimizing the performance of the Print-on-Demand application. It covers frontend, backend, database, and infrastructure optimizations to ensure a fast, responsive user experience.

## Performance Metrics

We track the following key performance indicators (KPIs):

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Page Load Time | < 2 seconds | > 3 seconds |
| Time to First Byte (TTFB) | < 200ms | > 500ms |
| Time to Interactive | < 3 seconds | > 5 seconds |
| API Response Time | < 300ms | > 1 second |
| Database Query Time | < 100ms | > 500ms |
| Lighthouse Performance Score | > 90 | < 70 |
| Core Web Vitals | All "Good" | Any "Poor" |

## Frontend Optimization

### JavaScript Optimization

#### Code Splitting

Implement code splitting to reduce initial bundle size:

```javascript
// Before
import { DesignEditor } from './DesignEditor';

// After
const DesignEditor = React.lazy(() => import('./DesignEditor'));

function App() {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <DesignEditor />
    </React.Suspense>
  );
}
```

#### Tree Shaking

Ensure your bundler is configured for tree shaking:

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true,
    concatenateModules: true
  }
};
```

#### Bundle Analysis

Regularly analyze your bundle size:

```bash

# Add to package.json

"scripts": {
  "analyze": "source-map-explorer 'build/static/js/*.js'"
}
```

### Rendering Optimization

#### Component Memoization

Memoize expensive components:

```javascript
// Before
function DesignGrid({ designs }) {
  // Expensive rendering
  return (
    <div className="grid">
      {designs.map(design => <DesignCard key={design.id} design={design} />)}
    </div>
  );
}

// After
const DesignGrid = React.memo(function DesignGrid({ designs }) {
  // Expensive rendering
  return (
    <div className="grid">
      {designs.map(design => <DesignCard key={design.id} design={design} />)}
    </div>
  );
});
```

#### Virtualized Lists

Use virtualization for long lists:

```javascript
import { FixedSizeGrid } from 'react-window';

function DesignGrid({ designs }) {
  return (
    <FixedSizeGrid
      columnCount={3}
      columnWidth={300}
      height={800}
      rowCount={Math.ceil(designs.length / 3)}
      rowHeight={350}
      width={900}
      itemData={designs}
    >
      {({ columnIndex, rowIndex, style, data }) => {
        const index = rowIndex * 3 + columnIndex;
        if (index >= data.length) return null;
        return (
          <div style={style}>
            <DesignCard design={data[index]} />
          </div>
        );
      }}
    </FixedSizeGrid>
  );
}
```

#### Debouncing and Throttling

Implement debouncing for search inputs:

```javascript
import { debounce } from 'lodash-es';

function SearchBar() {
  const [query, setQuery] = useState('');
  
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      // API call
      searchDesigns(searchTerm);
    }, 300),
    []
  );
  
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };
  
  return <input type="text" value={query} onChange={handleChange} />;
}
```

### Asset Optimization

#### Image Optimization

Optimize images using modern formats and responsive loading:

```html
<!-- Before -->
<img src="design.jpg" alt="Design" />

<!-- After -->
<picture>
  <source srcset="design.webp" type="image/webp" />
  <source srcset="design.jpg" type="image/jpeg" />
  <img 
    src="design.jpg" 
    alt="Design" 
    loading="lazy" 
    srcset="design-small.jpg 400w, design-medium.jpg 800w, design-large.jpg 1200w"
    sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  />
</picture>
```

#### Font Loading

Optimize font loading:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
```

```css
/* Font-display swap to prevent invisible text */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/roboto-v20-latin-regular.woff2') format('woff2');
}
```

### Caching Strategy

#### Service Worker

Implement a service worker for offline support and caching:

```javascript
// service-worker.js
const CACHE_NAME = 'printapp-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/static/media/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

#### Local Storage

Cache API responses in localStorage:

```javascript
const fetchDesigns = async () => {
  // Check cache first
  const cachedData = localStorage.getItem('designs');
  const cacheTimestamp = localStorage.getItem('designs-timestamp');
  
  // Use cache if less than 5 minutes old
  if (cachedData && cacheTimestamp) {
    const now = new Date().getTime();
    if (now - parseInt(cacheTimestamp) < 5 * 60 * 1000) {
      return JSON.parse(cachedData);
    }
  }
  
  // Fetch fresh data
  const response = await fetch('/api/designs');
  const data = await response.json();
  
  // Update cache
  localStorage.setItem('designs', JSON.stringify(data));
  localStorage.setItem('designs-timestamp', new Date().getTime().toString());
  
  return data;
};
```

## Backend Optimization

### API Optimization

#### Response Compression

Enable compression for API responses:

```javascript
// Express.js example
const compression = require('compression');
app.use(compression());
```

```bash

# API Gateway example

aws apigateway update-stage --rest-api-id abcdef123 --stage-name prod \
  --patch-operations op=replace,path=/minimumCompressionSize,value=1024
```

#### Pagination

Implement pagination for all list endpoints:

```javascript
// API handler
exports.handler = async (event) => {
  const page = parseInt(event.queryStringParameters?.page || '1');
  const limit = parseInt(event.queryStringParameters?.limit || '20');
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Design.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      designs: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    })
  };
};
```

#### Response Filtering

Allow clients to request only needed fields:

```javascript
// API handler
exports.handler = async (event) => {
  const fields = event.queryStringParameters?.fields?.split(',') || null;
  
  let attributes = undefined;
  if (fields) {
    attributes = fields.includes('id') ? fields : ['id', ...fields];
  }
  
  const designs = await Design.findAll({ attributes });
  
  return {
    statusCode: 200,
    body: JSON.stringify({ designs })
  };
};
```

### Caching

#### API Gateway Caching

Enable API Gateway caching:

```bash
aws apigateway update-stage --rest-api-id abcdef123 --stage-name prod \
  --patch-operations op=replace,path=/cacheClusterEnabled,value=true \
  op=replace,path=/cacheClusterSize,value=0.5
```

#### Redis Caching

Implement Redis caching for frequently accessed data:

```javascript
const redis = require('redis');
const { promisify } = require('util');
const client = redis.createClient(process.env.REDIS_URL);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

exports.handler = async (event) => {
  const cacheKey = `designs:trending`;
  
  // Try to get from cache
  const cachedData = await getAsync(cacheKey);
  if (cachedData) {
    return {
      statusCode: 200,
      body: cachedData,
      headers: { 'X-Cache': 'HIT' }
    };
  }
  
  // Get from database
  const designs = await Design.findAll({
    where: { trending: true },
    limit: 20
  });
  
  const response = JSON.stringify({ designs });
  
  // Store in cache for 5 minutes
  await setAsync(cacheKey, response, 'EX', 300);
  
  return {
    statusCode: 200,
    body: response,
    headers: { 'X-Cache': 'MISS' }
  };
};
```

### Lambda Optimization

#### Memory Allocation

Optimize Lambda memory allocation:

```bash

# Test different memory configurations

for mem in 128 256 512 1024 2048; do
  aws lambda update-function-configuration --function-name printapp-api \
    --memory-size $mem
  
  # Run performance test
  npm run test:performance
  
  # Record results
  echo "Memory: $mem MB, Average duration: $duration ms" >> memory-test-results.txt
done
```

#### Cold Start Mitigation

Use provisioned concurrency for critical functions:

```bash

# Set provisioned concurrency

aws lambda put-provisioned-concurrency-config \
  --function-name printapp-api \
  --qualifier prod \
  --provisioned-concurrent-executions 5
```

#### Function Optimization

Keep Lambda functions focused and small:

```javascript
// Before: Monolithic function
exports.handler = async (event) => {
  // Handle multiple operations
  if (event.path === '/designs') {
    // List designs
  } else if (event.path === '/designs/create') {
    // Create design
  } else if (event.path === '/designs/publish') {
    // Publish design
  }
};

// After: Separate functions
// designs-list.js
exports.handler = async (event) => {
  // Only list designs
};

// designs-create.js
exports.handler = async (event) => {
  // Only create designs
};

// designs-publish.js
exports.handler = async (event) => {
  // Only publish designs
};
```

## Database Optimization

### Query Optimization

#### Indexing

Create appropriate indexes:

```sql
-- Add index for frequently queried fields
CREATE INDEX idx_designs_user_id ON designs(user_id);
CREATE INDEX idx_designs_status ON designs(status);
CREATE INDEX idx_designs_created_at ON designs(created_at);

-- Composite index for common query patterns
CREATE INDEX idx_designs_user_status ON designs(user_id, status);
```

#### Query Analysis

Regularly analyze slow queries:

```sql
-- PostgreSQL
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- MySQL
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY sum_timer_wait DESC
LIMIT 10;
```

#### Query Optimization (2)

Optimize complex queries:

```sql
-- Before
SELECT d.*, u.name as user_name, COUNT(o.id) as order_count
FROM designs d
JOIN users u ON d.user_id = u.id
LEFT JOIN orders o ON o.design_id = d.id
WHERE d.status = 'published'
GROUP BY d.id, u.name;

-- After
SELECT d.*, u.name as user_name, d.order_count
FROM designs d
JOIN users u ON d.user_id = u.id
JOIN (
  SELECT design_id, COUNT(id) as order_count
  FROM orders
  GROUP BY design_id
) o ON o.design_id = d.id
WHERE d.status = 'published';
```

### Connection Pooling

Implement connection pooling:

```javascript
// Sequelize example
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
```

### Read Replicas

Use read replicas for read-heavy operations:

```javascript
// Configuration
const masterDB = new Sequelize(process.env.MASTER_DATABASE_URL);
const replicaDB = new Sequelize(process.env.REPLICA_DATABASE_URL);

// Usage
async function getDesigns() {
  return replicaDB.models.Design.findAll();
}

async function createDesign(design) {
  return masterDB.models.Design.create(design);
}
```

## Infrastructure Optimization

### CDN Optimization

#### Cache Control Headers

Set appropriate cache control headers:

```javascript
// Express.js example
app.use('/static', express.static('public', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    } else if (path.includes('static/js/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  }
}));
```

```bash

# S3 example

aws s3 cp build/static/ s3://printapp-prod-blue/static/ \
  --recursive \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html"

aws s3 cp build/*.html s3://printapp-prod-blue/ \
  --cache-control "public, max-age=0, must-revalidate"
```

#### CloudFront Settings

Optimize CloudFront settings:

```bash

# Update CloudFront distribution

aws cloudfront update-distribution --id EXXXXXXXXXXXXX \
  --distribution-config '{
    "DefaultCacheBehavior": {
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000,
      "Compress": true
    }
  }'
```

### Lambda@Edge for Optimization

Use Lambda@Edge for dynamic optimizations:

```javascript
// Image resizing Lambda@Edge function
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  
  // Check if this is an image request with dimensions
  const match = uri.match(/\/images\/([^\/]+)\/(\d+)x(\d+)\/(.*)/);
  if (match) {
    const bucket = match[1];
    const width = match[2];
    const height = match[3];
    const key = match[4];
    
    // Rewrite the request to the image resizing service
    request.uri = `/resize?bucket=${bucket}&key=${key}&width=${width}&height=${height}`;
  }
  
  return request;
};
```

## Performance Testing

### Load Testing

Use Artillery for load testing:

```yaml

# load-test.yml

config:
  target: "https://api.printapp.example.com"
  phases:

    - duration: 60

      arrivalRate: 5
      rampTo: 50
      name: "Warm up phase"

    - duration: 120

      arrivalRate: 50
      rampTo: 100
      name: "Ramp up load"

    - duration: 300

      arrivalRate: 100
      name: "Sustained load"
  environments:
    production:
      target: "https://api.printapp.example.com"
      phases:

        - duration: 300

          arrivalRate: 50
          maxVusers: 200

scenarios:

  - name: "Browse designs"

    flow:

      - get:

          url: "/api/designs?page=1&limit=20"

      - think: 3
      - get:

          url: "/api/designs/{{ $randomNumber(1, 1000) }}"

      - think: 5
      - get:

          url: "/api/designs?page=2&limit=20"
```

```bash

# Run load test

npx artillery run load-test.yml
```

### Performance Monitoring

Set up performance monitoring:

```bash

# CloudWatch dashboard for performance metrics

aws cloudwatch put-dashboard --dashboard-name PrintAppPerformance \
  --dashboard-body file://performance-dashboard.json

# Set up alarms for performance thresholds

aws cloudwatch put-metric-alarm --alarm-name APIHighLatency \
  --metric-name Latency --namespace AWS/ApiGateway \
  --statistic p95 --period 60 --evaluation-periods 5 \
  --threshold 1000 --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:performance-alerts
```

## Performance Checklist

Use this checklist before deploying changes:

### Frontend Checklist

- [ ] Bundle size is under 250KB (initial load)
- [ ] Images are optimized and use modern formats
- [ ] Lazy loading is implemented for below-the-fold content
- [ ] Critical CSS is inlined
- [ ] Web fonts are optimized with font-display swap
- [ ] Core Web Vitals meet "Good" thresholds

### Backend Checklist

- [ ] API responses are compressed
- [ ] Caching is implemented for appropriate endpoints
- [ ] Database queries are optimized
- [ ] Lambda functions have appropriate memory allocation
- [ ] Response times are under 300ms for critical endpoints

### Infrastructure Checklist

- [ ] CDN is configured with appropriate cache settings
- [ ] Resources are distributed across appropriate regions
- [ ] Auto-scaling is configured for variable load
- [ ] Monitoring is in place for performance metrics
- [ ] Load testing has been performed for expected traffic

## Conclusion

Performance optimization is an ongoing process. Regularly monitor performance metrics, conduct load testing, and implement improvements based on real-world usage patterns. By following the strategies in this guide, you can ensure that the Print-on-Demand application provides a fast, responsive experience for all users.

Remember that performance optimizations should be data-driven. Measure before and after implementing changes to ensure they have the desired effect. Focus on optimizations that provide the most significant improvements for your specific use case and user base.
