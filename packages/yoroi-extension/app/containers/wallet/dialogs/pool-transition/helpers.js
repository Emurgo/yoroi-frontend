// @flow
const ms_in_sec = 1000,
  sec_in_day = 86400,
  sec_in_hour = 3600,
  sec_in_min = 60;
export const formatTimeSpan: number => string = (ms: number) => {
  if (ms < 0) return '';

  let seconds = Math.round(Math.abs(ms) / ms_in_sec);
  const days = Math.floor(seconds / sec_in_day);
  seconds = Math.floor(seconds % sec_in_day);
  const hours = Math.floor(seconds / sec_in_hour);
  seconds = Math.floor(seconds % sec_in_hour);
  const minutes = Math.floor(seconds / sec_in_min);
  const [dd, hh, mm] = [days, hours, minutes].map(item =>
    item < 10 ? '0' + item : item.toString()
  );
  return `${dd}d : ${hh}h : ${mm}m`;
};
