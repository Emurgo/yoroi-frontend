import { Stack, Typography, useTheme, styled } from '@mui/material';
import React from 'react';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';

export const AssetInfoInRow = ({
  asset,
  currency,
  secondaryToken24Activity,
  primaryTokenActivity,
  primaryTokenInfo,
  onAssetClick,
}) => {
  const { atoms }: any = useTheme();
  const isPrimary: boolean = asset.id === '-';

  const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price?.close;
  const tokenQuantityAsBigInt = bigNumberToBigInt(asset.quantity);
  const decimals = isPrimary ? primaryTokenInfo.decimals : asset.info.numberOfDecimals;

  const totalPrice =
    primaryTokenActivity &&
    atomicBreakdown(tokenQuantityAsBigInt, decimals)
      .bn.times(tokenPrice ?? 1)
      .times(new BigNumber(primaryTokenActivity))
      .toFormat(decimals);

  return (
    <RowWrapper direction="row" width="100%" justifyContent="space-between" alignItems="center" onClick={onAssetClick}>
      <Stack direction="row" alignItems="center" {...atoms.gap_lg}>
        <TokenIcon large image={asset.info.image} />
        <Stack direction="column" justifyContent="space-between">
          <Typography variant="body1" color="ds.text_gray_medium">
            {asset.info.name}
          </Typography>
          <Typography variant="body2" color="ds.text_gray_low">
            {asset.info.name}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="flex-end">
        <Typography variant="body1" color="ds.text_gray_medium">
          {asset.formatedAmount} {asset.info.name}
        </Typography>
        <Typography variant="body2" color="ds.text_gray_low">
          {totalPrice} {currency}
        </Typography>
      </Stack>
    </RowWrapper>
  );
};

export function bigNumberToBigInt(bn: BigNumber): bigint {
  const wholeNumberString = bn.toFixed(0); // 0 means no decimals
  const bigIntValue = BigInt(wholeNumberString);

  return bigIntValue;
}

const RowWrapper = styled(Stack)(({ theme }: any) => ({
  cursor: 'pointer',
  ...theme.atoms.py_md,
  ...theme.atoms.px_sm,
  borderRadius: '12px',
  '&:hover': {
    backgroundColor: theme.palette.ds.bg_color_contrast_min,
  },
}));
