// @flow
const ms_in_sec = 1000;
const ms_in_min = ms_in_sec * 60;
const ms_in_hour = ms_in_min * 60;
const ms_in_day = ms_in_hour * 24;

export const formatTimeSpan = (futureMilliseconds: number, currentMilliseconds: number): string => {
  let remainingMs = futureMilliseconds - currentMilliseconds;

  if (remainingMs < 0) return 'Date is in the past';

  const days = Math.floor(remainingMs / ms_in_day);
  remainingMs %= ms_in_day;
  const hours = Math.floor(remainingMs / ms_in_hour);
  remainingMs %= ms_in_hour;
  const minutes = Math.floor(remainingMs / ms_in_min);

  const formatUnit = (unit: number) => (unit < 10 ? '0' + unit : unit.toString());
  const result = `${days}d : ${formatUnit(hours)}h : ${formatUnit(minutes)}m`;

  return result;
};
