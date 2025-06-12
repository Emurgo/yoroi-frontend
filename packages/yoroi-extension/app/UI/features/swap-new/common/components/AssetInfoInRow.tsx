import React from 'react';
import { Stack, Typography, useTheme, styled } from '@mui/material';
import BigNumber from 'bignumber.js';
import { atomicBreakdown } from '@yoroi/common';
import { Icons, IconWrapper } from '../../../../components';
import { TokenInfoIcon } from '../../../portfolio/common/components/TokenInfoIcon';
import { useModal } from '../../../../components/modals/ModalContext';
import TokenInfoModal from './Modals/TokenInfoModal';

interface AssetInfoInRowProps {
  token: any;
  currency: string;
  secondaryToken24Activity?: {
    price?: {
      close?: number | BigNumber;
    };
  };
  primaryTokenActivity?: number | string;
  primaryTokenInfo: { decimals: number };
  onAssetClick: () => void;
  direction: 'in' | 'out';
}

export const AssetInfoInRow = React.memo(
  ({
    token,
    currency,
    secondaryToken24Activity,
    primaryTokenActivity,
    primaryTokenInfo,
    onAssetClick,
    direction,
  }: AssetInfoInRowProps) => {
    const { atoms }: any = useTheme();
    const isPrimary = token.id === '-' || token.id === '';
    const tokenPrice = secondaryToken24Activity?.[1]?.price?.close ?? 1;
    const decimals = isPrimary ? primaryTokenInfo.decimals : token.decimals;
    const { openModal } = useModal();

    let totalPrice: string | undefined;

    if (direction === 'in' && primaryTokenActivity != null) {
      try {
        const quantityBigInt = bigNumberToBigInt(token.quantity);
        const activityBN = new BigNumber(primaryTokenActivity.toString());

        totalPrice = atomicBreakdown(quantityBigInt, decimals).bn.times(tokenPrice).times(activityBN).toFormat(decimals);
      } catch (err) {
        console.error('Failed to calculate totalPrice:', err);
      }
    }

    const openTokenInfo = () => {
      openModal({
        title: 'Asset details',
        content: <TokenInfoModal token={token} />,
        height: '624px',
        width: '612px',
      });
    };

    return (
      <RowWrapper direction="row" width="100%" justifyContent="space-between" alignItems="center" onClick={onAssetClick}>
        <Stack direction="row" alignItems="center" {...atoms.gap_lg}>
          <TokenInfoIcon info={{ id: token.id, policy: token?.fingerprint, name: token?.name }} size="md" />
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
          <IconWrapper
            icon={Icons.InfoCircle}
            onClick={e => {
              e.stopPropagation(); // 🔥 prevent triggering the row click
              openTokenInfo();
            }}
          />
        )}
      </RowWrapper>
    );
  }
);

function bigNumberToBigInt(bn: BigNumber): bigint {
  return BigInt(bn.toFixed(0));
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