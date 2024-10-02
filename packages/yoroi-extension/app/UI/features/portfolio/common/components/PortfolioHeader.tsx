import { Box, Stack, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import { SearchInput, Skeleton, Tooltip } from '../../../../components';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import { WalletBalance } from '../../../../types/currrentWallet';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';
import { formatPriceChange, priceChange } from '../helpers/priceChange';
import { useStrings } from '../hooks/useStrings';
import { HeaderPrice } from './HeaderPrice';
import PnlTag from './PlnTag';

export function formatValue(value: BigNumber): string {
  if (value.isZero()) {
    return '0';
  }
  if (value.abs().lt(1)) {
    return value.toFormat(6);
  }
  return value.toFixed(2);
}

interface Props {
  walletBalance: WalletBalance;
  setKeyword: (keyword: string) => void;
  isLoading: boolean;
  tooltipTitle: JSX.Element;
}

const PortfolioHeader = ({ walletBalance, setKeyword, isLoading, tooltipTitle }: Props): JSX.Element => {
  const strings = useStrings();
  const theme: any = useTheme();
  const { unitOfAccount, changeUnitOfAccountPair, accountPair, primaryTokenInfo } = usePortfolio();
  const { tokenActivity } = usePortfolioTokenActivity();

  const {
    ptActivity: { open, close: ptPrice },
    config,
  } = useCurrencyPairing();

  const { changeValue, changePercent, variantPnl } = priceChange(open, ptPrice);

  const showADA = accountPair?.from.name === 'ADA';

  const totalTokenPrice = React.useMemo(() => {
    // const tokenPrice = tokenActivity?.data24h[amount?.info.id]?.price.close;
    const showingAda = accountPair?.from.name !== 'ADA';
    const currency = showingAda ? primaryTokenInfo.ticker : unitOfAccount;

    if (ptPrice == null) return `... ${currency}`;

    const totalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptPrice)));

    return totalAmount;
  }, [tokenActivity, config.decimals, ptPrice]);

  const handleCurrencyChange = () => {
    changeUnitOfAccountPair({
      from: { name: showADA ? unitOfAccount ?? 'USD' : 'ADA', value: showADA ? totalTokenPrice ?? '0' : walletBalance.ada },
      to: { name: showADA ? 'ADA' : unitOfAccount ?? 'USD', value: showADA ? walletBalance.ada : totalTokenPrice },
    });
  };

  React.useEffect(() => {
    changeUnitOfAccountPair({
      from: { name: 'ADA', value: walletBalance?.ada || '0' },
      to: { name: unitOfAccount || 'USD', value: totalTokenPrice || '0' },
    });
  }, [walletBalance, unitOfAccount, totalTokenPrice]);

  // const amount = React.useMemo(
  //   () =>
  //     aggregatePrimaryAmount({
  //       primaryTokenInfo,
  //       tokenActivity: tokenActivity.data24h,
  //     }),
  //   [primaryTokenInfo, tokenActivity, ptPrice]
  // );

  return (
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="column">
        <Stack direction="row" spacing={theme.spacing(0.5)} alignItems="flex-end">
          {isLoading ? (
            <Skeleton width="146px" height="24px" />
          ) : (
            <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
              {String(accountPair?.from.value)}
            </Typography>
          )}
          <Typography variant="body2" fontWeight="500" color="ds.black_static" textAlign="center">
            <Typography component="span" variant="body2" fontWeight="500" color="ds.text_gray_medium">
              {accountPair?.from.name}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              fontWeight="500"
              color="ds.text_gray_low"
              onClick={handleCurrencyChange}
              sx={{
                cursor: 'pointer',
                display: 'inline',
              }}
            >
              /{accountPair?.to.name}
            </Typography>
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginTop: theme.spacing(1) }}>
          <HeaderPrice isLoading={tokenActivity === null} />
          {isLoading ? (
            <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
              <Skeleton width="47px" height="20px" />
              <Skeleton width="65px" height="20px" />
            </Stack>
          ) : (
            <Tooltip title={<Box minWidth="158px">{tooltipTitle}</Box>} placement="right">
              <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
                <PnlPercentChange variantPnl={variantPnl} changePercent={formatPriceChange(changePercent)} />
                <PnlPairedChange variantPnl={variantPnl} changeValue={formatPriceChange(changeValue, config.decimals)} />
              </Stack>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <SearchInput onChange={e => setKeyword(e.target.value)} placeholder={strings.search} />
    </Stack>
  );
};

type PnlPercentChangeProps = { variantPnl: 'danger' | 'success' | 'neutral'; changePercent: string };
export const PnlPercentChange = ({ variantPnl, changePercent }: PnlPercentChangeProps) => {
  return (
    <PnlTag variant={variantPnl} withIcon>
      <Typography variant="caption" lineHeight="16px">
        {changePercent}%
      </Typography>
    </PnlTag>
  );
};

type PnlPairedChangeProps = {
  variantPnl: 'danger' | 'success' | 'neutral';
  changeValue: string;
};
export const PnlPairedChange = ({ variantPnl, changeValue }: PnlPairedChangeProps) => {
  const { currency } = useCurrencyPairing();

  return (
    <PnlTag variant={variantPnl}>
      <Typography variant="caption" lineHeight="16px">{`${
        Number(changeValue) > 0 ? '+' : ''
      }${changeValue} ${currency}`}</Typography>
    </PnlTag>
  );
};

export default PortfolioHeader;
