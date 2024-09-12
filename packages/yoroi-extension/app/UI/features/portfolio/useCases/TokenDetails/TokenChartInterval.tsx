import { Box, Button, Stack, Typography, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState } from 'react';
import {
    CartesianGrid,
    Line,
    LineChart,
    Tooltip as RechartTooltip,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { Skeleton } from '../../../../components';
import chartSkeletonPng from '../../common/assets/images/token-detail-chart-skeleton.png';
import { formatNumber } from '../../common/helpers/formatHelper';
import { TOKEN_CHART_INTERVAL, useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { useStrings } from '../../common/hooks/useStrings';
import { TokenType } from '../../common/types/index';
import { usePortfolio } from '../../module/PortfolioContextProvider';

// Styling for the period buttons
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

export const TokenChartInterval = ({ isLoading, tokenInfo, isPrimaryToken }: Props): JSX.Element => {
    const chartHeight = isPrimaryToken ? 153 : 257;
    const theme: any = useTheme();
    const strings = useStrings();
    const { unitOfAccount } = usePortfolio();

    // Fetch data based on the selected interval
    const [timeInterval, setTimeInterval] = useState<any>(TOKEN_CHART_INTERVAL.DAY);
    const { data, isFetching } = useGetPortfolioTokenChart(timeInterval, tokenInfo);

    const handlePeriodChange = (id: string) => {
        setTimeInterval(id);
    };

    // Prepare the chart data for recharts
    const chartData = data?.map((point: any) => ({
        label: point.label,
        value: point.value,
    })) || [];

    return (
        <Stack
            direction="column"
            spacing={theme.spacing(4)}
            sx={{ width: '100%', px: theme.spacing(3), pt: theme.spacing(2.5), pb: theme.spacing(3) }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                {isFetching || !data ? (
                    <Skeleton width="131px" height="13px" />
                ) : (
                    <Typography fontWeight="500" color="ds.gray_max">
                        {strings.marketPrice}
                    </Typography>
                )}
                <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
                    {isFetching || !data ? (
                        <Skeleton width="64px" height="13px" />
                    ) : (
                        <Stack direction="row" alignItems="flex-end" color="ds.gray_max">
                            <Typography fontWeight="500">{formatNumber(data[data.length - 1]?.value)}</Typography>
                            <Typography variant="caption1" sx={{ marginBottom: theme.spacing(0.25) }}>
                                &nbsp;{unitOfAccount}
                            </Typography>
                        </Stack>
                    )}
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
                    {isFetching || !data ? null : (
                        <ResponsiveContainer width={'99%'} height={chartHeight}>
                            <LineChart
                                data={chartData}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <YAxis
                                    domain={['auto', 'auto']}
                                    axisLine={false}
                                    tickLine={false}
                                    tickCount={9}
                                    tickFormatter={(value) => formatNumber(value)}
                                />
                                <XAxis dataKey="label" />
                                <RechartTooltip cursor={false} />
                                <Line
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
                    {Object.keys(TOKEN_CHART_INTERVAL).map((interval) => (
                        <StyledButton
                            key={interval}
                            variant={timeInterval === interval ? 'contained' : 'text'}
                            disabled={isFetching}
                            onClick={() => handlePeriodChange(interval)}
                            theme={theme}
                        >
                            {interval}
                        </StyledButton>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};

