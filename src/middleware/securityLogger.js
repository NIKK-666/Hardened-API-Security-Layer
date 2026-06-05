import { logger } from '../utils/logger.js';

export function securityLogger(req, res, next) {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      duration,
    };

    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn({ ...logEntry, event: 'access_denied' }, 'Access denied');
    } else if (res.statusCode === 429) {
      logger.warn({ ...logEntry, event: 'rate_limited' }, 'Rate limit exceeded');
    } else if (res.statusCode === 400) {
      logger.warn({ ...logEntry, event: 'validation_failure' }, 'Input validation failed');
    }
  });

  next();
}