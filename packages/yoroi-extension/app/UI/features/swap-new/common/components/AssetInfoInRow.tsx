import { Stack, Typography, useTheme, styled, Icon } from '@mui/material';
import React from 'react';
import { TokenIcon } from './TokenIcon/TokenIcon';
import { atomicBreakdown } from '@yoroi/common';
import BigNumber from 'bignumber.js';
import { Icons, IconWrapper } from '../../../../components';

export const AssetInfoInRow = React.memo(
  ({ token, currency, secondaryToken24Activity, primaryTokenActivity, primaryTokenInfo, onAssetClick, direction }: any) => {
    const { atoms }: any = useTheme();
    const isPrimary: boolean = token.id === '-';

    const tokenPrice = secondaryToken24Activity && secondaryToken24Activity[1].price?.close;
    const tokenQuantityAsBigInt = direction === 'in' && bigNumberToBigInt(token.quantity);
    const decimals = isPrimary ? primaryTokenInfo.decimals : token.decimals;

    const totalPrice =
      direction === 'in' && primaryTokenActivity && typeof tokenQuantityAsBigInt === 'bigint'
        ? atomicBreakdown(tokenQuantityAsBigInt, decimals)
            .bn.times(tokenPrice ?? 1)
            .times(new BigNumber(primaryTokenActivity))
            .toFormat(decimals)
        : undefined;

    return (
      <RowWrapper direction="row" width="100%" justifyContent="space-between" alignItems="center" onClick={onAssetClick}>
        <Stack direction="row" alignItems="center" {...atoms.gap_lg}>
          {/* <TokenIcon large tokenId={token.id} /> */}
          <Stack direction="column" justifyContent="space-between">
            <Typography variant="body1" color="ds.text_gray_medium">
              {token.name}
            </Typography>
            <Typography variant="body2" color="ds.text_gray_low">
              {direction === 'in' ? token.name : token.fingerprint}
            </Typography>
          </Stack>
        </Stack>
        {direction === 'in' ? (
          <Stack direction="column" alignItems="flex-end">
            <Typography variant="body1" color="ds.text_gray_medium">
              {token.formatedAmount} {token.name}
            </Typography>
            <Typography variant="body2" color="ds.text_gray_low">
              {totalPrice} {currency}
            </Typography>
          </Stack>
        ) : (
          <IconWrapper icon={Icons.InfoCircle} />
        )}
      </RowWrapper>
    );
  }
);

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
