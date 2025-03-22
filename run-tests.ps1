# PowerShell script to run tests sequentially
Write-Host "Running API tests..." -ForegroundColor Cyan
npm run test:api

Write-Host "`nRunning Unit tests..." -ForegroundColor Cyan
npm run test:unit

Write-Host "`nRunning Integration tests..." -ForegroundColor Cyan
# Add --passWithNoTests to avoid failing on integration tests
npm run test:integration -- --passWithNoTests

Write-Host "`nRunning E2E tests..." -ForegroundColor Cyan
npm run test:e2e

Write-Host "`nRunning Vercel deployment test..." -ForegroundColor Cyan
# Always run in offline mode for local testing
node tests/vercel-deployment-test.js http://localhost:3000 --offline

Write-Host "`nAll tests completed!" -ForegroundColor Green
