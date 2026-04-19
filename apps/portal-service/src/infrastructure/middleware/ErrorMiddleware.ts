import { Request, Response, NextFunction } from 'express';
import { pino } from 'pino';

const LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: null
});

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
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
