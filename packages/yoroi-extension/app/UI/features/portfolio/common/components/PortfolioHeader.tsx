import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';
import LocalStorageApi from '../../../../../api/localStorage/index';
import { SearchInput, Tooltip } from '../../../../components';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import { WalletBalance } from '../../../../types/currrentWallet';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';
import { DEFAULT_FIAT_PAIR } from '../helpers/constants';
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
  const [loading, setLoading] = React.useState(false);
  const strings = useStrings();
  const theme: any = useTheme();
  const { unitOfAccount, changeUnitOfAccountPair, accountPair, primaryTokenInfo } = usePortfolio();
  const { tokenActivity } = usePortfolioTokenActivity();
  const localStorageApi = new LocalStorageApi();

  const {
    ptActivity: { open, close: ptPrice },
    config,
  } = useCurrencyPairing();

  const { changeValue, changePercent, variantPnl } = priceChange(open, ptPrice);

  const showADA = accountPair?.from.name === 'ADA';

  const totalTokenPrice = React.useMemo(() => {
    const showingAda = accountPair?.from.name !== 'ADA';
    const currency = showingAda ? primaryTokenInfo.ticker : unitOfAccount;

    if (ptPrice == null) return `... ${currency}`;

    const totalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptPrice)));

    return totalAmount;
  }, [tokenActivity, config.decimals, ptPrice]);

  const handleCurrencyChange = async () => {
    const pair = {
      from: {
        name: showADA ? unitOfAccount ?? DEFAULT_FIAT_PAIR : 'ADA',
        value: showADA ? totalTokenPrice ?? '0' : walletBalance.ada,
      },
      to: { name: showADA ? 'ADA' : unitOfAccount ?? DEFAULT_FIAT_PAIR, value: showADA ? walletBalance.ada : totalTokenPrice },
    };
    localStorageApi.setSetPortfolioFiatPair(pair);
    changeUnitOfAccountPair(pair);
  };

  React.useEffect(() => {
    const setFiatPair = async () => {
      setLoading(true);
      const portfolioStoragePair = await localStorageApi.getPortfolioFiatPair();
      const portfolioStoragePairObj = portfolioStoragePair && JSON.parse(portfolioStoragePair);

      const pair = {
        from: { name: 'ADA', value: walletBalance?.ada || '0' },
        to: { name: unitOfAccount || DEFAULT_FIAT_PAIR, value: !showADA ? walletBalance.ada : totalTokenPrice || '0' },
      };

      if (portfolioStoragePairObj !== undefined) {
        changeUnitOfAccountPair({
          from: { name: portfolioStoragePairObj.from.name, value: portfolioStoragePairObj.from.value },
          to: { name: portfolioStoragePairObj.to.name, value: !showADA ? walletBalance.ada : totalTokenPrice },
        });
      } else {
        changeUnitOfAccountPair(pair);
        localStorageApi.setSetPortfolioFiatPair(pair);
      }
      setLoading(false);
    };

    setFiatPair();
  }, [totalTokenPrice, walletBalance, showADA]);

  if (!accountPair) {
    return <LoadingSkeleton />;
  }

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
          <CurrencyDisplay
            from={accountPair?.from?.name}
            to={accountPair?.to?.name}
            handleCurrencyChange={handleCurrencyChange}
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginTop: theme.spacing(1) }}>
          {loading || isLoading ? <Skeleton width="64px" height="13px" /> : <HeaderPrice isLoading={tokenActivity === null} />}
          {isLoading || loading ? (
            <Skeletons theme={theme} />
          ) : (
            <Tooltip title={<Box minWidth="158px">{tooltipTitle}</Box>} placement="right">
              <PriceChangeDisplay
                variantPnl={variantPnl}
                changePercent={changePercent}
                changeValue={changeValue}
                config={config}
              />
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <SearchInput onChange={e => setKeyword(e.target.value)} placeholder={strings.search} />
    </Stack>
  );
};

const LoadingSkeleton = () => (
  <Stack direction="column">
    <Stack direction="row" alignItems="flex-end" gap="2px">
      <Skeleton width="62px" height="32px" />
      <Skeleton width="48px" height="24px" />
    </Stack>
    <Stack direction="row" alignItems="flex-end">
      <Skeleton width="69px" height="24px" sx={{ marginRight: '8px' }} />
      <Skeleton width="35px" height="16px" sx={{ backgroundColor: 'ds.gray_100', borderRadius: '8px', marginRight: '4px' }} />
      <Skeleton width="65px" height="16px" sx={{ backgroundColor: 'ds.gray_100', borderRadius: '8px' }} />
    </Stack>
  </Stack>
);

const CurrencyDisplay = ({ from, to, handleCurrencyChange }) => (
  <Typography variant="body2" fontWeight="500" color="ds.black_static" textAlign="center">
    <Typography component="span" variant="body2" fontWeight="500" color="ds.text_gray_medium">
      {from}
    </Typography>
    <Typography
      component="span"
      variant="body2"
      fontWeight="500"
      color="ds.text_gray_low"
      onClick={handleCurrencyChange}
      sx={{ cursor: 'pointer', display: 'inline' }}
    >
      /{to}
    </Typography>
  </Typography>
);

const Skeletons = ({ theme }) => (
  <Stack direction="row" alignItems="center" spacing={theme.spacing(1)} sx={{ marginLeft: theme.spacing(2) }}>
    <Skeleton width="47px" height="20px" />
    <Skeleton width="65px" height="20px" />
  </Stack>
);

const PriceChangeDisplay = ({ variantPnl, changePercent, changeValue, config }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <PnlPercentChange variantPnl={variantPnl} changePercent={formatPriceChange(changePercent)} />
    <PnlPairedChange variantPnl={variantPnl} changeValue={formatPriceChange(changeValue, config.decimals)} />
  </Stack>
);

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
