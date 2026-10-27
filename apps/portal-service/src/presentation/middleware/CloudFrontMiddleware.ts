import { Request, Response, NextFunction, RequestHandler } from 'express';
import { timingSafeEqual } from 'crypto';
import { ServiceError } from '../../application/errors/ServiceError';

const ORIGIN_SECRET_HEADER = 'x-origin-secret';
// "<ip>:<port>", set by CloudFront (IPv6 addresses contain ':' too, so cut at the last one)
const VIEWER_ADDRESS_HEADER = 'cloudfront-viewer-address';

const matches = (value: string, expected: string): boolean => {
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Rejects requests that skip CloudFront and call the Lambda Function URL directly:
 * CloudFront adds `x-origin-secret` as an origin custom header. Off when `secret` is unset (docker / local).
 */
export const originSecretMiddleware = (secret?: string): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!secret || req.path === '/health') return next();
    if (!matches(req.get(ORIGIN_SECRET_HEADER) ?? '', secret)) return next(ServiceError.ErrForbidden());
    next();
  };

/** Client ip for rate limiting: the viewer address from CloudFront, else the socket address. */
export const clientIp = (req: Request): string => {
  const viewerAddress = req.get(VIEWER_ADDRESS_HEADER);
  if (viewerAddress) return viewerAddress.slice(0, viewerAddress.lastIndexOf(':'));
  return req.ip ?? '';
};
