// RewardGraphClean.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Stack, Typography, Box, useTheme } from '@mui/material';
import { GraphItems } from '../../common/types';

const graphVars = {
  barWidth: 10,
  fontSize: '14px',
  lineHeight: 16,
} as const;

type Props = {
  data: GraphItems[];
  epochTitle: string;
  stakepoolNameTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
  primaryBarLabel: string;
  hideYAxis: boolean;
};

type GraphTooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number | string;
    payload: GraphItems;
  }>;
  label?: string | number;
};

const RewardGraphClean: React.FC<Props> = ({
  hideYAxis,
  data,
  xAxisLabel,
  yAxisLabel,
  primaryBarLabel,
  epochTitle,
  stakepoolNameTitle,
}) => {
  const theme: any = useTheme();

  const formatYAxis = (value: number): string | number => (!hideYAxis ? value : '∗∗∗ ');

  const GraphTooltip: React.FC<GraphTooltipProps> = ({ active, payload, label }) => {
    if (active && payload != null && payload.length > 0 && label != null) {
      const first = payload[0];
      if (!first) return null;
      const poolName = first.payload.poolName;
      const values: Array<[string, string | number]> = [
        [epochTitle, label],
        [primaryBarLabel, first.value],
        ...(poolName ? [[stakepoolNameTitle, poolName] as [string, string]] : []),
      ];

      return (
        <Box
          sx={{
            padding: '8px 12px 8px 8px',
            bgcolor: theme.palette.ds.gray_900,
            color: 'ds.bg_color_max',
            lineHeight: '14px',
            borderRadius: '4px',
          }}
        >
          {values.map(([key, value], idx) => (
            <Stack direction="row" mb="2px" key={`${key}-${idx}`}>
              <Typography width={idx === 2 ? '100px' : 'auto'} mr="3px" variant="caption">
                {key}:
              </Typography>
              <Typography
                sx={{
                  wordWrap: 'break-word',
                  maxWidth: '300px',
                }}
                variant="caption"
                fontWeight="bold"
              >
                {value}
              </Typography>
            </Stack>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data.slice(-10)} height={200} margin={{ top: 0, right: 0, left: 56, bottom: 0 }}>
        <XAxis
          tick={{
            fill: theme.palette.ds.text_gray_low,
            fontSize: graphVars.fontSize,
            lineHeight: graphVars.lineHeight,
          }}
          dataKey="name"
          height={50}
          label={{
            value: xAxisLabel,
            position: 'insideBottom',
            fontSize: '12px',
            fill: theme.palette.ds.text_gray_low,
            offset: 10,
          }}
          padding={{ left: 24, right: 24 }}
          stroke={theme.palette.ds.gray_200}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          padding={{ top: 12 }}
          tick={{
            fill: theme.palette.ds.text_gray_low,
            fontSize: graphVars.fontSize,
            lineHeight: graphVars.lineHeight,
          }}
          stroke={theme.palette.ds.gray_200}
          tickLine={false}
          label={{
            value: yAxisLabel,
            position: 'insideLeft',
            offset: 15,
            dy: 50,
            angle: -90,
            fill: theme.palette.ds.text_gray_low,
            textAnchor: 'middle',
            fontSize: '12px',
            fontWeight: 400,
          }}
        />

        <Tooltip content={<GraphTooltip />} cursor={false} />

        <Bar
          name={primaryBarLabel}
          maxBarSize={graphVars.barWidth}
          radius={[4, 4, 0, 0]}
          dataKey="primary"
          stackId="a"
          fill={theme.palette.ds.el_primary_medium}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RewardGraphClean;
