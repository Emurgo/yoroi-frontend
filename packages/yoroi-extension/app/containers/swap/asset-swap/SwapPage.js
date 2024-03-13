// @flow
import type { Node } from 'react';
import { useEffect, useState, } from 'react';
import { Box, Button, Stack } from '@mui/material';
import SwapForm from './SwapForm';
import SwapConfirmationStep from './ConfirmationStep';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderWarningDialog from '../../../components/swap/LimitOrderWarningDialog';
import { SwapFormProvider } from '../context/swap-form';
import type { StoresAndActionsProps } from '../../../types/injectedPropsType';
import { useSwap } from '@yoroi/swap';
import { runInAction } from 'mobx';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import BigNumber from 'bignumber.js';
import SwapDisclaimerDialog from '../../../components/swap/SwapDisclaimerDialog';
import { ROUTES } from '../../../routes-config';
import type { PriceImpact } from '../../../components/swap/types';
import { PriceImpactAlert } from '../../../components/swap/PriceImpact';
import { StateWrap } from '../context/swap-form/types';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import FullscreenLayout from '../../../components/layout/FullscreenLayout';
import { addressHexToBech32 } from '../../../api/ada/lib/cardanoCrypto/utils';

export const PRICE_IMPACT_MODERATE_RISK = 1;
export const PRICE_IMPACT_HIGH_RISK = 10;
export const LIMIT_PRICE_WARNING_THRESHOLD = 0.1;

const SWAP_AGGREGATOR = 'muesliswap';

export default function SwapPage(props: StoresAndActionsProps): Node {
  const [step, setStep] = useState(0);
  const [openedDialog, setOpenedDialog] = useState('');

  const {
    slippage,
    slippageChanged,
    orderData: {
      type: orderType,
      slippage: defaultSlippage,
      selectedPoolCalculation,
      amounts: { sell, buy },
      limitPrice: orderLimitPrice,
    },
    frontendFeeTiersChanged,
  } = useSwap();

  const isMarketOrder = orderType === 'market';
  const impact = isMarketOrder ? Number(selectedPoolCalculation?.prices.priceImpact ?? 0) : 0;
  const priceImpactState: ?PriceImpact = impact > PRICE_IMPACT_MODERATE_RISK
    ? { isSevere: impact > PRICE_IMPACT_HIGH_RISK } : null;

  const [disclaimerStatus, setDisclaimerStatus] = useState<?boolean>(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<?string>(null);
  const [slippageValue, setSlippageValue] = useState(String(defaultSlippage));
  const userPasswordState = StateWrap(useState<string>(''));
  const remoteOrderDataState = StateWrap(useState<?any>(null));

  const swapFormCanContinue =
    selectedPoolCalculation != null
    && sell.quantity !== '0'
    && buy.quantity !== '0';

  const confirmationCanContinue =
    userPasswordState.value !== ''
    && remoteOrderDataState.value != null;

  const isButtonLoader =
    step === 1 && remoteOrderDataState.value == null;

  const isSwapEnabled =
    (step === 0 && swapFormCanContinue)
    || (step === 1 && confirmationCanContinue);

  const wallet = props.stores.wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const defaultTokenInfo = props.stores.tokenInfoStore
    .getDefaultTokenInfoSummary(network.NetworkId);

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
      });
    props.stores.addresses.getFirstExternalAddress(wallet)
      .then(a => setSelectedWalletAddress(addressHexToBech32(a.address)))
      .catch(e => {
        console.error('Failed to load wallet address', e);
      });
    props.stores.substores.ada.stateFetchStore.fetcher.getSwapFeeTiers({ network })
      .then(feeTiers => {
        const aggregatorFeeTiers = feeTiers?.[SWAP_AGGREGATOR] ?? [];
        frontendFeeTiersChanged(aggregatorFeeTiers);
      })
      .catch(err => {
        console.error(`unexpected erorr: failed to get swap fee tiers: ${err}`);
      });
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
  const handleNextStep = () => {
    if (step === 0) {
      if (isMarketOrder) {
        if (priceImpactState?.isSevere) {
          if (openedDialog === '') {
            setOpenedDialog('priceImpactAlert');
            return;
          }
          setOpenedDialog('');
        }
      } else {
        // limit order
        const marketPrice = new BigNumber(selectedPoolCalculation.prices.market);
        const limitPrice = new BigNumber(orderLimitPrice);
        if (limitPrice.isGreaterThan(marketPrice.times(1 + LIMIT_PRICE_WARNING_THRESHOLD))) {
          if (openedDialog === '') {
            setOpenedDialog('limitOrderWarning');
            return;
          }
          setOpenedDialog('');
        }
      }
    } else if (step === 1) {
      // submitting tx
      if (selectedPoolCalculation == null) {
        throw new Error('Incorrect state. Pool calculations are not available to prepare the transaction')
      }
      const remoteOrderData = remoteOrderDataState.value;
      if (remoteOrderData == null) {
        throw new Error('Incorrect state. Remote order data is not available to prepare the transaction')
      }
      const { pool: { provider: poolProvider, deposit, batcherFee }, cost } = selectedPoolCalculation;
      const { contractAddress, datum } = remoteOrderData;
      const feFees = cost.frontendFeeInfo.fee;
      const ptFees = { deposit: deposit.quantity, batcher: batcherFee.quantity };
      const swapTxReq = { wallet, contractAddress, datum, sell, buy, feFees, ptFees, poolProvider };
      props.stores.substores.ada.swapStore.createUnsignedSwapTx(swapTxReq);
    }
    setStep(s => s + 1);
  };

  return (
    <SwapFormProvider>
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ flexGrow: '1', overflowY: 'auto' }}>
          {step === 0 && (
            <SwapForm
              swapStore={props.stores.substores.ada.swapStore}
              slippageValue={slippageValue}
              onSetNewSlippage={onSetNewSlippage}
              defaultTokenInfo={defaultTokenInfo}
              priceImpactState={priceImpactState}
            />
          )}
          {step === 1 && (
            <SwapConfirmationStep
              slippageValue={slippageValue}
              walletAddress={selectedWalletAddress}
              priceImpactState={priceImpactState}
              orderDataState={remoteOrderDataState}
              userPasswordState={userPasswordState}
              defaultTokenInfo={defaultTokenInfo}
              getFormattedPairingValue={getFormattedPairingValue}
            />
          )}
          {step === 2 && (
            <FullscreenLayout bottomPadding={0}>
              <Stack alignItems="center" justifyContent="center" height="50vh">
                <LoadingSpinner />
              </Stack>
            </FullscreenLayout>
          )}
          {step === 3 && (
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
            borderTop="1px solid"
            borderColor="grayscale.200"
          >
            <Button
              onClick={handleNextStep}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
              disabled={!isSwapEnabled || isButtonLoader}
            >
              {
                (isButtonLoader && <LoadingSpinner />)
                || (step === 0 ? 'Swap' : 'Confirm')
              }
            </Button>
          </Box>
        )}
      </Box>

      {openedDialog === 'limitOrderWarning' && (
        <LimitOrderWarningDialog
          onContinue={handleNextStep}
          onCancel={() => setOpenedDialog('')}
        />
      )}

      {openedDialog === 'priceImpactAlert' && (
        <PriceImpactAlert
          onContinue={handleNextStep}
          onCancel={() => setOpenedDialog('')}
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
