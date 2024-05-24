import { Box, Button, Stack, styled } from '@mui/material';
import React, { useState } from 'react';
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
import mockData from '../../../../pages/portfolio/mockData';

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  width: '36px',
  height: '30px',
}));

const TokenDetailChart = ({ isLoading }) => {
  const timePeriods = [
    { label: '24H', active: true },
    { label: '1W', active: false },
    { label: '1M', active: false },
    { label: '6M', active: false },
    { label: '1Y', active: false },
    { label: 'ALL', active: false },
  ];
  const theme = useTheme();
  const [data, setData] = useState(mockData.Chart.data);

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

  return (
    <Box sx={{ userSelect: 'none', width: '100%', margin: '10px 0' }}>
      <Box sx={{ margin: '20px 0' }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <YAxis
              axisLine={false}
              allowDecimals={true}
              tickLine={false}
              type={'number'}
              tick={CustomYAxisTick}
            ></YAxis>
            {!isLoading && <Tooltip />}
            <Line
              type="monotone"
              dataKey="value"
              strokeWidth={2}
              stroke={isLoading ? theme.palette.ds.gray_c50 : theme.palette.ds.primary_c500}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" justifyContent="space-between">
        {timePeriods.map(period => (
          <StyledButton
            key={period.label}
            variant={period.active ? 'contained' : 'text'}
            disabled={isLoading}
          >
            {period.label}
          </StyledButton>
        ))}
      </Stack>
    </Box>
  );
};

export default TokenDetailChart;
