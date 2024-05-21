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

const TokenDetailChart = () => {
  const [data, setData] = useState(sampleData);

  return (
    <Box sx={{ userSelect: 'none', width: '100%', margin: '10px 0' }}>
      <Box sx={{ margin: '20px 0' }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis domain={[0, 0.6]} hide />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Stack direction="row" justifyContent="space-between">
        {timePeriods.map(period => (
          <StyledButton key={period.label} variant={period.active ? 'contained' : 'text'}>
            {period.label}
          </StyledButton>
        ))}
      </Stack>
    </Box>
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
