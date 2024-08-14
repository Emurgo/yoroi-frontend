import React, { useMemo, useState } from 'react';
import { useStrings } from './useStrings';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import moment from 'moment';
import { IChartData, IChartDataItem } from '../types/chart';
import { ITabButtonProps } from '../types';

const useChart = (data: IChartData) => {
  const strings = useStrings();
  const theme: any = useTheme();
  const [periodButtonProps, setPeriodButtonProps] = useState<ITabButtonProps[]>([
    { id: 'start24HoursAgo', label: strings['24H'], active: true },
    { id: 'start1WeekAgo', label: strings['1W'], active: false },
    { id: 'start1MonthAgo', label: strings['1M'], active: false },
    { id: 'start6MonthAgo', label: strings['6M'], active: false },
    { id: 'start1YearAgo', label: strings['1Y'], active: false },
    { id: 'ALL', label: strings['ALL'], active: false },
  ]);
  const [detailInfo, setDetailInfo] = useState<{ value: number; fiatValue: number }>({
    value: data ? data[periodButtonProps[0]?.id || 0][data[periodButtonProps[0]?.id || 0].length - 1].value : 0,
    fiatValue: data ? data[periodButtonProps[0]?.id || 0][data[periodButtonProps[0]?.id || 0].length - 1].fiatValue : 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const activePeriodId = useMemo(() => periodButtonProps.find(item => item.active)?.id || 0, [periodButtonProps]);

  const CustomYAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: { value: number };
  }): React.SVGProps<SVGTextElement> => {
    return (
      <Box
        component="text"
        x={x - 9}
        y={y}
        dy={4}
        textAnchor="end"
        sx={{ color: theme.palette.ds.gray_700, fontSize: '0.75rem', lineHeight: '1rem', fontWeight: 400 }}
      >
        {payload.value.toFixed(1)}
      </Box>
    );
  };

  const CustomActiveDot = ({
    cx,
    cy,
    payload,
    index,
    dataLength,
    chartBottom,
    rectWidth,
    rectHeight,
  }: {
    cx: number;
    cy: number;
    payload: { time: string };
    index: number;
    dataLength: number;
    chartBottom: number;
    rectWidth: number;
    rectHeight: number;
  }): JSX.Element | React.ReactElement => {
    let rectX = cx - rectWidth / 2;
    if (index === 0) {
      rectX = cx;
    } else if (index === dataLength - 1) {
      rectX = cx - rectWidth;
    } else {
      rectX = cx - (index * rectWidth) / dataLength;
    }

    const rectY = chartBottom - rectHeight;

    return (
      <svg>
        {isDragging && (
          <g>
            <circle cx={cx} cy={cy} r={5} fill={theme.palette.ds.primary_500} />

            <line x1={cx} y1={cy} x2={cx} y2={rectY} stroke={theme.palette.ds.primary_500} strokeDasharray="5,5" />

            <Box
              component="rect"
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              fill={theme.palette.ds.primary_500}
              rx={5}
              ry={5}
            ></Box>
            <Box
              component="text"
              x={rectX + rectWidth / 2}
              y={rectY + rectHeight / 2}
              textAnchor="middle"
              fill={theme.palette.ds.primary_200}
              alignmentBaseline="middle"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontSize: '0.75rem',
                fontWeight: 400,
              }}
            >
              {moment(payload.time).format('MM/DD/YY H:mm')}
            </Box>
          </g>
        )}
      </svg>
    );
  };

  const handleChoosePeriod = (id: string) => {
    const tmp = periodButtonProps.map(item => {
      if (item.id === id) {
        if (item.active) {
          return item;
        } else {
          return { ...item, active: true };
        }
      }
      return {
        ...item,
        active: false,
      };
    });
    setPeriodButtonProps(tmp);
    setDetailInfo({
      value: data
        ? data[periodButtonProps.find(item => item.id === id)?.id || 0][
            data[periodButtonProps.find(item => item.id === id)?.id || 0].length - 1
          ].value
        : 0,
      fiatValue: data
        ? data[periodButtonProps.find(item => item.id === id)?.id || 0][
            data[periodButtonProps.find(item => item.id === id)?.id || 0].length - 1
          ].fiatValue
        : 0,
    });
  };

  const handleMouseMove = (props: any) => {
    if (!isDragging) return;

    if (!props.isTooltipActive) {
      handleMouseUp();
      return;
    }

    const value = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.value : 0;
    const fiatValue = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.fiatValue : 0;

    if (!value || !fiatValue) return;
    setDetailInfo({
      value,
      fiatValue,
    });
  };

  const handleMouseDown = (props: any) => {
    if (!props || !props.activePayload || props.activePayload.length <= 0) return;

    const value = props.activePayload[0].payload.value;
    const fiatValue = props.activePayload[0].payload.fiatValue;

    if (!value || !fiatValue) return;
    setDetailInfo({
      value,
      fiatValue,
    });
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setDetailInfo({
      value: data ? data[activePeriodId][data[activePeriodId].length - 1].value : 0,
      fiatValue: data ? data[activePeriodId][data[activePeriodId].length - 1].fiatValue : 0,
    });
    setIsDragging(false);
  };

  const minValue = data ? Math.min(...data[activePeriodId].map((item: IChartDataItem) => item.value)) : 0;

  const maxValue = data ? Math.max(...data[activePeriodId].map((item: IChartDataItem) => item.value)) : 0;

  return {
    CustomYAxisTick,
    CustomActiveDot,
    handleChoosePeriod,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    periodButtonProps,
    detailInfo,
    minValue,
    maxValue,
    activePeriodId,
  };
};

export default useChart;
