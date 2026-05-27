import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDateTime = (date: string | Date) =>
  dayjs(date).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');

export default dayjs;
