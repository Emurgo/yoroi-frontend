import { Box, Button, Stack, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as RechartTooltip, ResponsiveContainer, YAxis } from 'recharts';
import chartSkeletonPng from '../../../common/assets/images/token-detail-chart-skeleton.png';
import { TOKEN_CHART_INTERVAL } from '../../../common/helpers/constants';
import useChart from '../../../common/hooks/useChart';
import { useGetPortfolioTokenChart } from '../../../common/hooks/usePortfolioTokenChart';
import { TokenMarketPriceOverview } from './MarketPriceOverview';

// Styling for the period buttons
const StyledButton = styled(Button)(({ theme, disabled, variant }: { theme: any; disabled: boolean; variant: string }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  height: '30px',
  padding: '6px !important',
  minWidth: '36px',
  backgroundColor:
    variant === 'contained' ? (disabled ? theme.palette.ds.gray_100 : theme.palette.ds.primary_500) : `transparent`,

  '&.MuiButton-contained': {
    color: theme.palette.ds.gray_min,
  },
  '&.MuiButton-secondary': {
    color: disabled ? theme.palette.ds.gray_100 : theme.palette.ds.text_primary_medium,
  },
  '&:hover': {
    backgroundColor:
      variant === 'contained' ? (disabled ? theme.palette.ds.gray_100 : theme.palette.ds.primary_500) : `transparent`,
  },
}));

interface Props {
  tokenInfo: TokenInfoType;
}

export const TokenChartInterval = ({ tokenInfo }: Props): JSX.Element => {
  const isPrimaryToken: boolean = tokenInfo.id === '-';

  const chartHeight = isPrimaryToken ? 153 : 257;
  const theme: any = useTheme();

  // Fetch data based on the selected interval
  const [timeInterval, setTimeInterval] = useState<any>(TOKEN_CHART_INTERVAL.DAY);
  const { data, isFetching } = useGetPortfolioTokenChart(timeInterval, tokenInfo);

  const handlePeriodChange = (id: string) => {
    setTimeInterval(TOKEN_CHART_INTERVAL[id]);
  };

  // Prepare the chart data for recharts
  const chartData =
    data?.map((point: any) => ({
      label: point.label,
      value: point.value,
      changePercent: point.changePercent,
      changeValue: point.changeValue,
    })) || [];
  const { CustomYAxisTick, CustomActiveDot, handleMouseMove, handleMouseDown, handleMouseUp, detailInfo } = useChart(chartData);

  if (!isPrimaryToken) {
    return (
      <TokenMarketPriceOverview
        chartData={chartData}
        detailInfo={detailInfo}
        isLoading={isFetching || !data || chartData === undefined}
        tokenInfo={tokenInfo}
      />
    );
  }

  return (
    <Stack
      direction="column"
      spacing={theme.spacing(4)}
      sx={{ width: '100%', px: theme.spacing(3), pt: theme.spacing(2.5), pb: theme.spacing(3) }}
    >
      <TokenMarketPriceOverview
        chartData={chartData}
        detailInfo={detailInfo}
        isLoading={isFetching || !data || chartData === undefined}
        tokenInfo={tokenInfo}
      />

      <Box sx={{ userSelect: 'none', width: '100%' }}>
        <Box
          component={isFetching ? 'img' : 'div'}
          src={chartSkeletonPng}
          sx={{
            width: '100%',
            height: `${chartHeight}px`,
          }}
        >
          {isFetching || !data ? null : (
            <ResponsiveContainer width={'100%'} height={chartHeight}>
              <LineChart
                margin={{ top: 0, left: -23, right: 0, bottom: 0 }}
                data={chartData}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis
                  domain={['auto', 'auto']}
                  axisLine={false}
                  tickLine={false}
                  type={'number'}
                  tick={CustomYAxisTick}
                  tickCount={9}
                />
                <RechartTooltip cursor={false} content={<></>} />
                <Line
                  activeDot={(props: any) => (
                    <CustomActiveDot
                      chartBottom={chartHeight}
                      rectWidth={93}
                      rectHeight={34}
                      dataLength={chartData.length}
                      {...props}
                    />
                  )}
                  dot={false}
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke={isFetching ? theme.palette.ds.gray_50 : theme.palette.ds.primary_600}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ marginTop: theme.spacing(3) }}>
          {Object.keys(TOKEN_CHART_INTERVAL).map(interval => (
            <StyledButton
              key={interval}
              variant={timeInterval === TOKEN_CHART_INTERVAL[interval] ? 'contained' : 'text'}
              disabled={isFetching}
              onClick={() => handlePeriodChange(interval)}
              theme={theme}
            >
              {TOKEN_CHART_INTERVAL[interval]}
            </StyledButton>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};
