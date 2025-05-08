import { Stack, styled, Typography, useTheme } from '@mui/material';
import React from 'react';
import { TopBarActions } from './TopBarActions';
import { AssetInput } from '../../common/components/AssetInput';
import { LoadingButton } from '@mui/lab';
import { DexTradeInfo } from './DexTradeInfo';
import { useModal } from '../../../../components/modals/ModalContext';
import { SelectAssetModalContent } from '../../common/components/SelectAssetModalContent';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { openModal } = useModal();
  const openSelectAssetModal = (type: 'from' | 'to') => {
    console.log('openSelectAssetModal type', type);
    openModal({
      title: `SWAP ${type === 'from' ? 'FROM' : 'TO'}`,
      content: <SelectAssetModalContent />,
      height: '624px',
      width: '612px',
    });
  };

  return (
    <Content direction="column" justifyContent="space-between" alignItems="center">
      <Stack>
        <TopBarActions />
        <Stack {...atoms.pt_lg} />
        <AssetInput type="from" assetName="ADA" onAssetSelect={() => openSelectAssetModal('from')} />
        <Stack {...atoms.pt_lg} />
        <AssetInput type="to" assetName="ADA" onAssetSelect={() => openSelectAssetModal('to')} />
        <Stack {...atoms.pt_lg} />
        <DexTradeInfo />
      </Stack>
      <LoadingButton
        //  @ts-ignore
        variant="primary"
      >
        Swap
      </LoadingButton>
    </Content>
  );
};

const Content = styled(Stack)(({ theme }: any) => ({
  ...theme.atoms.pt_xl,
  width: '503px',
  margin: '0 auto',
  height: '100%',
}));
