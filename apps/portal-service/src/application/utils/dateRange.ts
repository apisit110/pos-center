/**
 * Date filters (`start_date`, `end_date`). Database and API date time are UTC (ISO 8601).
 *  - `YYYY-MM-DD`: a calendar day in Asia/Bangkok (UTC+7, no daylight saving time)
 *  - ISO 8601 date time with timezone (`Z` or `+hh:mm`): that exact instant
 */
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
const BANGKOK_OFFSET = '+07:00';

/** Parses a date filter to an instant, `undefined` when it is not a valid date filter. */
function parseInstant(value: string, time: string): Date | undefined {
  let date: Date | undefined;
  if (DATE_ONLY.test(value)) date = new Date(`${value}T${time}${BANGKOK_OFFSET}`);
  else if (DATE_TIME_WITH_ZONE.test(value)) date = new Date(value);
  return date && !Number.isNaN(date.getTime()) ? date : undefined;
}

export function isValidDateFilter(value: string): boolean {
  return parseInstant(value, '00:00:00.000') !== undefined;
}

/** Start of the range: 00:00:00.000 (Asia/Bangkok) of a `YYYY-MM-DD`, or the exact instant. */
export function toRangeStart(value?: string): Date | undefined {
  return value ? parseInstant(value, '00:00:00.000') : undefined;
}

/** End of the range: 23:59:59.999 (Asia/Bangkok) of a `YYYY-MM-DD`, or the exact instant (no expansion). */
export function toRangeEnd(value?: string): Date | undefined {
  return value ? parseInstant(value, '23:59:59.999') : undefined;
}
