import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import tokenPng from '../../common/assets/images/token.png';
import { HiddenAmount } from '../../common/components/HiddenAmount';
import PnlTag from '../../common/components/PlnTag';
import { DEFAULT_FIAT_PAIR, TOKEN_CHART_INTERVAL } from '../../common/helpers/constants';
import { formatPriceChange, priceChange } from '../../common/helpers/priceChange';
import { useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { usePortfolio } from '../../module/PortfolioContextProvider';

export const TokenDisplay = ({ token }: { token: TokenInfoType }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
      <Box
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        width="40px"
        height="40px"
        overflow="hidden"
        flexShrink="0"
        borderRadius="8px"
      >
        <img
          width="100%"
          src={token.info.image ?? tokenPng}
          alt={token.info.name}
          onError={e => {
            // @ts-ignore
            e.target.src = tokenPng;
          }}
        />
      </Box>
      <Stack direction="column">
        <Typography fontWeight="500" color="ds.text_gray_medium">
          {token.info.name}
        </Typography>
        <Typography variant="body2" color="ds.text_gray_low">
          {token.info.name}
        </Typography>
      </Stack>
    </Stack>
  );
};

type TokenPriceChangeChipProps = {
  secondaryTokenActivity: any;
  primaryTokenActivity: any;
  isPrimaryToken: any;
  timeInterval?: any;
};

export const TokenPriceChangeChip = ({
  secondaryTokenActivity,
  primaryTokenActivity,
  isPrimaryToken,
  timeInterval,
}: TokenPriceChangeChipProps) => {
  const { data: ptTokenDataInterval, isFetching } = useGetPortfolioTokenChart(timeInterval, { info: { id: '' } });

  const deltaPtTokenDataInterval =
    timeInterval === TOKEN_CHART_INTERVAL.WEEK
      ? ptTokenDataInterval?.[167]?.changePercent
      : ptTokenDataInterval?.[179]?.changePercent;

  if (secondaryTokenActivity === null || primaryTokenActivity === null || isFetching) {
    return <Skeleton variant="text" width="60px" height="30px" />;
  }

  const tokenPriceClose = isPrimaryToken
    ? primaryTokenActivity?.close
    : secondaryTokenActivity && secondaryTokenActivity[1].price?.close;

  const tokenPriceOpen = isPrimaryToken
    ? primaryTokenActivity?.open
    : secondaryTokenActivity && secondaryTokenActivity[1].price?.open;

  const { changePercent, variantPnl } = priceChange(tokenPriceOpen, tokenPriceClose);

  const noDataToDisplay = Number.isNaN(changePercent);

  const deltaVariantPnl =
    isPrimaryToken && timeInterval !== undefined && deltaPtTokenDataInterval
      ? deltaPtTokenDataInterval < 0
        ? 'danger'
        : deltaPtTokenDataInterval > 0
        ? 'success'
        : 'neutral'
      : variantPnl;

  if (noDataToDisplay || changePercent === undefined) {
    return (
      <Stack
        direction="row"
        sx={{ backgroundColor: 'ds.gray_100', width: '42px', borderRadius: '20px' }}
        justifyContent="center"
        gap="4px"
      >
        <Typography variant="caption" color="ds.text_gray_low">
          -
        </Typography>
        <Typography variant="caption" color="ds.text_gray_low">
          %
        </Typography>
      </Stack>
    );
  }

  const priceChangeProcent = formatPriceChange(
    isPrimaryToken && timeInterval !== undefined ? deltaPtTokenDataInterval ?? 0 : changePercent ?? 0
  );
  return (
    <Box sx={{ display: 'flex' }}>
      <PnlTag variant={deltaVariantPnl} withIcon>
        <Typography fontSize="12px">{Math.abs(Number(priceChangeProcent))}</Typography>
      </PnlTag>
    </Box>
  );
};

