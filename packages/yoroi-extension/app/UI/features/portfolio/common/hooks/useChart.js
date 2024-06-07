// @flow
import React, { useState } from 'react';
import { useStrings } from './useStrings';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import moment from 'moment';
import { IPeriodButtonProps, IChartData } from '../types/chart';
import { LineChartProps } from 'recharts';

const useChart = (data: IChartData) => {
  const strings = useStrings();
  const theme = useTheme();

  const [periodButtonProps, setPeriodButtonProps] = useState([
    { id: 'start24HoursAgo', label: strings['24H'], active: true },
    { id: 'start1WeekAgo', label: strings['1W'], active: false },
    { id: 'start1MonthAgo', label: strings['1M'], active: false },
    { id: 'start6MonthAgo', label: strings['6M'], active: false },
    { id: 'start1YearAgo', label: strings['1Y'], active: false },
    { id: 'ALL', label: strings['ALL'], active: false },
  ]);
  const [detailInfo, setDetailInfo] = useState({
    value: data[periodButtonProps[0].id][data[periodButtonProps[0].id].length - 1].value,
    fiatValue: data[periodButtonProps[0].id][data[periodButtonProps[0].id].length - 1].fiatValue,
  });
  const [isDragging, setIsDragging] = useState(false);

  const CustomYAxisTick = ({
    x,
    y,
    payload,
  }: {
    x: number,
    y: number,
    payload: { value: number },
  }): React.SVGProps<SVGTextElement> => {
    return (
      <text x={x - 5} y={y} dy={4} textAnchor="end" fill={theme.palette.ds.black_static}>
        {payload.value.toFixed(1)}
      </text>
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
    cx: number,
    cy: number,
    payload: { time: string },
    index: number,
    dataLength: number,
    chartBottom: number,
    rectWidth: number,
    rectHeight: number,
  }): React.SVGProps<SVGTextElement> => {
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
      isDragging && (
        <svg>
          <g>
            <circle cx={cx} cy={cy} r={5} fill={theme.palette.ds.primary_c500} />

            <line x1={cx} y1={cy} x2={cx} y2={rectY} stroke={theme.palette.ds.primary_c500} strokeDasharray="5,5" />

            <Box
              component="rect"
              x={rectX}
              y={rectY}
              width={rectWidth}
              height={rectHeight}
              fill={theme.palette.ds.primary_c500}
              rx={5}
              ry={5}
            ></Box>
            <Box
              component="text"
              x={rectX + rectWidth / 2}
              y={rectY + rectHeight / 2}
              textAnchor="middle"
              fill={theme.palette.ds.primary_c200}
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
        </svg>
      )
    );
  };

  const handleChoosePeriod = (id: string) => {
    const tmp = periodButtonProps.map(item => {
      if (item.id === id) return { ...item, active: true };
      return {
        ...item,
        active: false,
      };
    });
    setPeriodButtonProps(tmp);
  };

  const handleMouseMove = (props: LineChartProps) => {
    if (!isDragging) return;

    if (!props.isTooltipActive) {
      handleMouseUp();
      return;
    }

    const value = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.value : null;
    const fiatValue = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.fiatValue : null;

    if (!value || !fiatValue) return;
    setDetailInfo({
      value,
      fiatValue,
    });
  };

  const handleMouseDown = (props: LineChartProps) => {
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
    const currentPeriod = periodButtonProps.find(item => item.active).id;
    setDetailInfo({
      value: data[currentPeriod][data[currentPeriod].length - 1].value,
      fiatValue: data[currentPeriod][data[currentPeriod].length - 1].fiatValue,
    });
    setIsDragging(false);
  };

  const minValue = Math.min(...data[periodButtonProps.find(item => item.active).id].map(item => item.value));

  const maxValue = Math.max(...data[periodButtonProps.find(item => item.active).id].map(item => item.value));

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
  };
};

export default useChart;
