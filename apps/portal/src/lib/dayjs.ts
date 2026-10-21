import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateTime = (date: string | Date) =>
  dayjs(date).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');

/** Default date range: last 31 days inclusive of today (Asia/Bangkok). */
export const getDefaultDateRange = () => {
  const today = dayjs().tz('Asia/Bangkok');
  return {
    startDate: today.subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: today.format('YYYY-MM-DD'),
  };
};

/** Clamp a YYYY-MM-DD value to within 1 year of today; empty stays empty. */
export const clampToOneYear = (value: string) => {
  if (!value) return value;
  const today = dayjs().tz('Asia/Bangkok');
  const min = today.subtract(1, 'year').format('YYYY-MM-DD');
  const max = today.add(1, 'year').format('YYYY-MM-DD');
  return value < min ? min : value > max ? max : value;
};

export default dayjs;
