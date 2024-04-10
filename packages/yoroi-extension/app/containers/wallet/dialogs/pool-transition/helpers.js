const MS_IN_SEC = 1000,
  SEC_IN_DAY = 86400,
  SEC_IN_HOUR = 3600,
  SEC_IN_MIN = 60;
export const formatTimeSpan = (ms: number) => {
  let seconds = Math.round(Math.abs(ms) / MS_IN_SEC);
  const days = Math.floor(seconds / SEC_IN_DAY);
  seconds = Math.floor(seconds % SEC_IN_DAY);
  const hours = Math.floor(seconds / SEC_IN_HOUR);
  seconds = Math.floor(seconds % SEC_IN_HOUR);
  const minutes = Math.floor(seconds / SEC_IN_MIN);
  const [dd, hh, mm] = [days, hours, minutes].map(item =>
    item < 10 ? '0' + item : item.toString()
  );
  return `${dd}d:${hh}h:${mm}m`;
};
