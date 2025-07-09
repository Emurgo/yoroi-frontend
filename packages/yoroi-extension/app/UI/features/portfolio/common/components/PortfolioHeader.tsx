import { Box, IconButton, Skeleton, Stack, styled, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import React from 'react';
import LocalStorageApi from '../../../../../api/localStorage/index';
import { SearchInput, Tooltip } from '../../../../components';
import { Switch } from '../../../../components/icons/Switch';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import { WalletBalance } from '../../../../types/currrentWallet';
import { getTotalAmount } from '../../../../utils/createCurrentWalletInfo';
import { usePortfolio } from '../../module/PortfolioContextProvider';
import { usePortfolioTokenActivity } from '../../module/PortfolioTokenActivityProvider';
import { DEFAULT_FIAT_PAIR } from '../helpers/constants';
import { formatPriceChange, priceChange } from '../helpers/priceChange';
import { useStrings } from '../hooks/useStrings';
import { HeaderPrice } from './HeaderPrice';
import { HiddenAmount } from './HiddenAmount';
import PnlTag from './PlnTag';

const IconWrapper: any = styled(IconButton)(({ theme }: any) => ({
  '& svg': {
    '& path': {
      fill: theme.palette.ds.el_gray_medium,
    },
  },
}));

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
  tooltipTitle: React.ReactNode;
  stores: any;
}

const PortfolioHeader = observer(
  ({ walletBalance, setKeyword, isLoading, tooltipTitle, stores }: Props): React.ReactNode => {
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

    // TODO refactor and remove this caluclation from here in the future - this should come from the main selected wallet context
    const { wallets, delegation } = stores;
    const selectedWallet /*: WalletState */ = wallets.selectedOrFail;
    const networkId = selectedWallet.networkId;
    const rewards = delegation.getRewardBalanceOrZero(selectedWallet);
    const balance = selectedWallet.balance;
    const totalBalanceAmount = getTotalAmount(balance, rewards);
    const defaultEntry = totalBalanceAmount?.getDefaultEntry();
    const primaryBalance = defaultEntry.amount.shiftedBy(-primaryTokenInfo.decimals);
    // End of total Ada balance calculation

    const { changeValue, changePercent, variantPnl } = priceChange(open, ptPrice);

    const showADA = accountPair?.from.name === primaryTokenInfo.name;

    const totalTokenPrice = React.useMemo(() => {
      const showingAda = accountPair?.from.name !== primaryTokenInfo.name;
      const currency = showingAda ? primaryTokenInfo.ticker : unitOfAccount;

      if (ptPrice == null) return `... ${currency}`;

      const totalAmount = formatValue(primaryTokenInfo.quantity.multipliedBy(String(ptPrice)));

      return totalAmount;
    }, [tokenActivity, config.decimals, ptPrice]);

    const handleCurrencyChange = async () => {
      const pair = {
        from: {
          name: showADA ? unitOfAccount ?? DEFAULT_FIAT_PAIR : primaryTokenInfo.name,
          value: showADA ? totalTokenPrice ?? '0' : walletBalance.ada,
        },
        to: {
          name: showADA ? primaryTokenInfo.name : unitOfAccount ?? DEFAULT_FIAT_PAIR,
          value: showADA ? walletBalance.ada : totalTokenPrice,
        },
      };
      localStorageApi.setSetPortfolioFiatPair(networkId, pair);
      changeUnitOfAccountPair(pair);
    };

    React.useEffect(() => {
      const setFiatPair = async () => {
        setLoading(true);
        try {
          const portfolioStoragePair = await localStorageApi.getPortfolioFiatPair(networkId);
          const portfolioStoragePairObj = portfolioStoragePair && JSON.parse(portfolioStoragePair);
          if (portfolioStoragePairObj !== undefined) {
            changeUnitOfAccountPair({
              from: { name: portfolioStoragePairObj.from.name, value: portfolioStoragePairObj.from.value },
              to: { name: portfolioStoragePairObj.to.name, value: !showADA ? walletBalance.ada : totalTokenPrice },
            });
          } else {
            const pair = {
              from: { name: primaryTokenInfo.name, value: walletBalance?.ada || '0' },
              to: {
                name: unitOfAccount || DEFAULT_FIAT_PAIR,
                value: !showADA ? walletBalance.ada : totalTokenPrice || '0',
              },
            };
            changeUnitOfAccountPair(pair);
            localStorageApi.setSetPortfolioFiatPair(networkId, pair);
          }
        } finally {
          setLoading(false);
        }
      };

      setFiatPair();
    }, [totalTokenPrice, walletBalance, showADA, networkId]);

    if (!accountPair) {
      return <LoadingSkeleton />;
    }

    return (
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Stack direction="row" spacing={theme.spacing(4)} alignItems="flex-end">
            {isLoading ? (
              <Skeleton width="146px" height="24px" />
            ) : (
              <Typography variant="h2" fontWeight="500" color="ds.gray_cmax">
                <HiddenAmount isHidden={stores.profile.shouldHideBalance}>
                  {showADA ? Number(primaryBalance) || '0' : totalTokenPrice}
                </HiddenAmount>
              </Typography>
            )}
            <CurrencyDisplay
              from={showADA ? primaryTokenInfo.name : unitOfAccount ?? DEFAULT_FIAT_PAIR}
              handleCurrencyChange={handleCurrencyChange}
            />
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginTop: theme.spacing(8) }}>
            {loading || isLoading ? (
              <Skeleton width="64px" height="13px" />
            ) : (
              <HeaderPrice isLoading={tokenActivity === null} isHiddenAmount={stores.profile.shouldHideBalance} />
            )}
            {isLoading || loading ? (
              <Skeletons theme={theme} />
            ) : (
              <PriceChangeDisplay
                variantPnl={variantPnl}
                changePercent={changePercent}
                changeValue={changeValue}
                config={config}
                tooltipTitle={tooltipTitle}
              />
            )}
          </Stack>
        </Stack>

        <SearchInput onChange={e => setKeyword(e.target.value)} placeholder={strings.search} />
      </Stack>
    );
  }
);

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

