import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { IChartData } from '../types/chart';

const useChart = (data: IChartData) => {
  const theme: any = useTheme();

  // const [periodButtonProps, setPeriodButtonProps] = useState<ITabButtonProps[]>([
  //   { id: 'start24HoursAgo', label: strings['24H'], active: true },
  //   { id: 'start1WeekAgo', label: strings['1W'], active: false },
  //   { id: 'start1MonthAgo', label: strings['1M'], active: false },
  //   { id: 'start6MonthAgo', label: strings['6M'], active: false },
  //   { id: 'start1YearAgo', label: strings['1Y'], active: false },
  //   { id: 'ALL', label: strings['ALL'], active: false },
  // ]);
  const [detailInfo, setDetailInfo] = useState<{ value?: number; label?: string, changeValue?: number, changePercent?: number }>({
    label: data[0]?.label,
    value: data[0]?.value,
    changeValue: data[0]?.changeValue,
    changePercent: data[0]?.changePercent,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
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
                paddingRight: '5px',
              }}
            >
              {detailInfo.label}
            </Box>
          </g>
        )}
      </svg>
    );
  };

  const handleMouseMove = (props: any) => {
    if (!isDragging) return;

    if (!props.isTooltipActive) {
      handleMouseUp();
      return;
    }

    const value = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.value : 0;
    const changeValue = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.changeValue : 0;
    const changePercent = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.changePercent : 0;
    const label = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.label : "";

    if (!value || !changeValue) return;
    setDetailInfo({
      value,
      changeValue,
      changePercent,
      label
    });
  };

  const handleMouseDown = (props: any) => {
    console.log(" handleMouseDown props", props)
    if (!props || !props.activePayload || props.activePayload.length <= 0) return;

    const value = props.activePayload[0].payload.value;
    const changeValue = props.activePayload[0].payload.changeValue;
    const changePercent = props.activePayload[0].payload.changePercent;
    const label = props.activePayload[0].payload.label;

    if (!value || !changeValue) return;
    setDetailInfo({
      value,
      changeValue,
      changePercent,
      label
    });
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setDetailInfo({
      value: data ? data[0]?.value : 0,
      changeValue: data ? data[0]?.changeValue : 0,
      changePercent: data ? data[0]?.changePercent : 0,
      label: data ? data[0]?.label : "",
    });
    setIsDragging(false);
  };



  return {
    CustomYAxisTick,
    CustomActiveDot,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    detailInfo,
  };
};

export default useChart;