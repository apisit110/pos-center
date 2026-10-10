import dayjs from 'dayjs';

export function isFutureDate(date: Date): boolean {
  return dayjs(date).isAfter(dayjs());
}

export function addMillisecondsFromNow(ms: number): Date {
  return dayjs().add(ms, 'millisecond').toDate();
}