const CurrencyDisplay = ({ from, handleCurrencyChange }) => (
  <Stack direction="row" alignItems="flex-end" gap="4px" ml="2px">
    <Typography component="span" variant="body1" fontWeight="500" color="ds.text_gray_medium">
      {from}
    </Typography>
    <IconWrapper onClick={handleCurrencyChange}>
      <Switch />
    </IconWrapper>
  </Stack>
);

const Skeletons = ({ theme }) => (
  <Stack direction="row" alignItems="center" spacing={theme.spacing(8)} sx={{ marginLeft: theme.spacing(16) }}>
    <Skeleton width="47px" height="20px" />
    <Skeleton width="65px" height="20px" />
  </Stack>
);

const PriceChangeDisplay = ({ variantPnl, changePercent, changeValue, config, tooltipTitle }) => (
  <Tooltip title={<Box minWidth="158px">{tooltipTitle}</Box>} place='right' positionStrategy="fixed">
    <Stack direction="row" alignItems="center" spacing={1}>
      <PnlPercentChange variantPnl={variantPnl} changePercent={formatPriceChange(changePercent)} />
      <PnlPairedChange variantPnl={variantPnl} changeValue={formatPriceChange(changeValue, config.decimals)} />
    </Stack>
  </Tooltip>
);

type PnlPercentChangeProps = { variantPnl: 'danger' | 'success' | 'neutral'; changePercent: string };
export const PnlPercentChange = ({ variantPnl, changePercent }: PnlPercentChangeProps) => {
  return (
    <PnlTag variant={variantPnl} withIcon>
      <Typography variant="caption" lineHeight="16px">
        {changePercent}
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
    <PnlTag variant={variantPnl} withPercentSign={false}>
      <Typography variant="caption" lineHeight="16px">{`${
        Number(changeValue) > 0 ? '+' : ''
      }${changeValue} ${currency}`}</Typography>
    </PnlTag>
  );
};

export default PortfolioHeader;
