import { time } from '../../../../utils/constants';
import { TokenChartInterval } from '../hooks/usePortfolioTokenChart';
import { TOKEN_CHART_INTERVAL } from './constants';

export const getTimestampsTokenInterval = (timeInterval: TokenChartInterval) => {
  const now = Date.now();
  const [from, resolution]: any = {
    [TOKEN_CHART_INTERVAL.DAY]: [now - time.oneDay, 96],
    [TOKEN_CHART_INTERVAL.WEEK]: [now - time.oneWeek, 168],
    [TOKEN_CHART_INTERVAL.MONTH]: [now - time.oneMonth, 180],
    [TOKEN_CHART_INTERVAL.SIX_MONTHS]: [now - time.sixMonths, 180],
    [TOKEN_CHART_INTERVAL.YEAR]: [now - time.oneYear, 365],
    [TOKEN_CHART_INTERVAL.ALL]: [new Date('2018').getTime(), 256],
  }[timeInterval];

  const step: any = (now - from) / resolution;
  return Array.from({ length: resolution }, (_, i) => from + Math.round(step * i));
};
