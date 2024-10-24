import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { IChartData } from '../types/chart';

const useChart = (data: IChartData) => {
  const theme: any = useTheme();

  const [detailInfo, setDetailInfo] = useState<{
    value?: number;
    label?: string;
    changeValue?: number;
    changePercent?: number;
  }>({
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
      <Typography
        variant="caption"
        zIndex={2000}
        component="text"
        x={x - 5}
        y={y === 8 ? y - 3 : y + 3}
        dy={1}
        textAnchor="end"
        sx={{
          color: theme.palette.ds.gray_700,
          fontSize: '12px',
          lineHeight: '16px',
          fontWeight: '200 !important',
          letterSpacing: '0.2px',
        }}
        stroke={theme.palette.ds.gray_700}
      >
        {payload.value.toFixed(2)}
      </Typography>
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
              pr={7}
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
                paddingLeft: '10px',
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
    const changePercent =
      props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.changePercent : 0;
    const label = props.activePayload && props.activePayload.length > 0 ? props.activePayload[0].payload.label : '';

    if (!value || !changeValue) return;
    setDetailInfo({
      value,
      changeValue,
      changePercent,
      label,
    });
  };

  const handleMouseDown = (props: any) => {
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
      label,
    });
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setDetailInfo({
      value: data ? data[0]?.value : 0,
      changeValue: data ? data[0]?.changeValue : 0,
      changePercent: data ? data[0]?.changePercent : 0,
      label: data ? data[0]?.label : '',
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
    isDragging,
  };
};

export default useChart;
