import { Button, Stack, Typography, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { Chip, ChipTypes, Icon, Skeleton } from '../../../../../components';
import { useCurrencyPairing } from '../../../../../context/CurrencyContext';
import { formatNumber } from '../../../common/helpers/formatHelper';
import { formatPriceChange, priceChange } from '../../../common/helpers/priceChange';
import { useStrings } from '../../../common/hooks/useStrings';
import { usePortfolio } from '../../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../../module/PortfolioTokenActivityProvider';

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
  chartData: any;
  detailInfo: any;
  isLoading: boolean;
  tokenInfo: TokenInfoType;
}

export const TokenMarketPriceOverview = ({ chartData, detailInfo, tokenInfo, isLoading = false }: Props): JSX.Element => {
  const isPrimaryToken: boolean = tokenInfo === undefined;
  const theme: any = useTheme();
  const strings = useStrings();
  const { unitOfAccount } = usePortfolio();
  // Fetch data based on the selected interval

  const ptActivity = useCurrencyPairing().ptActivity;
  const { changeValue, changePercent } = priceChange(ptActivity.open, ptActivity.close);

  const {
    tokenActivity: { data24h },
  } = usePortfolioTokenActivity();

  const priceChangeProcent = isPrimaryToken
    ? detailInfo?.changePercent || changePercent
    : data24h && data24h[tokenInfo?.info?.id][1].price.change;
  const priceChangeValue = isPrimaryToken
    ? detailInfo?.changeValue || changeValue
    : data24h && data24h[tokenInfo?.info?.id][1].price.close;

  // console.log('priceChangeProcent', data24h && data24h[tokenInfo?.info?.id][1]?.price);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: !isPrimaryToken && theme.spacing(3) }}>
      <Typography fontWeight="500" color="ds.gray_max">
        {strings.marketPrice}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
        <Stack direction="row" alignItems="center" gap="16px">
          <TokenPrice
            ptActivity={ptActivity}
            isPrimaryToken={isPrimaryToken}
            unitOfAccount={unitOfAccount}
            secondaryTokenActivity={data24h && data24h[tokenInfo?.info?.id]}
          />

          {chartData === undefined ? (
            <Skeleton width="64px" height="13px" />
          ) : (
            <Stack direction="row" gap="4px">
              <PriceChangeChip value={Number(priceChangeProcent)} />
              <PriceValueChip value={Number(priceChangeValue)} unitOfAccount={unitOfAccount || 'USD'} />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

const TokenPrice = ({ isPrimaryToken, unitOfAccount, secondaryTokenActivity, ptActivity }) => {
  const tokenPrice = isPrimaryToken ? ptActivity.close : secondaryTokenActivity && secondaryTokenActivity[1].price.close;
  if (tokenPrice == null) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Stack direction="row" alignItems="flex-start" textAlign="center" color="ds.gray_max">
      <Typography fontWeight="500">{formatPriceChange(tokenPrice)}</Typography>
      <Typography variant="caption" mt="2px">
        &nbsp;{unitOfAccount}
      </Typography>
    </Stack>
  );
};

const PriceChangeChip = ({ value }: { value: number }) => {
  const theme: any = useTheme();
  return (
    <>
      <Chip
        type={value > 0 ? ChipTypes.ACTIVE : value < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
        label={
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {value > 0 ? (
              <Icon.ChipArrowUp fill={theme.palette.ds.secondary_800} />
            ) : value < 0 ? (
              <Icon.ChipArrowDown fill={theme.palette.ds.sys_magenta_700} />
            ) : null}
            {/* @ts-ignore */}
            <Typography variant="caption1">{value >= 0 ? formatNumber(value) : formatNumber(-1 * value)}%</Typography>
          </Stack>
        }
      />
    </>
  );
};
const PriceValueChip = ({ value, unitOfAccount }: { value: number; unitOfAccount: string }) => {
  return (
    <>
      <Chip
        type={value > 0 ? ChipTypes.ACTIVE : value < 0 ? ChipTypes.INACTIVE : ChipTypes.DISABLED}
        label={
          <Typography variant="caption">
            {value > 0 && '+'}
            {formatNumber(value)} {unitOfAccount}
          </Typography>
        }
      />
    </>
  );
};
