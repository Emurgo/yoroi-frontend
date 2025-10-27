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
import { ASSET_DIRECTION_IN, ASSET_DIRECTION_OUT, MARKET_ORDER } from '../../common/constants';
import { SwapActionType, useSwapRevamp } from '../../module/SwapContextProvider';
import { useEffect } from 'react';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { ErrorMessage } from '../../common/components/ErrorMessage';
import { TransactionResult } from '../../../transaction-review/common/types';
import { LimitInput } from '../../common/components/LimitInput';
import { useStrings } from '../../common/hooks/useStrings';
import { DisclaimerDialog } from '../../common/components/Modals/DisclaimerDialog';

export const AssetSwap = () => {
  const { atoms }: any = useTheme();
  const { createOrder, swapForm, isCreateOrderLoading, stores } = useSwapRevamp();
  const { openModal } = useModal();
  const strings = useStrings();
  const { openTxReviewModal, closeTxReviewModal, showTxResultModal } = useTxReviewModal();
  const wallet = stores.wallets.selectedOrFail;

  const openSelectAssetModal = (direction: AssetDirectionType) => {
    openModal({
      title: `SWAP ${direction === ASSET_DIRECTION_IN ? 'FROM' : 'TO'}`,
      content: direction === ASSET_DIRECTION_IN ? <SelectAssetFrom /> : <SelectAssetTo />,
      height: '624px',
      width: '612px',
    });
  };
  // @ts-ignore
  const handleSubmitTransaction = async password => {
    // @ts-ignore
    const unisgnedTxRequest = await stores.substores.ada.swapStore.createRevampUnsignedSwapTx({
      wallet,
      swapState: swapForm,
    });

    try {
      await stores.transactionProcessingStore.adaSendAndRefresh({
        wallet,
        signRequest: unisgnedTxRequest,
        password,
        callback: () => stores.wallets.refreshWalletFromRemote(wallet.publicDeriverId),
      });
      showTxResultModal(TransactionResult.SUCCESS);
    } catch (e) {
      showTxResultModal(TransactionResult.FAIL);
    } finally {
      swapForm.action({ type: SwapActionType.ResetForm });
      closeTxReviewModal();
    }
  };

  useEffect(() => {
    if (swapForm.createTx?.cbor) {
      openTxReviewModal({
        modalView: 'transactionReview',
        submitTx: passswordInput => {
          handleSubmitTransaction(passswordInput);
        },
        cborTx: swapForm.createTx.cbor,
      });
    }
  }, [swapForm.createTx]);

  return (
    <Content direction="column" justifyContent="space-between" alignItems="center">
      <DisclaimerDialog />
      <Stack>
        <TopBarActions />
        <Stack {...atoms.pt_lg} />
        <AssetInput direction={ASSET_DIRECTION_IN} onAssetSelect={() => openSelectAssetModal(ASSET_DIRECTION_IN)} />
        <Stack {...atoms.pt_sm} />
        <SwitchAssets />
        <AssetInput direction={ASSET_DIRECTION_OUT} onAssetSelect={() => openSelectAssetModal(ASSET_DIRECTION_OUT)} />
        <Stack {...atoms.pt_lg} />
        <ErrorMessage />
        <LimitInput />
        <EstimateSummary />
      </Stack>
      <LoadingButton
        //  @ts-ignore
        variant="primary"
        onClick={() => {
          createOrder();
        }}
        disabled={!swapForm.canSwap}
        loading={isCreateOrderLoading}
      >
        {swapForm.orderType === MARKET_ORDER ? strings.swapLabel : strings.placeOrder}
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
