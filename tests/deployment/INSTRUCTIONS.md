# Step-by-Step Instructions to Fix and Run the Vercel Deployment Test

## 1. Fix Your package.json

Your package.json has syntax errors. Follow these steps to fix it:

1. Open your package.json file
2. Replace the entire content with the corrected version:

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^5.59.0",
    "@typescript-eslint/parser": "^5.59.0",
    "axios": "^1.8.4",
    "chrome-launcher": "^1.1.2",
    "eslint": "^8.39.0",
    "eslint-plugin-jest": "^28.11.0",
    "lighthouse": "^12.4.0",
    "prettier": "^2.8.8"
  },
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "type-check": "tsc --noEmit",
    "test:vercel": "node tests/deployment/simple-vercel-test.js",
    "build": "next build"
  }
}
```

3. Save the file

## 2. Make Sure the Test Script Uses ES Modules

1. Open the file at `tests/deployment/simple-vercel-test.js`
2. Make sure it uses ES Module syntax (starts with imports, not requires)
3. If it doesn't, replace it with the ES Module version:

```javascript
// ES Module version of the simplified Vercel deployment test
import axios from 'axios';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Get current file directory (ES Module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Update these values for your project
const config = {
  // Your application URLs
  const { stderr } = await execa('vercel', args);
  localUrl: 'http://localhost:3000',
  
  // API endpoints to test
  apiEndpoints: [
    { path: '/api/hello', method: 'GET', requiresAuth: false },
    // Add more endpoints as needed
  ],
  
  // Performance thresholds
  thresholds: {
    maxResponseTime: 500 // ms
  }
};

// Rest of the file...
```

## 3. Update the Configuration

1. In the `simple-vercel-test.js` file, update the `productionUrl` to your actual Vercel deployment URL
2. Update the `apiEndpoints` array to include your actual API endpoints

## 4. Run the Test

Now you can run the test with:

```bash
npm run test:vercel
```

## Common Issues and Solutions

### If you get "Missing script: build"

Make sure your package.json has a build script:

```json
"scripts": {
  "build": "next build"
}
```

Replace `next build` with whatever build command your project uses.

### If you get API 404 errors

Make sure you have API routes set up. For Next.js:

1. Create a file at `pages/api/hello.js` (Pages Router) or `app/api/hello/route.js` (App Router)
2. Add a simple handler:

```javascript
// For Pages Router
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from the API!' });
}

// For App Router
export async function GET() {
  return Response.json({ message: 'Hello from the API!' });
}
```

### If you need to add security headers

For Next.js, update your `next.config.js`:

```javascript
export default {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' }
        ]
      }
    ];
  }
};
```