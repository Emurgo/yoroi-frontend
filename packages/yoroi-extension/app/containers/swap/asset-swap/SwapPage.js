// @flow
import type { Node } from 'react';
import { useEffect, useState, } from 'react';
import { Box, Button } from '@mui/material';
import SwapForm from './SwapForm';
import SwapConfirmationStep from './ConfirmationStep';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderDialog from '../../../components/swap/LimitOrderDialog';
import { SwapFormProvider } from '../context/swap-form';
import type { StoresAndActionsProps } from '../../../types/injectedPropsType';
import { useSwap } from '@yoroi/swap';
import { runInAction } from 'mobx';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import BigNumber from 'bignumber.js';
import SwapDisclaimerDialog from '../../../components/swap/SwapDisclaimerDialog';
import { ROUTES } from '../../../routes-config';

export default function SwapPage(props: StoresAndActionsProps): Node {
  const [step, setStep] = useState(0);
  const [openedDialog, setOpenedDialog] = useState('disclaimer');

  const {
    slippage,
    slippageChanged,
    orderData: {
      slippage: defaultSlippage,
      selectedPoolCalculation,
      amounts: { sell, buy }
    },
  } = useSwap();

  const isSwapEnabled =
    selectedPoolCalculation != null
    && sell.quantity !== '0'
    && buy.quantity !== '0';

  const [disclaimerStatus, setDisclaimerStatus] = useState<?boolean>(null);
  const [slippageValue, setSlippageValue] = useState(String(defaultSlippage));

  const disclaimerFlag = props.stores.substores.ada.swapStore.swapDisclaimerAcceptanceFlag;

  useEffect(() => {
    disclaimerFlag.get()
      .then(setDisclaimerStatus)
      .catch(e => {
        console.error('Failed to load swap disclaimer status! Setting to false for safety', e);
        setDisclaimerStatus(false);
      });
    slippage.read()
      .then(storedSlippage => {
        if (storedSlippage > 0) {
          runInAction(() => {
            setSlippageValue(String(storedSlippage));
            if (storedSlippage !== defaultSlippage) {
              slippageChanged(storedSlippage);
            }
          })
        }
        return null;
      })
      .catch(e => {
        console.error('Failed to load stored slippage', e);
      })
  }, []);

  const onAcceptDisclaimer = () => {
    disclaimerFlag.set(true)
      .then(() => setDisclaimerStatus(true))
      .catch(e => {
        console.error('Failed to store swap acceptance status!', e);
        setDisclaimerStatus(true);
      })
  }

  const onSetNewSlippage = (newSlippage: number): void => {
    runInAction(() => {
      slippage.save(newSlippage);
      slippageChanged(newSlippage);
      setSlippageValue(String(newSlippage));
    });
  }

  // state data
  const wallet = props.stores.wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const defaultTokenInfo = props.stores.tokenInfoStore
    .getDefaultTokenInfoSummary(network.NetworkId);
  const tokenInfoLookup = (tokenId: string): Promise<RemoteTokenInfo> =>
    props.stores.tokenInfoStore.getLocalOrRemoteMetadata(network, tokenId);

  // <TODO:DEDUPLICATE> extract this and fix all places where it's duplicated
  const getFormattedPairingValue = (lovelaces: string): string => {
    const { currency } = props.stores.profile.unitOfAccount;
    if (currency == null || defaultTokenInfo.ticker == null)
      return '-';
    const price = props.stores.coinPriceStore.getCurrentPrice(defaultTokenInfo.ticker, currency);
    const shiftedAmount = new BigNumber(lovelaces).shiftedBy(-(defaultTokenInfo.decimals ?? 0));
    const val = price ? calculateAndFormatValue(shiftedAmount, price) : '-';
    return `${val} ${currency}`;
  }

  const [isSuccessful, setIsSuccessful] = useState(false);
  const handleNextStep = () => setStep(s => s + 1);

  return (
    <SwapFormProvider>
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>
          {step === 0 && (
            <SwapForm
              swapStore={props.stores.substores.ada.swapStore}
              slippageValue={slippageValue}
              onSetNewSlippage={onSetNewSlippage}
              onLimitSwap={() => setOpenedDialog('limitOrder')}
              defaultTokenInfo={defaultTokenInfo}
              tokenInfoLookup={tokenInfoLookup}
            />
          )}
          {step === 1 && (
            <SwapConfirmationStep
              slippageValue={slippageValue}
              defaultTokenInfo={defaultTokenInfo}
              getFormattedPairingValue={getFormattedPairingValue}
            />
          )}
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
              disabled={!isSwapEnabled}
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
          onConfirm={() => setOpenedDialog('')}
          onClose={() => setOpenedDialog('')}
        />
      )}

      {disclaimerStatus === false && (
        <SwapDisclaimerDialog
          onDialogConfirm={onAcceptDisclaimer}
          onDialogRefuse={() => {
            props.actions.router.redirect.trigger({ route: ROUTES.WALLETS.ROOT });
          }}
        />
      )}
    </SwapFormProvider>
  );
}
