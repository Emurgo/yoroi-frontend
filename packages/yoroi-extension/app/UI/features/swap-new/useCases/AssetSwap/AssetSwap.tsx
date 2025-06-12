import { Stack, styled, useTheme } from '@mui/material';
import { TopBarActions } from './TopBarActions';
import { AssetInput } from '../../common/components/AssetInput';
import { LoadingButton } from '@mui/lab';
import { DexTradeInfo } from './DexTradeInfo';
import { useModal } from '../../../../components/modals/ModalContext';
import { SelectAssetModalContent } from '../../common/components/SelectAssetModalContent';
import { SwitchAssets } from '../../common/components/SwitchAssets';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { openModal } = useModal();
  const openSelectAssetModal = (type: 'from' | 'to') => {
    openModal({
      title: `SWAP ${type === 'from' ? 'FROM' : 'TO'}`,
      content: <SelectAssetModalContent />,
      height: '624px',
      width: '612px',
    });
  };

  return (
    <Content direction="column" justifyContent="space-between" alignItems="center">
      <Stack position="relative">
        <TopBarActions />
        <Stack {...atoms.pt_lg} />
        <AssetInput type="from" assetName="ADA" onAssetSelect={() => openSelectAssetModal('from')} />
        <Stack {...atoms.pt_sm} />
        <SwitchAssets />
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
