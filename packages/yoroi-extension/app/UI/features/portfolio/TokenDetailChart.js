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

// Sample data
const sampleData = [
  { name: 'Page A', value: 0.1 },
  { name: 'Page B', value: 0.15 },
  { name: 'Page C', value: 0.05 },
  { name: 'Page D', value: 0.35 },
  { name: 'Page E', value: 0.6 },
  { name: 'Page F', value: 0.45 },
  { name: 'Page G', value: 0.3 },
  { name: 'Page H', value: 0.2 },
  { name: 'Page I', value: 0.35 },
  { name: 'Page J', value: 0.55 },
];

const timePeriods = [
  { label: '24H', active: true },
  { label: '1W', active: false },
  { label: '1M', active: false },
  { label: '6M', active: false },
  { label: '1Y', active: false },
  { label: 'ALL', active: false },
];

const TokenDetailChart = ({ isLoading }) => {
  const [data, setData] = useState(sampleData);

  const CustomYAxisTick = props => {
    const { x, y, payload } = props;

    return isLoading ? (
      <SkeletonLabel x={x} y={y} />
    ) : (
      <text x={x} y={y} dy={4} textAnchor="end" fill="#666">
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
              stroke="primary_c500"
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

const SkeletonLabel = ({ x, y, width = 19, height = 13, borderRadius = 8, marginRight = 10 }) => {
  return (
    <rect
      x={x - width / 2 - marginRight}
      y={y - height / 2}
      width={width}
      height={height}
      rx={borderRadius}
      ry={borderRadius}
      fill="rgba(234, 237, 242, 1)"
    />
  );
};

const StyledButton = styled(Button)({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  width: '36px',
  height: '30px',
});

export default TokenDetailChart;
