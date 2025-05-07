import { Stack, styled, useTheme } from '@mui/material';
import React from 'react';
import { TopBarActions } from './TopBarActions';
import { AssetInput } from '../../common/components/AssetInput';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  return (
    <Content direction="column">
      <TopBarActions />
      <Stack {...atoms.pt_lg} />
      <AssetInput type="from" assetName="ADA" />
      <Stack {...atoms.pt_lg} />
      <AssetInput type="to" assetName="ADA" />
    </Content>
  );
};

const Content = styled(Stack)(({ theme }: any) => ({
  ...theme.atoms.pt_xl,
  width: '503px',
  margin: '0 auto',
}));
