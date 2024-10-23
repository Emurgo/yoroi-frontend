import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import React from 'react';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import tokenPng from '../../common/assets/images/token.png';
import PnlTag from '../../common/components/PlnTag';
import { DEFAULT_FIAT_PAIR } from '../../common/helpers/constants';
import { formatPriceChange, priceChange } from '../../common/helpers/priceChange';
import { useGetPortfolioTokenChart } from '../../common/hooks/usePortfolioTokenChart';
import { usePortfolio } from '../../module/PortfolioContextProvider';

export const TokenDisplay = ({ token }: { token: TokenInfoType }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={theme.spacing(2)}>
      <Box
        width="40px"
        height="40px"
        sx={{
          borderRadius: `${theme.shape.borderRadius}px`,
        }}
        component="img"
        src={token.info.image || tokenPng}
      ></Box>
      <Stack direction="column">
        <Typography fontWeight="500" color="ds.text_gray_normal">
          {token.info.name}
        </Typography>
        <Typography variant="body2" color="ds.text_gray_medium">
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

  return (
    <Box sx={{ display: 'flex' }}>
      <PnlTag variant={variantPnl} withIcon>
        <Typography fontSize="13px">
          {formatPriceChange(
            isPrimaryToken && timeInterval !== undefined ? ptTokenDataInterval?.[50]?.changePercent ?? 0 : changePercent ?? 0
          )}
          %
        </Typography>
      </PnlTag>
    </Box>
  );
};

export const TokenPriceTotal = ({ token, secondaryToken24Activity }) => {
  const theme = useTheme();
  const { accountPair, primaryTokenInfo, walletBalance, showWelcomeBanner } = usePortfolio();

  // TODO refactor this properly
  if (showWelcomeBanner) {
    return (
      <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
        <Stack direction="column">
          <Typography color="ds.text_gray_normal">
            {0} {token.name}
          </Typography>
          {token.name === accountPair?.to.name ? (
            <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
          ) : (
            <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
              {0} {accountPair?.to.name || DEFAULT_FIAT_PAIR}
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

  const showingAda = accountPair?.from.name === 'ADA';
  const currency = accountPair?.from.name;
  const decimals = isPrimary ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

  if (ptPrice === null) return `... ${currency}`;

  const totaPrice =
    ptPrice &&
    atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPrice ?? 1)
      .times(showingAda ? 1 : new BigNumber(ptPrice))
      .toFormat(decimals);

  // if (token.info.name === 'SHIBA') {
  //   console.log('Token CALC DETAILS', {
  //     ptPrice,
  //     tokenQuantityAsBigInt,
  //     tokenPrice,
  //     name: token.info.name,
  //     decimals,
  //     confff: config.decimals,
  //     showingAda,
  //   });

  //   console.log('totaPrice', totaPrice);
  // }
  const totalTicker = isPrimary && showingAda ? accountPair?.to.name : accountPair?.from.name;
  const totalTokenPrice = isPrimary && showingAda ? '' : `${totaPrice} ${totalTicker || DEFAULT_FIAT_PAIR}`;

  return (
    <Stack direction="row" spacing={theme.spacing(1.5)} sx={{ float: 'right' }}>
      <Stack direction="column">
        <Typography color="ds.text_gray_normal">
          {isPrimary ? walletBalance?.ada : token.formatedAmount} {token.info.name}
        </Typography>
        {token.name === accountPair?.to.name ? (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}></Typography>
        ) : (
          <Typography variant="body2" color="ds.text_gray_medium" sx={{ textAlign: 'right' }}>
            {totalTokenPrice}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export const TokenPrice = ({ secondaryToken24Activity, ptActivity, token }) => {
  const { unitOfAccount } = usePortfolio();
  const isPrimaryToken = token.id === '-';
  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price?.close;
  const ptPrice = ptActivity?.close;
  const ptUnitPrice = tokenPrice * ptPrice;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {parseFloat(isPrimaryToken ? ptPrice : ptUnitPrice).toFixed(4)} {unitOfAccount}
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
