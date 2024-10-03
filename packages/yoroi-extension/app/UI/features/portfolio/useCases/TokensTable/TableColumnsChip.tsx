import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import React from 'react';
import { useCurrencyPairing } from '../../../../context/CurrencyContext';
import tokenPng from '../../common/assets/images/token.png';
import PnlTag from '../../common/components/PlnTag';
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
    ? primaryTokenActivity.close
    : secondaryTokenActivity && secondaryTokenActivity[1].price.close;

  const tokenPriceOpen = isPrimaryToken
    ? primaryTokenActivity.open
    : secondaryTokenActivity && secondaryTokenActivity[1].price.open;

  const { changePercent, variantPnl } = priceChange(tokenPriceOpen, tokenPriceClose);

  return (
    <Box sx={{ display: 'flex' }}>
      <PnlTag variant={variantPnl} withIcon>
        <Typography fontSize="13px">
          {formatPriceChange(isPrimaryToken ? ptTokenDataInterval?.[50]?.changePercent ?? 0 : changePercent ?? 0)}%
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
              {0} {accountPair?.to.name || 'USD'}
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

  const isPrimary: boolean = token.info.policyId?.length === 0;

  const {
    ptActivity: { close: ptPrice },
  } = useCurrencyPairing();

  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price.close;
  const tokenQuantityAsBigInt = bigNumberToBigInt(token.quantity);

  const showingAda = accountPair?.from.name === 'ADA';
  const currency = accountPair?.from.name;
  const decimals = showingAda ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

  if (ptPrice == null) return `... ${currency}`;

  const totaPrice =
    ptPrice &&
    atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPrice ?? 1)
      .times(showingAda ? 1 : String(ptPrice))
      .toFormat(decimals);

  const totalTokenPrice = isPrimary && showingAda ? accountPair?.to.value : totaPrice;
  const totalTicker = isPrimary && showingAda ? accountPair?.to.name : accountPair?.from.name;

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
            {totalTokenPrice} {totalTicker || 'USD'}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export const TokenPrice = ({ secondaryToken24Activity, ptActivity, token }) => {
  const isPrimaryToken = token?.info.policyId.length === 0;
  const { accountPair, primaryTokenInfo } = usePortfolio();
  const tokenPrice = isPrimaryToken ? ptActivity.close : secondaryToken24Activity && secondaryToken24Activity[1].price.close;
  if (secondaryToken24Activity === null) return <Skeleton variant="text" width="50px" height="30px" />;

  const showingAda = accountPair?.from.name === 'ADA';
  const tokenPriceFiat = new BigNumber(tokenPrice);

  const tokenQuantityAsBigInt = bigNumberToBigInt(token.quantity);
  const decimals = showingAda ? primaryTokenInfo.decimals : token.info.numberOfDecimals;

  const totaPrice =
    ptActivity.close &&
    atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPriceFiat ?? 1)
      .times(showingAda ? 1 : String(ptActivity.close))
      .toFormat(decimals);

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {formatPriceChange(accountPair?.from.name === 'ADA' ? tokenPrice : totaPrice / Number(token.shiftedAmount))}{' '}
      {accountPair?.from.name}
    </Typography>
  );
};

export const TokenProcentage = ({ procentage }) => {
  const { showWelcomeBanner } = usePortfolio();
  if (procentage === undefined) return <Skeleton variant="text" width="50px" height="30px" />;

  return (
    <Typography variant="body2" color="ds.text_gray_medium">
      {showWelcomeBanner ? 0 : procentage}%
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
