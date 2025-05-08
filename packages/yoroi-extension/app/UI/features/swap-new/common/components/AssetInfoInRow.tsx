import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Icons, IconWrapper } from '../../../../components';

export const AssetInfoInRow = () => {
  const { atoms }: any = useTheme();
  return (
    <Stack direction="row" width="100%" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" {...atoms.gap_lg}>
        <IconWrapper icon={Icons.NftAsset} width="48px" height="48px" />
        <Stack direction="column" justifyContent="space-between">
          <Typography variant="body1" color="ds.text_gray_medium">
            ADA
          </Typography>
          <Typography variant="body2" color="ds.text_gray_low">
            Cardano
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="flex-end">
        <Typography variant="body1" color="ds.text_gray_medium">
          2,3343.34343 ADA
        </Typography>
        <Typography variant="body2" color="ds.text_gray_low">
          2.23.2323 USD
        </Typography>
      </Stack>
    </Stack>
  );
};
