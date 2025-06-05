import { Stack, styled, useTheme } from '@mui/material';
import { TopBarActions } from './TopBarActions';
import { AssetInput } from '../../common/components/AssetInput';
import { LoadingButton } from '@mui/lab';
import { DexTradeInfo } from './DexTradeInfo';
import { useModal } from '../../../../components/modals/ModalContext';
import { SelectAssetFrom } from '../../common/components/Modals/SelectAssetFrom';
import { SwitchAssets } from '../../common/components/SwitchAssets';
import { SelectAssetTo } from '../../common/components/Modals/SelectAssetTo';
import { useSwapRevamp } from '../../module/SwapContextProvider';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { openModal } = useModal();
  const { primaryTokenInfo, loadingSwapPage } = useSwapRevamp();

  const openSelectAssetModal = (direction: 'in' | 'out') => {
    openModal({
      title: `SWAP ${direction === 'in' ? 'FROM' : 'TO'}`,
      content: direction === 'in' ? <SelectAssetFrom /> : <SelectAssetTo />,
      height: '624px',
      width: '612px',
    });
  };

  // if (loadingSwapPage) {
  //   return (
  //     <Stack height="100%" width="100%" justifyContent="center" alignItems="center">
  //       Loading...
  //     </Stack>
  //   );
  // }

  return (
    <Content direction="column" justifyContent="space-between" alignItems="center">
      <Stack position="relative">
        <TopBarActions />
        <Stack {...atoms.pt_lg} />
        <AssetInput direction="in" onAssetSelect={() => openSelectAssetModal('in')} />
        <Stack {...atoms.pt_sm} />
        <SwitchAssets />
        <AssetInput direction="out" onAssetSelect={() => openSelectAssetModal('out')} />
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
}

const Content = styled(Stack)(({ theme }: any) => ({
  ...theme.atoms.pt_xl,
  width: '503px',
  margin: '0 auto',
  height: '100%',
}));
