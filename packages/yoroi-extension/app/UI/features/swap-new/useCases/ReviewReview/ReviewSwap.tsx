import { Button, Stack, Typography, styled, useTheme } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useEffect } from 'react';
import { PriceImpactBanner } from './PriceImpactBanner';
import { EstimateSummary } from '../AssetSwap/EstimateSummary';
import { AssetSummary } from '../../common/components/AssetSummary';
import { useTxReviewModal } from '../../../transaction-review/module/ReviewTxProvider';
import { SwapActionType, useSwapRevamp } from '../../module/SwapContextProvider';
import { TransactionResult } from '../../../transaction-review/common/types';
import { captureEvent } from '../../../../../../posthog';
import { useNavigateTo } from '../../common/hooks/useNavigateTo';
import { useStrings } from '../../common/hooks/useStrings';
import { ASSET_DIRECTION_OUT } from '../../common/constants';

type ReviewSwapProps = {
  stores: any;
};

const ReviewSwap = ({ stores }: ReviewSwapProps) => {
  const { swapForm } = useSwapRevamp();
  const wallet = stores.wallets.selectedOrFail;
  const strings = useStrings();
  const navigateTo = useNavigateTo();
  const { palette }: any = useTheme();
  const { openTxReviewModal, closeTxReviewModal, showTxResultModal } = useTxReviewModal();

  const tokenInInfo = swapForm['tokenInInput'];
  const tokenOutInfo = swapForm['tokenOutInput'];

  useEffect(() => {
    captureEvent('Swap Review Page Viewed');
  }, []);

  useEffect(() => {
    if (swapForm.createTx?.cbor === undefined) {
      navigateTo.swapAssets();
    }
  }, [swapForm.createTx?.cbor]);

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
      closeTxReviewModal();
    }
  };

  const openTxReview = () => {
    if (swapForm.createTx?.cbor && swapForm.reviewSwapSelected === false) {
      openTxReviewModal({
        modalView: 'transactionReview',
        submitTx: passswordInput => {
          handleSubmitTransaction(passswordInput);
        },
        cborTx: swapForm.createTx.cbor,
        operations: {
          kind: 'swap',
          aggregator: swapForm.createTx.aggregator,
        },
      });
    }
  };

  return (
    <Content direction="column">
      <ScrollArea>
        <PriceImpactBanner />

        <Typography variant="body1" mb={12}>
          {strings.swapFromLabel}
        </Typography>
        <AssetSummary tokenId={tokenInInfo.tokenId} value={tokenInInfo.value} />

        <Stack pb={20} />

        <Typography variant="body1" mb={12}>
          {strings.swapToLabel}
        </Typography>
        <AssetSummary tokenId={tokenOutInfo.tokenId} value={tokenOutInfo.value} direction={ASSET_DIRECTION_OUT} />

        <Stack pb={24} mb={24} borderBottom={`1px solid ${palette.ds.gray_200}`} />

        <Stack>
          <Typography fontWeight={500}>{strings.swapDetails}</Typography>
          <EstimateSummary showPriceImpact />
        </Stack>
      </ScrollArea>

      {/* Fixed bottom buttons */}
      <Footer direction="row" justifyContent="center" spacing={24}>
        <Button
          //  @ts-ignore
          variant="secondary"
          onClick={() => {
            swapForm.action({ type: SwapActionType.SwapReviewSelected, value: true });
            navigateTo.swapAssets();
          }}
        >
          {strings.backLabel}
        </Button>

        {/* @ts-ignore */}
        <LoadingButton variant="primary" onClick={openTxReview}>
          {strings.confirmLabel}
        </LoadingButton>
      </Footer>
    </Content>
  );
};

export default ReviewSwap;

const Content = styled(Stack)(({ theme }: any) => ({
  ...theme.atoms.pt_xl,
  width: '503px',
  margin: '0 auto',
  height: '100%',
  maxHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ScrollArea = styled(Stack)(() => ({
  flex: 1,
  overflowY: 'auto',
  paddingBottom: '24px',
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
}));

/**
 * Fixed footer bar with buttons
 */
const Footer = styled(Stack)(({ theme }: any) => ({
  paddingTop: '24px',
  borderTop: `1px solid ${theme.palette?.ds?.gray_200}`,
  backgroundColor: theme.palette.background.paper,
}));
