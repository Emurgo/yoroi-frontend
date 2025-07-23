import { Stack, styled, useTheme } from '@mui/material';
import { TopBarActions } from './TopBarActions';
import { AssetInput } from '../../common/components/AssetInput';
import { LoadingButton } from '@mui/lab';
import { EstimateSummary } from './EstimateSummary';
import { useModal } from '../../../../components/modals/ModalContext';
import { SelectAssetFrom } from '../../common/components/Modals/SelectAssetFrom';
import { SwitchAssets } from '../../common/components/SwitchAssets';
import { SelectAssetTo } from '../../common/components/Modals/SelectAssetTo';
import { AssetDirectionType } from '../../common/types';
import { ASSET_DIRECTION_IN, ASSET_DIRECTION_OUT } from '../../common/constants';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { openModal } = useModal();

  const openSelectAssetModal = (direction: AssetDirectionType) => {
    openModal({
      title: `SWAP ${direction === ASSET_DIRECTION_IN ? 'FROM' : 'TO'}`,
      content: direction === ASSET_DIRECTION_IN ? <SelectAssetFrom /> : <SelectAssetTo />,
      height: '624px',
      width: '612px',
    });
  };

  return (
    <Content direction="column" justifyContent="space-between" alignItems="center">
      <Stack position="relative">
        <TopBarActions />
        <Stack {...atoms.pt_lg} />
        <AssetInput direction={ASSET_DIRECTION_IN} onAssetSelect={() => openSelectAssetModal(ASSET_DIRECTION_IN)} />
        <Stack {...atoms.pt_sm} />
        <SwitchAssets />
        <AssetInput direction={ASSET_DIRECTION_OUT} onAssetSelect={() => openSelectAssetModal(ASSET_DIRECTION_OUT)} />
        <Stack {...atoms.pt_lg} />
        <EstimateSummary />
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