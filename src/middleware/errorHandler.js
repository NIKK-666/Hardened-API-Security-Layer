import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
    logger.error({
        event: 'unhandled_error',
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.path,
        ip: req.ip,
    }, 'An unhandled error occurred');

    res.status(err.statusCode || 500).json({
        error: err.expose ? err.message :'An unexpected error occurred. Please try again later.',
    });
}
    