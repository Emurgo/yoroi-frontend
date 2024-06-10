// @flow
import moment from 'moment'; // Import moment.js

export const formatTimeSpan = (futureMilliseconds: number, currentMilliseconds: number): string => {
  const futureTime = moment(futureMilliseconds);
  const currentTime = moment(currentMilliseconds);
  const duration = moment.duration(futureTime.diff(currentTime));

  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();

  return `${days > 0 ? days + 'd' : ''}${hours > 0 ? ' ' + hours + 'h' : ''}${
    minutes > 0 ? ' ' + minutes + 'm' : ''
  }`;
};
