export interface IPeriodButtonProps {
  id: string;
  label: string;
  active: boolean;
}

export interface IChartDataItem {
  time: string;
  value: number;
  fiatValue: number;
}

export interface IChartData {
  start24HoursAgo: IChartDataItem[];
  start1WeekAgo: IChartDataItem[];
  start1MonthAgo: IChartDataItem[];
  start6MonthAgo: IChartDataItem[];
  start1YearAgo: IChartDataItem[];
  ALL: IChartDataItem[];
}
