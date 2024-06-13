import { Box, Button, Stack, Typography, styled } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, CartesianGrid, YAxis, ResponsiveContainer, Tooltip as RechartTooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Skeleton, Tooltip, Chip } from '../../../../components';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';
import useChart from '../../common/hooks/useChart';
import { TokenType } from '../../common/types/index';
import { ChipTypes } from '../../../../components/Chip';
import { formatNumber } from '../../common/helpers/formatHelper';

const StyledButton = styled(Button)(({ theme, disabled, variant }: { theme: any; disabled: boolean; variant: string }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  height: '30px',
  padding: '6px !important',
  minWidth: '36px',
  backgroundColor:
    variant === 'contained' ? (disabled ? theme.palette.ds.gray_c100 : theme.palette.ds.el_primary_medium) : `transparent`,

  '&.MuiButton-contained': {
    color: theme.palette.ds.el_static_white,
  },
  '&.MuiButton-secondary': {
    color: disabled ? theme.palette.ds.gray_c100 : theme.palette.ds.text_primary_medium,
  },
}));

interface Props {
  isLoading: boolean;
  tokenInfo: TokenType;
  isAda: boolean;
}

const TokenDetailChart = ({ isLoading, tokenInfo, isAda }: Props): JSX.Element => {
  const chartHeight = isAda ? 156 : 241;
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
  } = useChart(tokenInfo.chartData);
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

  return (
    <Stack direction="column" spacing={theme.spacing(4)} sx={{ padding: theme.spacing(3) }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {isFetching ? (
          <Skeleton width="131px" height="13px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_cmax">
            {strings.marketPrice}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          {isFetching ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" alignItems="flex-end" color="ds.gray_cmax">
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
                <Typography display={'block'}>{strings.tokenPriceChange}</Typography>
                <Typography display={'block'}>{strings.in24hours}</Typography>
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
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                      ) : detailInfo.value < 0 ? (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
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
                    // @ts-ignore
                    <Typography variant="caption1">
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
            marginLeft: `${-theme.spacing(1)}`,
            width: '100%',
            height: `${chartHeight}px`,
          }}
        >
          {isFetching ? null : (
            <ResponsiveContainer width="100%" height={chartHeight} style={{ padding: 0 }}>
              <LineChart
                data={tokenInfo?.chartData[activePeriodId]}
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
                      dataLength={tokenInfo?.chartData[activePeriodId].length}
                      {...props}
                    />
                  )}
                  dot={false}
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke={isFetching ? theme.palette.ds.gray_c50 : theme.palette.ds.primary_c600}
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
              onClick={() => handlePeriodChange(id)}
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
