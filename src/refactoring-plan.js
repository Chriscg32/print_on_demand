/**
 * ButterflyBlue Creations Dashboard Refactoring Plan
 * 
 * Current Structure:
 * - Single large Dashboard component with all tabs and functionality
 * 
 * Proposed Structure:
 * /src
 *  /components
 *    /dashboard
 *      - Dashboard.jsx (main container)
 *      - DashboardHeader.jsx
 *      - DashboardSidebar.jsx
 *      - DashboardFooter.jsx
 *    /tabs
 *      - HomeTab.jsx
 *      - DesignTab.jsx
 *      - ScriptureTab.jsx
 *      - CollectionTab.jsx
 *      - OperationsTab.jsx
 *    /ui
 *      - Card.jsx
 *      - StatusBadge.jsx
 *      - SearchInput.jsx
 *      - DataTable.jsx
 *      - ChartContainer.jsx
 *  /data
 *    - sampleData.js (all sample data)
 *  /hooks
 *    - useDashboardData.js (data fetching logic)
 *  /utils
 *    - constants.js (colors, status mappings, etc.)
 *    - formatters.js (date, currency formatting)
 *  /context
 *    - DashboardContext.js (shared state)
 */