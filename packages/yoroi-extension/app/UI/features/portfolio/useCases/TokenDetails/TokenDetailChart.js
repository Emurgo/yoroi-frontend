import { Box, Button, Stack, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { useTheme } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  width: '36px',
  height: '30px',
}));

const StyledTooltip = styled(Box)(({ theme }) => ({
  padding: '10px',
  borderRadius: `${theme.shape.borderRadius}px`,
  border: `1px solid ${theme.palette.ds.sys_cyan_c100}`,
  backgroundColor: theme.palette.ds.primary_c200,
  color: theme.palette.ds.primary_c700,
}));

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <StyledTooltip>
        <Typography>{`Date: ${payload[0].payload.date}`}</Typography>
        <Typography>{`Price: ${payload[0].value} USD`}</Typography>
      </StyledTooltip>
    );
  }

  return null;
};

const TokenDetailChart = ({ isLoading, data }) => {
  const theme = useTheme();
  const [buttonPeriodProps, setButtonPeriodProps] = useState([
    { label: '24H', active: true },
    { label: '1W', active: false },
    { label: '1M', active: false },
    { label: '6M', active: false },
    { label: '1Y', active: false },
    { label: 'ALL', active: false },
  ]);

  const categorizeByDate = data => {
    const now = new Date();

    const todayStart = new Date(now);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);

    const oneWeekAgo = new Date(todayStart);
    oneWeekAgo.setDate(todayStart.getDate() - 7);

    const oneMonthAgo = new Date(todayStart);
    oneMonthAgo.setMonth(todayStart.getMonth() - 1);

    const sixMonthsAgo = new Date(todayStart);
    sixMonthsAgo.setMonth(todayStart.getMonth() - 6);

    const oneYearAgo = new Date(todayStart);
    oneYearAgo.setFullYear(todayStart.getFullYear() - 1);

    const categorizedData = data.reduce(
      (acc, item) => {
        const itemDate = new Date(item.date);

        if (itemDate >= yesterdayStart && itemDate < todayStart) {
          acc['24H'].push(item);
        }
        if (itemDate >= oneWeekAgo && itemDate < todayStart) {
          acc['1W'].push(item);
        }
        if (itemDate >= oneMonthAgo && itemDate < todayStart) {
          acc['1M'].push(item);
        }
        if (itemDate >= sixMonthsAgo && itemDate < todayStart) {
          acc['6M'].push(item);
        }
        if (itemDate >= oneYearAgo && itemDate < todayStart) {
          acc['1Y'].push(item);
        }

        acc['ALL'].push(item);

        return acc;
      },
      {
        '24H': [],
        '1W': [],
        '1M': [],
        '6M': [],
        '1Y': [],
        ALL: [],
      }
    );

    Object.keys(categorizedData).forEach(key => {
      categorizedData[key].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return categorizedData;
  };

  const categorizedData = useMemo(() => categorizeByDate(data), [data]);

  const SkeletonLabel = ({ x, y, width = 19, height = 13, borderRadius = 8, marginRight = 10 }) => {
    return (
      <rect
        x={x - width / 2 - marginRight}
        y={y - height / 2}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={theme.palette.ds.gray_c50}
      />
    );
  };
  const CustomYAxisTick = props => {
    const { x, y, payload } = props;

    return isLoading ? (
      <SkeletonLabel x={x} y={y} />
    ) : (
      <text x={x} y={y} dy={4} textAnchor="end" fill={theme.palette.ds.black_static}>
        {payload.value}
      </text>
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

  useEffect(() => {
    console.log('categorized data', categorizedData);
  }, [categorizedData]);

  return (
    <Box sx={{ userSelect: 'none', width: '100%', margin: '10px 0' }}>
      <Box sx={{ margin: '20px 0' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={categorizedData[buttonPeriodProps.find(item => item.active).label]}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <YAxis
              axisLine={false}
              allowDecimals={true}
              tickLine={false}
              type={'number'}
              tick={CustomYAxisTick}
            ></YAxis>
            {!isLoading && <Tooltip content={<CustomTooltip />} />}
            <Line
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              stroke={isLoading ? theme.palette.ds.gray_c50 : theme.palette.ds.text_primary_medium}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" justifyContent="space-between">
        {buttonPeriodProps.map(period => (
          <StyledButton
            key={period.label}
            variant={period.active ? 'contained' : 'text'}
            disabled={isLoading}
            onClick={() => handleChoosePeriod(period.label)}
          >
            {period.label}
          </StyledButton>
        ))}
      </Stack>
    </Box>
  );
};

export default TokenDetailChart;
