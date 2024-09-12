import { Box, Button, Stack, Typography, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { CartesianGrid, Line, LineChart, Tooltip as RechartTooltip, ResponsiveContainer, YAxis } from 'recharts';
import { Chip, Skeleton, Tooltip } from '../../../../components';
import { ChipTypes } from '../../../../components/Chip';
import { Icon } from '../../../../components/icons';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { formatNumber } from '../../common/helpers/formatHelper';
import { createChartData } from '../../common/helpers/mockHelper';
import useChart from '../../common/hooks/useChart';
import { TOKEN_CHART_INTERVAL, useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { useStrings } from '../../common/hooks/useStrings';
import { TokenType } from '../../common/types/index';
import { usePortfolio } from '../../module/PortfolioContextProvider';


const chartData = {
  start24HoursAgo: createChartData('24H'),
  start1WeekAgo: createChartData('1W'),
  start1MonthAgo: createChartData('1M'),
  start6MonthAgo: createChartData('6M'),
  start1YearAgo: createChartData('1Y'),
  ALL: createChartData('1Y'),
}

const StyledButton = styled(Button)(({ theme, disabled, variant }: { theme: any; disabled: boolean; variant: string }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  height: '30px',
  padding: '6px !important',
  minWidth: '36px',
  backgroundColor:
    variant === 'contained' ? (disabled ? theme.palette.ds.gray_100 : theme.palette.ds.el_primary_medium) : `transparent`,

  '&.MuiButton-contained': {
    color: theme.palette.ds.white_static,
  },
  '&.MuiButton-secondary': {
    color: disabled ? theme.palette.ds.gray_100 : theme.palette.ds.text_primary_medium,
  },
}));

interface Props {
  isLoading: boolean;
  tokenInfo: TokenType;
  isPrimaryToken: boolean;
}

const TokenDetailChart = ({ isLoading, tokenInfo, isPrimaryToken }: Props): JSX.Element => {
  const chartHeight = isPrimaryToken ? 153 : 257;
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const {
    CustomYAxisTick,
    CustomActiveDot,
    handleChoosePeriod,
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    periodButtonProps,
    detailInfo,
    minValue,
    maxValue,
    activePeriodId,
  } = useChart(chartData);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      setIsFetching(true);
    } else {
      setIsFetching(false);
    }
  }, [isLoading]);

  const handlePeriodChange = (id: string) => {
    handleChoosePeriod(id);

    // FAKE FETCHING DATA
    setIsFetching(true);

    setTimeout(() => {
      setIsFetching(false);
    }, 1000);
  };


  // new logic =----------------------------------------------------------------


  const [timeInterval, setTimeInterval] = useState<any>(TOKEN_CHART_INTERVAL.DAY)

  const { data } = useGetPortfolioTokenChart(timeInterval, tokenInfo)
  console.log("useGetPortfolioTokenChart", data)

  return (
    <Stack
      direction="column"
      spacing={theme.spacing(4)}
      sx={{ width: '100%', px: theme.spacing(3), pt: theme.spacing(2.5), pb: theme.spacing(3) }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {isFetching ? (
          <Skeleton width="131px" height="13px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_max">
            {strings.marketPrice}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          {isFetching ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" alignItems="flex-end" color="ds.gray_max">
              <Typography fontWeight="500">{formatNumber(detailInfo.fiatValue)}</Typography>
              {/* @ts-ignore */}
              <Typography variant="caption1" sx={{ marginBottom: theme.spacing(0.25) }}>
                &nbsp;{unitOfAccount}
              </Typography>
            </Stack>
          )}
          <Tooltip
            title={
              <>
                <Typography variant="body2" display={'block'}>
                  {strings.tokenPriceChange}
                </Typography>
                <Typography variant="body2" display={'block'}>
                  {strings.in24hours}
                </Typography>
              </>
            }
            placement="top"
          >
            <Stack direction="row" alignItems="center" spacing={theme.spacing(0.5)}>
              {isFetching ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  type={detailInfo.value > 0 ? ChipTypes.ACTIVE : detailInfo.value < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {detailInfo.value > 0 ? (
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_800} />
                      ) : detailInfo.value < 0 ? (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_700} />
                      ) : null}
                      {/* @ts-ignore */}
                      <Typography variant="caption1">
                        {detailInfo.value >= 0 ? formatNumber(detailInfo.value) : formatNumber(-1 * detailInfo.value)}%
                      </Typography>
                    </Stack>
                  }
                />
              )}

              {isFetching ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  type={
                    detailInfo.fiatValue > 0
                      ? ChipTypes.ACTIVE
                      : detailInfo.fiatValue < 0
                        ? ChipTypes.INACTIVE
                        : ChipTypes.DISABLED
                  }
                  label={
                    <Typography variant="caption">
                      {detailInfo.fiatValue > 0 && '+'}
                      {formatNumber(detailInfo.fiatValue)} {unitOfAccount}
                    </Typography>
                  }
                />
              )}
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ userSelect: 'none', width: '100%' }}>
        <Box
          component={isFetching ? 'img' : 'div'}
          src={chartSkeletonPng}
          sx={{
            width: '100%',
            height: `${chartHeight}px`,
          }}
        >
          {isFetching ? null : (
            <ResponsiveContainer width={'99%'} height={chartHeight}>
              <LineChart
                data={chartData[activePeriodId]}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseUp}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis
                  domain={[minValue, maxValue]}
                  axisLine={false}
                  tickLine={false}
                  type={'number'}
                  tick={CustomYAxisTick}
                  tickCount={9}
                ></YAxis>
                <RechartTooltip cursor={false} content={<></>} />
                <Line
                  activeDot={(props: any) => (
                    <CustomActiveDot
                      chartBottom={chartHeight}
                      rectWidth={93}
                      rectHeight={34}
                      dataLength={chartData[activePeriodId].length}
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
          {periodButtonProps.map(({ id, active, label }) => (
            <StyledButton
              key={id}
              variant={active ? 'contained' : 'text'}
              disabled={isFetching}
              onClick={() => handlePeriodChange(id.toString())}
              theme={theme}
            >
              {label}
            </StyledButton>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default TokenDetailChart;
