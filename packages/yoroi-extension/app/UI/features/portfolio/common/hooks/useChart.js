// @flow
import { useState } from 'react';
import { useStrings } from './useStrings';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import moment from 'moment';

const useChart = (data) => {
  const strings = useStrings();
  const theme = useTheme();

  const [buttonPeriodProps, setButtonPeriodProps] = useState([
    { id: 'start24HoursAgo', label: strings['24H'], active: true },
    { id: 'start1WeekAgo', label: strings['1W'], active: false },
    { id: 'start1MonthAgo', label: strings['1M'], active: false },
    { id: 'start6MonthAgo', label: strings['6M'], active: false },
    { id: 'start1YearAgo', label: strings['1Y'], active: false },
    { id: 'ALL', label: strings['ALL'], active: false },
  ]);
  const [detailInfo, setDetailInfo] = useState({
    value: data[buttonPeriodProps[0].id][data[buttonPeriodProps[0].id].length - 1].value,
    usd: data[buttonPeriodProps[0].id][data[buttonPeriodProps[0].id].length - 1].usd,
  });
  const [isDragging, setIsDragging] = useState(false);

  const CustomYAxisTick = props => {
    const { x, y, payload } = props;

    return (
      <text x={x - 5} y={y} dy={4} textAnchor="end" fill={theme.palette.ds.black_static}>
        {payload.value.toFixed(1)}
      </text>
    );
  };

  const CustomActiveDot = props => {
    const { cx, cy, payload, value, index, dataLength, chartBottom, rectWidth, rectHeight } = props;

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

  const handleChoosePeriod = label => {
    const tmp = buttonPeriodProps.map(item => {
      if (item.label === label) return { ...item, active: true };
      return {
        ...item,
        active: false,
      };
    });
    setButtonPeriodProps(tmp);
  };

  const handleMouseMove = e => {
    if (!isDragging) return;

    if (!e.isTooltipActive) {
      handleMouseUp();
      return;
    }

    const value = e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.value : null;
    const usd = e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.usd : null;

    if (!value || !usd) return;
    setDetailInfo({
      value,
      usd,
    });
  };

  const handleMouseDown = event => {
    if (!event || !event.activePayload || event.activePayload.length <= 0) return;

    const value = event.activePayload[0].payload.value;
    const usd = event.activePayload[0].payload.usd;

    if (!value || !usd) return;
    setDetailInfo({
      value,
      usd,
    });
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    const currentPeriod = buttonPeriodProps.find(item => item.active).id;
    setDetailInfo({
      value: data[currentPeriod][data[currentPeriod].length - 1].value,
      usd: data[currentPeriod][data[currentPeriod].length - 1].usd,
    });
    setIsDragging(false);
  };

  const minValue = Math.min(...data[buttonPeriodProps.find(item => item.active).id].map(item => item.value));

  const maxValue = Math.max(...data[buttonPeriodProps.find(item => item.active).id].map(item => item.value));

  return {
    CustomYAxisTick,
    CustomActiveDot,
    handleChoosePeriod,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    buttonPeriodProps,
    detailInfo,
    minValue,
    maxValue,
  };
};

export default useChart;
