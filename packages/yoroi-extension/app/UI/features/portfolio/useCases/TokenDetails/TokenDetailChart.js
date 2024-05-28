import { Box, Button, Stack, styled, Typography, Divider } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Label,
  Tooltip as RechartTooltip,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import ArrowIcon from '../../common/assets/icons/Arrow';
import { Skeleton, Tooltip } from '../../../../components';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { Chip } from '../../common/chip';

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  width: '36px',
  height: '30px',
}));

const TokenDetailChart = ({ isLoading, tokenInfo }) => {
  const theme = useTheme();
  const { strings } = usePortfolio();
  const [buttonPeriodProps, setButtonPeriodProps] = useState([
    { label: '24H', active: true },
    { label: '1W', active: false },
    { label: '1M', active: false },
    { label: '6M', active: false },
    { label: '1Y', active: false },
    { label: 'ALL', active: false },
  ]);

  const categorizeByTime = data => {
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
        const itemTime = new Date(item.time);

        if (itemTime >= yesterdayStart && itemTime < todayStart) {
          acc['24H'].push(item);
        }
        if (itemTime >= oneWeekAgo && itemTime < todayStart) {
          acc['1W'].push(item);
        }
        if (itemTime >= oneMonthAgo && itemTime < todayStart) {
          acc['1M'].push(item);
        }
        if (itemTime >= sixMonthsAgo && itemTime < todayStart) {
          acc['6M'].push(item);
        }
        if (itemTime >= oneYearAgo && itemTime < todayStart) {
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

  const filteredData = useMemo(() => categorizeByTime(tokenInfo.chartData), [tokenInfo.chartData]);

  const CustomYAxisTick = props => {
    const { x, y, payload } = props;

    return (
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

  const CustomActiveDot = props => {
    const { cx, cy, payload, value, index } = props;

    const rectWidth = 163;
    const rectHeight = 20;
    const rectYOffset = 50;
    const chartBottom = 250;

    // Calculate the position adjustment
    let rectX = index * (rectWidth / filteredData.length);
    if (index === 0) {
      // If the active dot is the first dot, align the rectangle to the right
      rectX = cx;
    } else if (index === filteredData.length - 1) {
      // If the active dot is the last dot, align the rectangle to the left
      rectX = cx - rectWidth;
    }

    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill={theme.palette.ds.text_primary_medium} />

        <line
          x1={cx}
          y1={cy}
          x2={cx}
          y2={chartBottom}
          stroke={theme.palette.ds.text_primary_medium}
          strokeDasharray="5,5"
        />

        <rect
          x={rectX}
          y={chartBottom + index * (rectWidth / filteredData.length)}
          width={rectWidth}
          height={rectHeight}
          fill={theme.palette.ds.text_primary_medium}
          rx={5}
          ry={5}
        />
        <text
          x={cx + (index / filteredData.length) * rectYOffset}
          y={chartBottom + rectHeight / 2 + 5}
          textAnchor="middle"
          fill={theme.palette.ds.sys_magenta_c700}
        >
          {payload.time}
        </text>
      </g>
    );
  };

  return (
    <Box sx={{ padding: theme.spacing(3) }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {isLoading ? (
          <Skeleton width="131px" height="13px" />
        ) : (
          <Typography fontWeight="500" sx={{ color: theme.palette.ds.black_static }}>
            {strings.marketPrice}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
          {isLoading ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" alignItems="center">
              <Typography fontWeight="500" sx={{ marginBottom: theme.spacing(0.1125) }}>
                {tokenInfo.price}
              </Typography>
              <Typography variant="caption1">&nbsp;USD</Typography>
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
                  active={tokenInfo.price > 0}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <ArrowIcon
                        fill={
                          tokenInfo.price > 0
                            ? theme.palette.ds.secondary_c800
                            : theme.palette.ds.sys_magenta_c700
                        }
                        style={{
                          marginRight: theme.spacing(0.5),
                          transform: tokenInfo.price > 0 ? '' : 'rotate(180deg)',
                        }}
                      />
                      <Typography variant="caption1">{tokenInfo.price}%</Typography>
                    </Stack>
                  }
                />
              )}

              {isLoading ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  active={tokenInfo.totalAmountUsd > 0}
                  label={
                    <Typography variant="caption1">
                      {tokenInfo.totalAmountUsd > 0 ? '+' : '-'}
                      {tokenInfo.totalAmountUsd} USD
                    </Typography>
                  }
                />
              )}
            </Stack>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ userSelect: 'none', width: '100%', margin: '10px 0' }}>
        <Box
          component={isLoading ? 'img' : 'div'}
          src={chartSkeletonPng}
          sx={{ margin: '20px 0', width: '100%', height: '265px' }}
        >
          {isLoading ? null : (
            <ResponsiveContainer width="100%" height={265}>
              <LineChart data={filteredData[buttonPeriodProps.find(item => item.active).label]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis
                  axisLine={false}
                  allowDecimals={true}
                  tickLine={false}
                  type={'number'}
                  tick={CustomYAxisTick}
                ></YAxis>
                <RechartTooltip cursor={false} content={<></>} />
                <Line
                  activeDot={<CustomActiveDot />}
                  dot={false}
                  type="monotone"
                  dataKey="value"
                  strokeWidth={2}
                  stroke={
                    isLoading ? theme.palette.ds.gray_c50 : theme.palette.ds.text_primary_medium
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          )}
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
    </Box>
  );
};

export default TokenDetailChart;
