import { Request, Response, NextFunction } from 'express';
import { pino } from 'pino';
import { ZodError } from 'zod';

const LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: null
});

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.issues.map(e => ({ path: e.path, message: e.message })),
      request_id: req.requestId
    });
  }

  const statusCode = err.status || 500;
  
  LOGGER.error({
    type: 'error',
    request_id: req.requestId,
    correlation_id: req.correlationId,
    method: req.method,
    url: req.originalUrl || req.url,
    error: {
      message: err.message,
      stack: err.stack,
      ...err
    }
  });

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Internal server error' : err.message,
    request_id: req.requestId
  });
};
