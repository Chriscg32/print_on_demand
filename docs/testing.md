# Testing Guide

This document provides instructions for running the automated tests for the Print-on-Demand application.

## Prerequisites

Before running the tests, ensure you have the following installed:

- Node.js (v14 or higher)
- npm (v6 or higher)
- All project dependencies (`npm install`)

## Available Test Scripts

The following test scripts are available:

| Script | Description |
|--------|-------------|
| `npm run test:all` | Runs all tests (API, unit, integration, and E2E) |
| `npm run test:api` | Runs API tests |
| `npm run test:unit` | Runs unit tests |
| `npm run test:integration` | Runs integration tests |
| `npm run test:e2e` | Runs end-to-end tests |
| `npm run test:vercel` | Tests the Vercel deployment |

## Running All Tests

To run all tests at once:

```bash
npm run test:all
```

This will execute all test modules in sequence.

> **Note for Windows PowerShell users**: If you're using PowerShell, you may need to run each test command separately as PowerShell doesn't recognize the `;` separator in npm scripts:
>
> ```powershell
> npm run test:api
> npm run test:unit
> npm run test:integration
> npm run test:e2e
> ```

## Testing a Specific Deployment

To test a specific deployment URL:

```bash
npm run test:e2e https://your-deployment-url.vercel.app
```

Or for Vercel deployment tests:

```bash
npm run test:vercel https://your-deployment-url.vercel.app
```

## Test Structure

The tests are organized in the following directories:

- `tests/api`: API endpoint tests
- `tests/unit`: Unit tests for individual components and functions
- `tests/integration`: Integration tests for combined functionality
- `tests/e2e`: End-to-end tests for complete user flows

## Troubleshooting

If you encounter issues with the tests:

1. Ensure all dependencies are installed: `npm install`
2. Check that environment variables are properly set
3. For browser tests, ensure you have the necessary browser engines installed
4. For API tests, verify that the API server is running and accessible
5. If using Windows PowerShell, run test commands individually instead of using the combined `test:all` script

## Adding New Tests

To add new tests:

1. Create a new test file in the appropriate test directory
2. Follow the existing test patterns and naming conventions
3. Run the specific test category to verify your new test works correctly
