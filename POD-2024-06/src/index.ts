import express from 'express';
import helmet from 'helmet';
import { securityMiddleware } from './middleware/security.middleware';
import { MonitoringService } from './services/monitoring.service';
import { logger } from './utils/logger.utils';

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(securityMiddleware.headers);
app.use(securityMiddleware.validateInput);

// Initialize monitoring
const monitoringService = MonitoringService.getInstance();

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  logger.info(`Secure application running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  monitoringService.stopMonitoring();
  process.exit(0);
});
