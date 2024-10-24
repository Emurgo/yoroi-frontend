import { Box, Button, Skeleton, Stack, styled, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as RechartTooltip, ResponsiveContainer, YAxis } from 'recharts';
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
  const { CustomYAxisTick, CustomActiveDot, handleMouseMove, handleMouseDown, handleMouseUp, detailInfo, isDragging } = useChart(
    chartData
  );

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
      sx={{ width: '100%', px: theme.spacing(3), pt: theme.spacing(2.5), pb: theme.spacing(3), height: '317px' }}
    >
      <TokenMarketPriceOverview
        chartData={chartData}
        detailInfo={detailInfo}
        isLoading={isFetching || !data || chartData === undefined}
        tokenInfo={tokenInfo}
        isDragging={isDragging}
      />

      <Box sx={{ userSelect: 'none', width: '100%' }}>
        {isFetching ? (
          <GraphSkeleton />
        ) : (
          <Box
            component="div"
            sx={{
              width: '100%',
              height: `${160}px`,
            }}
          >
            {!data ? null : (
              <ResponsiveContainer width={'100%'} height="100%">
                <LineChart
                  margin={{ top: 10, left: -16, right: 0, bottom: 0 }}
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
                    tickCount={6}
                  />
                  <RechartTooltip cursor={false} content={<></>} />
                  <Line
                    activeDot={(props: any) => (
                      <CustomActiveDot
                        chartBottom={chartHeight}
                        rectWidth={120}
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
        )}

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
const GraphSkeleton: React.FC = () => {
  return (
    <Box sx={{ width: '100%', marginRight: '20px', height: 160, position: 'relative' }}>
      <Stack>
        {['0.36', '0.36', '0.35', '0.36', '0.35'].map((_, index) => (
          <Typography
            key={index}
            sx={{
              position: 'absolute',
              top: `${index * 25}%`,
              left: 0,
              transform: 'translateY(-50%)',
              fontSize: '12px',
            }}
          >
            <Skeleton width="20px" height="20px" />
          </Typography>
        ))}
      </Stack>

      {[0, 25, 50, 75, 100].map((value, index) => (
        <Skeleton
          key={index}
          variant="rectangular"
          height={1.5}
          sx={{
            position: 'absolute',
            top: `${value}%`,
            marginLeft: '25px',
            marginRight: '100px',
            width: '96%',
            opacity: 0.5,
          }}
        />
      ))}
    </Box>
  );
};

export default GraphSkeleton;
