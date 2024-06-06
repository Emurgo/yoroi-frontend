export const now = new Date();
export const start24HoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).getTime();
export const start1WeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime();
export const start1MonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
export const start6MonthAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime();
export const start1YearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime();

// UTILS
const pad = (number: number, length: number) => {
  return String(number).padStart(length, '0');
};
const getQuantityBasedOnTimePeriod = (timePeriod: '24H' | '1W' | '1M' | '6M' | '1Y') => {
  switch (timePeriod) {
    case '24H':
      return 96; // 4 data points per hour (every 15 minutes)
    case '1W':
      return 168; // Hourly data for a week
    case '1M':
      return 120; // Approximately 4 data point per day
    case '6M':
      return 180; // Approximately 1 data point per day
    case '1Y':
      return 90; // Approximately 1 data point every 4 days
    default:
      throw new Error('Invalid time period');
  }
};
const getFromTime = (timePeriod: '24H' | '1W' | '1M' | '6M' | '1Y', now: number) => {
  switch (timePeriod) {
    case '24H':
      return start24HoursAgo;
    case '1W':
      return start1WeekAgo;
    case '1M':
      return start1MonthAgo;
    case '6M':
      return start6MonthAgo;
    case '1Y':
      return start1YearAgo;
    default:
      throw new Error('Invalid time period');
  }
};
const getInterval = (timePeriod: '24H' | '1W' | '1M' | '6M' | '1Y') => {
  switch (timePeriod) {
    case '24H':
      return 15 * 60 * 1000; // 15 minutes in milliseconds
    case '1W':
      return 60 * 60 * 1000; // 1 hour in milliseconds
    case '1M':
      return 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    case '6M':
      return 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    case '1Y':
      return 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds
    default:
      throw new Error('Invalid time period');
  }
};
export const getRandomTime = (startDate, endDate) => {
  const date = new Date(startDate + Math.random() * (endDate - startDate));
  return date.toISOString();
};
const getRandomNumber = (min, max, toFixed) => {
  return (Math.random() * (max - min) + min).toFixed(toFixed);
};
export const createChartData = (timePeriod: '24H' | '1W' | '1M' | '6M' | '1Y') => {
  const quantity = getQuantityBasedOnTimePeriod(timePeriod);
  const fromTime = getFromTime(timePeriod, now);
  const interval = getInterval(timePeriod);

  const tmp = Array.from({ length: quantity }).map((_, index) => {
    const time = new Date(fromTime + index * interval);
    const utcString = `${time.getUTCFullYear()}-${pad(time.getUTCMonth() + 1, 2)}-${pad(time.getUTCDate(), 2)}T${pad(
      time.getUTCHours(),
      2
    )}:${pad(time.getUTCMinutes(), 2)}:${pad(time.getUTCSeconds(), 2)}Z`;

    const volatility = 0.005;
    const baseValue =
      index >= quantity / 5
        ? 2 * Math.exp(volatility * Math.abs(getRandomNumber(1, 80, 2))) * index
        : -20 * Math.exp(volatility * Math.abs(getRandomNumber(1, 100, 2))) * index;
    const randomChange = getRandomNumber(-5, 5, 2);
    let value = baseValue * Math.exp(volatility * Math.abs(randomChange)) * index;

    return {
      time: utcString,
      value: (value / 110).toFixed(2),
      usd: (value / 100).toFixed(2),
    };
  });
  return tmp;
};
