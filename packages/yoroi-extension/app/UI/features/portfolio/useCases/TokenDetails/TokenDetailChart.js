// @flow
import { Box, Button, Stack, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label, Tooltip as RechartTooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Skeleton, Tooltip, Chip } from '../../../../components';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { useStrings } from '../../common/hooks/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';
import useChart from '../../common/hooks/useChart';

const StyledButton = styled(Button)(({ theme, disabled, variant }) => ({
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

const TokenDetailChart = ({ isLoading, tokenInfo, isAda }) => {
  const chartHeight = isAda ? 156 : 241;
  const theme = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  const {
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
  } = useChart(tokenInfo.chartData);

  return (
    <Stack direction="column" spacing={theme.spacing(4)} sx={{ padding: theme.spacing(3) }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {isLoading ? (
          <Skeleton width="131px" height="13px" />
        ) : (
          <Typography fontWeight="500" color="ds.gray_cmax">
            {strings.marketPrice}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          {isLoading ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" alignItems="flex-end" color="ds.gray_cmax">
              <Typography fontWeight="500">{detailInfo.usd}</Typography>
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
              {isLoading ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  active={detailInfo.value >= 0}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      {detailInfo.value >= 0 ? (
                        <Icon.ChipArrowUp fill={theme.palette.ds.secondary_c800} />
                      ) : (
                        <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_c700} />
                      )}

                      <Typography variant="caption1">
                        {detailInfo.value >= 0 ? detailInfo.value : -1 * detailInfo.value}%
                      </Typography>
                    </Stack>
                  }
                />
              )}

              {isLoading ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  active={detailInfo.usd >= 0}
                  label={
                    <Typography variant="caption1">
                      {detailInfo.usd >= 0 && '+'}
                      {detailInfo.usd} {unitOfAccount}
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
          component={isLoading ? 'img' : 'div'}
          src={chartSkeletonPng}
          sx={{
            marginLeft: `${-theme.spacing(1)}`,
            width: '100%',
            height: `${chartHeight}px`,
          }}
        >
          {isLoading ? null : (
            <ResponsiveContainer width="100%" height={chartHeight} style={{ padding: 0 }}>
              <LineChart
                data={tokenInfo.chartData[buttonPeriodProps.find(item => item.active).id]}
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
                  activeDot={props => (
                    <CustomActiveDot
                      chartBottom={chartHeight}
                      rectWidth={93}
                      rectHeight={34}
                      dataLength={tokenInfo.chartData[buttonPeriodProps.find(item => item.active).id].length}
                      {...props}
                    />
                  )}
                  dot={false}
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke={isLoading ? theme.palette.ds.gray_c50 : theme.palette.ds.primary_c600}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ marginTop: theme.spacing(3) }}>
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
    </Stack>
  );
};

export default TokenDetailChart;
