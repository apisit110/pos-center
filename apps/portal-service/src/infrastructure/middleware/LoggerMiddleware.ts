import { Request, Response, NextFunction } from 'express'
import { pino } from 'pino'
import { v4 as uuidv4 } from 'uuid'

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      requestId: string
      correlationId: string
      startTime: [number, number]
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

const LOGGER = pino({
  timestamp: false, // We'll manage timestamp manually to match format or use standard time
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  base: null // Remove pid and hostname
})

const SENSITIVE_KEYS = ['access_token', 'refresh_token', 'api_key', 'password']

const maskSensitiveData = (data: any): any => {
  if (data == null) return data
  if (typeof data !== 'object') return data

  const maskedData = Array.isArray(data) ? [...data] : { ...data }

  for (const key in maskedData) {
    if (SENSITIVE_KEYS.includes(key)) {
      maskedData[key] = '***'
    } else if (typeof maskedData[key] === 'object') {
      maskedData[key] = maskSensitiveData(maskedData[key])
    }
  }
  return maskedData
}

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = uuidv4()
  req.correlationId = (req.headers['x-correlation-id'] as string) ?? uuidv4()
  req.startTime = process.hrtime()

  // Log Request
  const requestLog = {
    timestamp: new Date().toISOString(),
    type: 'request',
    request_id: req.requestId,
    correlation_id: req.correlationId,
    method: req.method,
    url: req.originalUrl ?? req.url,
    ip: req.ip,
    user_agent: req.headers['user-agent'],
    app_name: 'PORTAL',
    source: 'portal-service',
    req: {
      headers: maskSensitiveData(req.headers),
      body: maskSensitiveData(req.body),
      params: maskSensitiveData(req.params),
      query: maskSensitiveData(req.query)
    }
  }
  LOGGER.info(requestLog)

  // Override res.end to capture body and log response
  const originalEnd = res.end
  const originalWrite = res.write
  let responseBody: any
  const chunks: Buffer[] = []

  res.write = function (chunk: any) {
    if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    // @ts-expect-error
    return originalWrite.apply(res, arguments)
  }

  res.end = function (chunk: any) {
    if (chunk != null) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))

    const bodyString = Buffer.concat(chunks).toString('utf8')
    try {
      responseBody = JSON.parse(bodyString)
    } catch (e) {
      responseBody = bodyString
    }

    const diff = process.hrtime(req.startTime)
    const timeInMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2)

    const responseLog = {
      timestamp: new Date().toISOString(),
      type: 'response',
      request_id: req.requestId,
      correlation_id: req.correlationId,
      method: req.method,
      url: req.originalUrl ?? req.url,
      app_name: 'PORTAL',
      source: 'portal-service',
      resp: {
        http_status_code: res.statusCode,
        time: timeInMs,
        time_unit: 'ms',
        headers: maskSensitiveData(res.getHeaders()),
        body: maskSensitiveData(responseBody)
      }
    }
    LOGGER.info(responseLog)

    // @ts-expect-error
    return originalEnd.apply(res, arguments)
  }

  next()
}
