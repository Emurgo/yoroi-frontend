import { Box, Button, Stack, styled, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Label, Tooltip as RechartTooltip } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Skeleton, Tooltip } from '../../../../components';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { Chip } from '../../../../components/chip';
import moment from 'moment';
import { useStrings } from '../../common/useStrings';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { Icon } from '../../../../components/icons';

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
  const [buttonPeriodProps, setButtonPeriodProps] = useState([
    { id: 'start24HoursAgo', label: strings['24H'], active: true },
    { id: 'start1WeekAgo', label: strings['1W'], active: false },
    { id: 'start1MonthAgo', label: strings['1M'], active: false },
    { id: 'start6MonthAgo', label: strings['6M'], active: false },
    { id: 'start1YearAgo', label: strings['1Y'], active: false },
    { id: 'ALL', label: strings['ALL'], active: false },
  ]);
  const [detailInfo, setDetailInfo] = useState({
    value: tokenInfo.chartData[buttonPeriodProps[0].id][tokenInfo.chartData[buttonPeriodProps[0].id].length - 1].value,
    usd: tokenInfo.chartData[buttonPeriodProps[0].id][tokenInfo.chartData[buttonPeriodProps[0].id].length - 1].usd,
  });

  const CustomYAxisTick = props => {
    const { x, y, payload } = props;

    return (
      <text x={x - 5} y={y} dy={4} textAnchor="end" fill={theme.palette.ds.black_static}>
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

          <line x1={cx} y1={cy} x2={cx} y2={rectY} stroke={theme.palette.ds.primary_c500} strokeDasharray="5,5" />

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
    const value = e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.value : null;
    const usd = e.activePayload && e.activePayload.length > 0 ? e.activePayload[0].payload.usd : null;

    if (!value || !usd) return;
    setDetailInfo({
      value,
      usd,
    });
  };

  const minValue = tokenInfo.chartData[buttonPeriodProps.find(item => item.active).id].reduce(
    (min, item) => Math.min(min, item.value),
    Infinity
  );
  const maxValue = tokenInfo.chartData[buttonPeriodProps.find(item => item.active).id].reduce(
    (max, item) => Math.max(max, item.value),
    -Infinity
  );
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
            marginLeft: `-${theme.spacing(1)}`,
            width: '100%',
            height: `${chartHeight}px`,
          }}
        >
          {isLoading ? null : (
            <ResponsiveContainer width="100%" height={chartHeight} style={{ padding: 0 }}>
              <LineChart data={tokenInfo.chartData[buttonPeriodProps.find(item => item.active).id]} onMouseMove={handleMouseMove}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis
                  domain={[minValue, maxValue]}
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
