export interface IChartDataItem {
  label: string;
  value: number;
  changePercent: number;
  changeValue: number;
}

export interface IChartData {
  data: IChartDataItem[];
}
