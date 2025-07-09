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
import { useSwapRevamp } from '../../module/SwapContextProvider';
import { useEffect } from 'react';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { getCborTxBody } from '../../../transaction-review/common/hooks/usetxBody';
import { ErrorMessage } from '../../common/components/ErrorMessage';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { createOrder, swapForm, tokenInfos, stores } = useSwapRevamp();
  const { openModal } = useModal();
  const { openTxReviewModal } = useTxReviewModal();
  const wallet = stores.wallets.selectedOrFail;

  const openSelectAssetModal = (direction: AssetDirectionType) => {
    openModal({
      title: `SWAP ${direction === ASSET_DIRECTION_IN ? 'FROM' : 'TO'}`,
      content: direction === ASSET_DIRECTION_IN ? <SelectAssetFrom /> : <SelectAssetTo />,
      height: '624px',
      width: '612px',
    });
  };

  const handleSubmitTransaction = async password => {
    console.log('handleSubmitTransaction', { swapForm, password });
    const parsedCbor = await getCborTxBody(swapForm.createTx.cbor);
    console.log('parsedCbor', parsedCbor);
    const unisgnedTxRequest = await stores.substores.ada.swapStore.createRevampUnsignedSwapTx({
      wallet,
      swapState: swapForm,
      tokenInfos,
      parsedCbor,
    });

    console.log('unisgnedTxRequest', unisgnedTxRequest);

    // try {
    //   await stores.transactionProcessingStore.adaSendAndRefresh({
    //     wallet,
    //     signRequest: parsedCbor,
    //     password,
    //     callback: () => stores.wallets.refreshWalletFromRemote(wallet.publicDeriverId),
    //   });
    //   console.log('Transaction submitted successfully');
    // } catch (e) {
    //   console.error('Error submitting transaction:', e);
    // } finally {
    // }
  };

  useEffect(() => {
    if (swapForm.createTx?.cbor) {
      openTxReviewModal({
        modalView: 'transactionReview',
        submitTx: passswordInput => {
          console.log('PASSWARDSUBMIT', passswordInput);
          handleSubmitTransaction(passswordInput);
        },
        cborTx: swapForm.createTx.cbor,
        // extraOverviewDetails: {
        //   title: 'Cancel swap order details',
        //   onClick: () => changeModalView({ modalView: 'extraDetails' }),
        //   component: (
        //     <SwapTxCancelInfo
        //       formattedFeeValue={formattedFeeValue}
        //       defaultTokenInfo={defaultTokenInfo}
        //       order={order}
        //       returnValues={totalCancelOutput}
        //       swapPoolLabel={<SwapPoolLabel provider={order.provider} />}
        //     />
        //   ),
        // },
      });
    }
  }, [swapForm.createTx]);

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
        <ErrorMessage />
        <EstimateSummary />
      </Stack>
      <LoadingButton
        //  @ts-ignore
        variant="primary"
        onClick={createOrder}
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