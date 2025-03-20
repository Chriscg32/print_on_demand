import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../config/security.config';
import { logger } from '../utils/logger.utils';

export const securityMiddleware = {
  headers: (req: Request, res: Response, next: NextFunction) => {
    res.set({
      'Content-Security-Policy': Object.entries(SecurityConfig.headers.contentSecurityPolicy)
        .map(([key, value]) => `${key} ${value.join(' ')}`).join('; '),
      'Strict-Transport-Security': SecurityConfig.headers.strictTransportSecurity,
      'X-Frame-Options': SecurityConfig.headers.xFrameOptions,
      'X-Content-Type-Options': SecurityConfig.headers.xContentTypeOptions,
      'Referrer-Policy': SecurityConfig.headers.referrerPolicy
    });
    next();
  },

  validateInput: (req: Request, res: Response, next: NextFunction) => {
    const input = req.body;
    try {
      if (JSON.stringify(input).length > SecurityConfig.validation.inputMaxLength) {
        throw new Error('Input exceeds maximum length');
      }
      if (!SecurityConfig.validation.allowedCharacters.test(JSON.stringify(input))) {
        throw new Error('Input contains invalid characters');
      }
      next();
    } catch (error) {
      logger.error('Input validation failed:', error);
      res.status(400).json({ error: 'Invalid input' });
    }
  }
};