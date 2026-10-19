import { z } from 'zod';
import { isValidDateFilter } from '../../../application/utils/dateRange';

export const pageSchema = z.coerce.number().int().min(1).default(1);
export const limitSchema = z.coerce.number().int().min(1).max(100).default(10);

/** `:id` path param (uid) */
export const idParamSchema = z.object({
  id: z.string().min(1),
});

/** `YYYY-MM-DD` (calendar day in Asia/Bangkok) or ISO 8601 date time with timezone */
export const dateStringSchema = z.string().refine(isValidDateFilter, {
  message: 'invalid date, expected YYYY-MM-DD or ISO 8601 date time with timezone',
});

/** a single value (`brands=A`) or a repeated param (`brands=A&brands=B`) becomes an array */
export const stringArraySchema = z.preprocess(
  (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]),
  z.array(z.string()),
);