export const TokenPriceTotal = observer(({ token, secondaryToken24Activity, stores }) => {
  const theme = useTheme();
  const { accountPair, primaryTokenInfo, walletBalance, showWelcomeBanner } = usePortfolio();

  // TODO refactor this properly
  if (showWelcomeBanner) {
    return (
      <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
        <Stack direction="column">
          <Typography color="ds.text_gray_normal">
            {0} {token.info.name}
          </Typography>
          {token.info.name === accountPair?.from.name ? (
            <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
          ) : (
            <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
              {0} {accountPair?.to.name ?? DEFAULT_FIAT_PAIR}
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  }

  if (secondaryToken24Activity === null) {
    return (
      <Stack direction="column" alignItems="flex-end">
        <Skeleton sx={{ float: 'right' }} variant="text" width="100px" height="22px" />
        <Skeleton sx={{ float: 'right' }} variant="text" width="50px" height="22px" />
      </Stack>
    );
  }

  const isPrimary: boolean = token.id === '-';

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price?.close;
  const tokenQuantityAsBigInt = bigNumberToBigInt(token.quantity);

  const showingAda = accountPair?.from.name === primaryTokenInfo.name;
  const currency = accountPair?.from.name;
  const decimals = isPrimary ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

  if (ptPrice === null) return `... ${currency}`;

  const totalPrice =
    ptPrice &&
    atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPrice ?? 1)
      .times(showingAda ? 1 : new BigNumber(ptPrice))
      .toFormat(decimals);

  const primaryAda = isPrimary && showingAda;

  const totalTicker = primaryAda ? accountPair?.to.name : accountPair?.from.name;
  const totalTokenPrice = primaryAda ? '' : `${isPrimary || tokenPrice !== undefined ? totalPrice : '-'}`;

  return (
    <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
      <Stack direction="column">
        <Typography columnGap="3px" color="ds.text_gray_medium" sx={{ display: 'flex' }}>
          <HiddenAmount isHidden={stores.profile.shouldHideBalance}>
            <Typography mr="4px">{isPrimary ? walletBalance?.ada : token.formatedAmount}</Typography>
          </HiddenAmount>
          <Typography>{token.info.name}</Typography>
        </Typography>
        {token.info.name === accountPair?.from.name ? (
          <Typography variant="body2" color="ds.text_gray_low" sx={{ textAlign: 'right' }}></Typography>
        ) : (
          <Typography variant="body2" color="ds.text_gray_low" sx={{ textAlign: 'right' }}>
            <HiddenAmount isHidden={stores.profile.shouldHideBalance}>{totalTokenPrice}</HiddenAmount>
            <span>&nbsp;{totalTicker ?? DEFAULT_FIAT_PAIR}</span>
          </Typography>
        )}
      </Stack>
    </Stack>
  );
});

export const TokenPrice = ({ secondaryToken24Activity, ptActivity, token }) => {
  const { unitOfAccount } = usePortfolio();
  const isPrimaryToken = token.id === '-';
  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price?.close;
  const ptPrice = ptActivity?.close;
  const ptUnitPrice = tokenPrice * ptPrice;
  const priceDisplay = parseFloat(isPrimaryToken ? ptPrice : ptUnitPrice).toFixed(4);

  const noDataToDisplay = priceDisplay === 'NaN';

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {noDataToDisplay ? '-' : `${priceDisplay} ${unitOfAccount}`}
    </Typography>
  );
};

export const TokenProcentage = ({ procentage }) => {
  const { showWelcomeBanner } = usePortfolio();
  if (procentage === undefined) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {showWelcomeBanner ? 0 : parseFloat(procentage).toFixed(2)}%
    </Typography>
  );
};

export function bigNumberToBigInt(bn: BigNumber): bigint {
  // Convert BigNumber to a string representation of a whole number
  const wholeNumberString = bn.toFixed(0); // 0 means no decimals

  // Convert the string to BigInt
  const bigIntValue = BigInt(wholeNumberString);

  return bigIntValue;
}
