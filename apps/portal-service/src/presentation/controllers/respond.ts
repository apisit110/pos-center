import { Response } from 'express';
import { Ok } from '../dtos/response/Ok';

/** Sends a success response wrapped with Ok (`res_code` 0000). */
export function sendOk<T>(res: Response, data: T, httpStatus = 200): void {
  const ok = Ok.success<T>(data, httpStatus);
  res.status(ok.httpStatus).json(ok.toBody());
}
