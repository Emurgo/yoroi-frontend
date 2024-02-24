// @flow
import type { Node } from 'react';
import {
  // useEffect,
  useState,
} from 'react';
import { Box, Button } from '@mui/material';
// import { useSwap, useSwapTokensOnlyVerified } from '@yoroi/swap';
import SwapForm from './SwapForm';
import SwapConfirmationStep from './ConfirmationStep';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderDialog from '../../../components/swap/LimitOrderDialog';
import { SwapFormProvider } from '../context/swap-form';

export default function SwapPage(): Node {
  const [step, setStep] = useState(0);
  const [openedDialog, setOpenedDialog] = useState('');

  // state data
  // const wallet = useSelectedWallet();
  // const {
  //   aggregatorTokenId,
  //   lpTokenHeldChanged,
  //   frontendFeeTiers,
  //   frontendFeeTiersChanged,
  //   sellTokenInfoChanged,
  //   primaryTokenInfoChanged,
  // } = useSwap();
  // // const lpTokenHeld = useBalance({ wallet, tokenId: aggregatorTokenId });

  // // initialize sell with / and primary token
  // useEffect(() => {
  //   const ptInfo = {
  //     decimals: wallet.primaryTokenInfo.decimals ?? 0,
  //     id: wallet.primaryTokenInfo.id,
  //   };
  //   sellTokenInfoChanged(ptInfo);
  //   primaryTokenInfoChanged(ptInfo);
  // }, [
  //   primaryTokenInfoChanged,
  //   sellTokenInfoChanged,
  //   wallet.primaryTokenInfo.decimals,
  //   wallet.primaryTokenInfo.id,
  // ]);

  // // update the fee tiers
  // useEffect(() => {
  //   frontendFeeTiersChanged(frontendFeeTiers);
  // }, [frontendFeeTiers, frontendFeeTiersChanged]);

  // // update lp token balance
  // useEffect(() => {
  //   if (aggregatorTokenId == null) return;

  //   lpTokenHeldChanged({
  //     tokenId: aggregatorTokenId,
  //     quantity: lpTokenHeld,
  //   });
  // }, [aggregatorTokenId, lpTokenHeld, lpTokenHeldChanged]);

  // // pre load swap tokens
  // const { refetch } = useSwapTokensOnlyVerified({ suspense: false, enabled: false });
  // useEffect(() => {
  //   refetch();
  // }, [refetch]);

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line no-unused-vars
  const [isSuccessful, setIsSuccessful] = useState(false);

  const handleNextStep = () => setStep(s => s + 1);

  // <TODO:CHECK_LINT>
  // eslint-disable-next-line no-unused-vars
  const handlePrevStep = () => setStep(s => s - 1);

  const handleOpenedDialog = dialog => setOpenedDialog(dialog);

  return (
    <SwapFormProvider>
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>
          {step === 0 && <SwapForm onLimitSwap={() => handleOpenedDialog('limitOrder')} />}
          {/* TODO: provide proper pool prop */}
          {step === 1 && <SwapConfirmationStep poolInfo={{}} />}
          {step === 2 && (
            <TxSubmittedStep
              isSuccessful={isSuccessful}
              onTryAgain={() => {
                setStep(0);
                setIsSuccessful(true);
              }}
            />
          )}
        </Box>
        {step < 2 && (
          <Box
            flexShrink={0}
            gap="24px"
            p="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              onClick={handleNextStep}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
            >
              {step === 0 ? 'Swap' : 'Confirm'}
            </Button>
          </Box>
        )}
      </Box>

      {openedDialog === 'limitOrder' && (
        <LimitOrderDialog
          limitPrice={9}
          marketPrice={4}
          exchangePair="ADA/USDA"
          onConfirm={() => handleOpenedDialog('')}
          onClose={() => handleOpenedDialog('')}
        />
      )}
    </SwapFormProvider>
  );
}
