"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var helmet_1 = require("helmet");
var security_middleware_1 = require("./middleware/security.middleware");
var monitoring_service_1 = require("./services/monitoring.service");
var logger_utils_1 = require("./utils/logger.utils");
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(security_middleware_1.securityMiddleware.headers);
app.use(security_middleware_1.securityMiddleware.validateInput);
// Initialize monitoring
var monitoringService = monitoring_service_1.MonitoringService.getInstance();
// Error handling
app.use(function (err, req, res, next) {
    logger_utils_1.logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, function () {
    logger_utils_1.logger.info("Secure application running on port ".concat(port));
});
// Graceful shutdown
process.on('SIGTERM', function () {
    monitoringService.stopMonitoring();
    process.exit(0);
});
