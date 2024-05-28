import { Box, Button, Stack, styled, Typography, Divider, SvgIcon } from '@mui/material';
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
import { Chip } from '../../common/components/Chip';
import moment from 'moment';
import { default as _ } from 'lodash';

const StyledButton = styled(Button)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.75rem',
  lineHeight: '1.125rem',
  width: '36px',
  height: '30px',
}));

const TokenDetailChart = ({ isLoading, tokenInfo }) => {
  const chartHeight = 250;
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
  const [detailInfo, setDetailInfo] = useState({
    value: tokenInfo.chartData[0].value,
    usd: tokenInfo.chartData[0].usd,
  });

  const categorizeByTime = data => {
    const now = new Date();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const categorizedData = _.reduce(
      data,
      (acc, item) => {
        const itemTime = new Date(item.time);

        if (itemTime >= yesterday) {
          acc['24H'].push(item);
        }
        if (itemTime >= oneWeekAgo) {
          acc['1W'].push(item);
        }
        if (itemTime >= oneMonthAgo) {
          acc['1M'].push(item);
        }
        if (itemTime >= sixMonthsAgo) {
          acc['6M'].push(item);
        }
        if (itemTime >= oneYearAgo) {
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

    _.forEach(categorizedData, (value, key) => {
      categorizedData[key] = _.sortBy(value, ['time']);
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

  const CustomActiveDot = props => {
    const { cx, cy, payload, value, index, dataLength, chartBottom, rectWidth, rectHeight } = props;

    let rectX = cx - rectWidth / 2;
    if (index === 0) {
      rectX = cx;
    } else if (index === dataLength - 1) {
      rectX = cx - rectWidth;
    } else {
      rectX = cx - (index * rectWidth) / dataLength;
    }

    const rectY = chartBottom - rectHeight;

    return (
      <svg>
        <g>
          <circle cx={cx} cy={cy} r={5} fill={theme.palette.ds.primary_c500} />

          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={rectY}
            stroke={theme.palette.ds.primary_c500}
            strokeDasharray="5,5"
          />

          <Box
            component="rect"
            x={rectX}
            y={rectY}
            width={rectWidth}
            height={rectHeight}
            fill={theme.palette.ds.primary_c500}
            rx={5}
            ry={5}
          ></Box>
          <Box
            component="text"
            x={rectX + rectWidth / 2}
            y={rectY + rectHeight / 2}
            textAnchor="middle"
            fill={theme.palette.ds.primary_c200}
            alignmentBaseline="middle"
            sx={{
              fontFamily: theme.typography.fontFamily,
              fontSize: '0.75rem',
              fontWeight: 400,
            }}
          >
            {moment(payload.time).format('MM/DD/YY H:mm')}
          </Box>
        </g>
      </svg>
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

  const handleMouseMove = e => {
    const value =
      e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.value : null;
    const usd =
      e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.usd : null;

    if (!value || !usd) return;
    setDetailInfo({
      value,
      usd,
    });
  };

  return (
    <Box sx={{ padding: theme.spacing(3) }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginBottom: theme.spacing(4) }}
      >
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
                {detailInfo.value}
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
                  active={detailInfo.value > 0}
                  label={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <ArrowIcon
                        fill={
                          detailInfo.value > 0
                            ? theme.palette.ds.secondary_c800
                            : theme.palette.ds.sys_magenta_c700
                        }
                        style={{
                          marginRight: theme.spacing(0.5),
                          transform: detailInfo.value > 0 ? '' : 'rotate(180deg)',
                        }}
                      />
                      <Typography variant="caption1">{detailInfo.value}%</Typography>
                    </Stack>
                  }
                />
              )}

              {isLoading ? (
                <Skeleton width="35px" height="16px" />
              ) : (
                <Chip
                  active={detailInfo.usd > 0}
                  label={
                    <Typography variant="caption1">
                      {detailInfo.usd > 0 ? '+' : '-'}
                      {detailInfo.usd} USD
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
          sx={{ margin: '20px 0', width: '100%', height: `${chartHeight}px` }}
        >
          {isLoading ? null : (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart
                data={filteredData[buttonPeriodProps.find(item => item.active).label]}
                onMouseMove={handleMouseMove}
              >
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
                  activeDot={props => (
                    <CustomActiveDot
                      chartBottom={chartHeight}
                      rectWidth={93}
                      rectHeight={34}
                      dataLength={
                        filteredData[buttonPeriodProps.find(item => item.active).label].length
                      }
                      {...props}
                    />
                  )}
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
    </Box>
  );
};

export default TokenDetailChart;
