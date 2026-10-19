import { Request, Response, NextFunction } from 'express';
import { pino } from 'pino';
import { ZodError } from 'zod';
import { ValidationError } from '../../application/errors/ValidationError';
import { ServiceError } from '../../application/errors/ServiceError';
import { InternalServiceError } from '../../application/errors/InternalServiceError';

const LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  base: null
});

/** `th` when the request header `Accept-Language` starts with `th`, otherwise `en`. */
function languageOf(req: Request): 'th' | 'en' {
  return req.header('Accept-Language')?.trim().toLowerCase().startsWith('th') ? 'th' : 'en';
}

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  const lang = languageOf(req);

  if (err instanceof ValidationError || err instanceof ServiceError || err instanceof InternalServiceError) {
    return res.status(Number(err.kind)).json({
      res_code: err.resCode,
      res_desc: err.resDesc[lang],
      details: err instanceof ValidationError ? err.details : undefined,
      additional: err instanceof ServiceError ? err.additional : undefined,
      request_id: req.requestId
    });
  }

  if (err instanceof ZodError) {
    const invalid = ValidationError.ErrInvalidRequest(
      err.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    );
    return res.status(Number(invalid.kind)).json({
      res_code: invalid.resCode,
      res_desc: invalid.resDesc[lang],
      details: invalid.details,
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
