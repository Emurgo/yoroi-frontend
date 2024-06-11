// @flow
import type { Node } from 'react';
import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { CreateSwapOrder } from './CreateSwapOrder';
import ConfirmSwapTransaction from './ConfirmSwapTransaction';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderWarningDialog from '../../../components/swap/LimitOrderWarningDialog';
import type { StoresAndActionsProps } from '../../../types/injectedProps.types';
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
import { addressHexToBech32 } from '../../../api/ada/lib/cardanoCrypto/utils';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import LoadingOverlay from '../../../components/swap/LoadingOverlay';
import { IncorrectWalletPasswordError } from '../../../api/common/errors';
import { observer } from 'mobx-react';
import useSwapForm from '../context/swap-form/useSwapForm';

export const PRICE_IMPACT_MODERATE_RISK = 1;
export const PRICE_IMPACT_HIGH_RISK = 10;
export const LIMIT_PRICE_WARNING_THRESHOLD = 0.1;

const SWAP_AGGREGATOR = 'muesliswap';

function SwapPage(props: StoresAndActionsProps): Node {
  const [openedDialog, setOpenedDialog] = useState('');
  const { orderStep, setOrderStepValue } = props.stores.substores.ada.swapStore;

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
  const { sellTokenInfo, buyTokenInfo } = useSwapForm();

  const isMarketOrder = orderType === 'market';
  const impact = isMarketOrder ? Number(selectedPoolCalculation?.prices.priceImpact ?? 0) : 0;
  const priceImpactState: PriceImpact | null =
    impact > PRICE_IMPACT_MODERATE_RISK ? { isSevere: impact > PRICE_IMPACT_HIGH_RISK } : null;

  const [disclaimerStatus, setDisclaimerStatus] = useState<?boolean>(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<?string>(null);
  const [slippageValue, setSlippageValue] = useState(String(defaultSlippage));
  const [signRequest, setSignRequest] = useState<?HaskellShelleyTxSignRequest>(null);
  const userPasswordState = StateWrap(useState<string>(''));
  const txSubmitErrorState = StateWrap(useState<?Error>(null));
  const isValidTickers = sellTokenInfo?.ticker && buyTokenInfo?.ticker;

  useEffect(
    () => () => {
      // UNMOUNT
      setOrderStepValue(0);
    },
    []
  );

  const swapFormCanContinue =
    selectedPoolCalculation != null &&
    sell.quantity !== '0' &&
    buy.quantity !== '0' &&
    isValidTickers;

  const confirmationCanContinue = userPasswordState.value !== '' && signRequest != null;

  const isButtonLoader = orderStep === 1 && signRequest == null;

  const isSwapEnabled =
    (orderStep === 0 && swapFormCanContinue) || (orderStep === 1 && confirmationCanContinue);

  const wallet = props.stores.wallets.selectedOrFail;
  const network = wallet.getParent().getNetworkInfo();
  const defaultTokenInfo = props.stores.tokenInfoStore.getDefaultTokenInfoSummary(
    network.NetworkId
  );

  const disclaimerFlag = props.stores.substores.ada.swapStore.swapDisclaimerAcceptanceFlag;

  useEffect(() => {
    disclaimerFlag
      .get()
      .then(setDisclaimerStatus)
      .catch(e => {
        console.error('Failed to load swap disclaimer status! Setting to false for safety', e);
        setDisclaimerStatus(false);
      });
    slippage
      .read()
      .then(storedSlippage => {
        if (storedSlippage > 0) {
          runInAction(() => {
            setSlippageValue(String(storedSlippage));
            if (storedSlippage !== defaultSlippage) {
              slippageChanged(storedSlippage);
            }
          });
        }
        return null;
      })
      .catch(e => {
        console.error('Failed to load stored slippage', e);
      });
    props.stores.addresses
      .getFirstExternalAddress(wallet)
      .then(a => setSelectedWalletAddress(addressHexToBech32(a.address)))
      .catch(e => {
        console.error('Failed to load wallet address', e);
      });
    props.stores.substores.ada.stateFetchStore.fetcher
      .getSwapFeeTiers({ network })
      .then(feeTiers => {
        const aggregatorFeeTiers = feeTiers?.[SWAP_AGGREGATOR] ?? [];
        frontendFeeTiersChanged(aggregatorFeeTiers);
        return null;
      })
      .catch(err => {
        console.error(`unexpected error: failed to get swap fee tiers: ${err}`);
      });
  }, []);

  const onAcceptDisclaimer = () => {
    disclaimerFlag
      .set(true)
      .then(() => setDisclaimerStatus(true))
      .catch(e => {
        console.error('Failed to store swap acceptance status!', e);
        setDisclaimerStatus(true);
      });
  };

  const onSetNewSlippage = (newSlippage: number): void => {
    runInAction(() => {
      slippage.save(newSlippage);
      slippageChanged(newSlippage);
      setSlippageValue(String(newSlippage));
    });
  };

  // <TODO:DEDUPLICATE> extract this and fix all places where it's duplicated
  const getFormattedPairingValue = (lovelaces: string): string => {
    const { currency } = props.stores.profile.unitOfAccount;
    if (currency == null || defaultTokenInfo.ticker == null) return '-';
    const price = props.stores.coinPriceStore.getCurrentPrice(defaultTokenInfo.ticker, currency);
    const shiftedAmount = new BigNumber(lovelaces).shiftedBy(-(defaultTokenInfo.decimals ?? 0));
    const val = price ? calculateAndFormatValue(shiftedAmount, price) : '-';
    return `${val} ${currency}`;
  };

  async function processSwapOrder() {
    try {
      if (orderStep === 0) {
        handleInitialStep();
      } else if (orderStep === 1) {
        await handleSubmitTransaction();
      }
    } catch (error) {
      console.error('Error handling next step', error);
      // Handle error appropriately
    }
  }

  function processBackToStart() {
    runInAction(() => {
      setOrderStepValue(0);
      userPasswordState.update('');
      txSubmitErrorState.update(null);
      setSignRequest(null);
    });
  }

  function handleInitialStep() {
    if (openedDialog !== '') return;

    if (isMarketOrder) {
      if (checkPriceImpactWarning()) {
        return;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (checkLimitOrderThresholdWarning()) {
        return;
      }
    }
    setOrderStepValue(1);
    setSignRequest(null);
  }

  function checkPriceImpactWarning() {
    if (priceImpactState?.isSevere) {
      setOpenedDialog('priceImpactAlert');
      return true;
    }
  }

  function checkLimitOrderThresholdWarning() {
    const marketPrice = new BigNumber(selectedPoolCalculation.prices.market);
    const limitPrice = new BigNumber(orderLimitPrice);
    if (limitPrice.isGreaterThan(marketPrice.times(1 + LIMIT_PRICE_WARNING_THRESHOLD))) {
      setOpenedDialog('limitOrderWarning');
      return true;
    }
  }

  async function handleSubmitTransaction() {
    if (openedDialog !== '' || signRequest == null) return;

    validateSignRequestAndUserPassword();
    setOpenedDialog('loadingOverlay');
    const password = userPasswordState.value;

    try {
      await props.stores.substores.ada.wallets.adaSendAndRefresh({
        broadcastRequest: {
          normal: {
            publicDeriver: wallet,
            password,
            signRequest,
          },
        },
        refreshWallet: () => props.stores.wallets.refreshWalletFromRemote(wallet),
      });
      setOrderStepValue(2);
    } catch (e) {
      handleTransactionError(e);
    } finally {
      setOpenedDialog('');
    }
  }

  function validateSignRequestAndUserPassword() {
    if (signRequest == null) {
      throw new Error('Incorrect state! Order transaction is not prepared properly');
    }
    const password = userPasswordState.value;
    if (password === '') {
      throw new Error('Incorrect state! User password is required');
    }
  }

  function handleTransactionError(e) {
    const isPasswordError = e instanceof IncorrectWalletPasswordError;
    runInAction(() => {
      txSubmitErrorState.update(e);
      if (!isPasswordError) {
        setOrderStepValue(1);
      }
    });
    if (!isPasswordError) {
      console.error('Failed to submit swap tx', e);
    }
  }

  const onRemoteOrderDataResolved: any => Promise<void> = async ({
    contractAddress,
    datum,
    datumHash,
  }) => {
    // creating tx
    if (selectedPoolCalculation == null) {
      throw new Error(
        'Incorrect state. Pool calculations are not available to prepare the transaction'
      );
    }
    if (contractAddress == null || datum == null || datumHash == null) {
      throw new Error(
        `Incorrect remote order resolve! ${JSON.stringify({ contractAddress, datum, datumHash })}`
      );
    }
    const {
      pool: { provider: poolProvider, deposit, batcherFee },
      cost,
    } = selectedPoolCalculation;
    const feFees = cost.frontendFeeInfo.fee;
    const ptFees = { deposit: deposit.quantity, batcher: batcherFee.quantity };
    const swapTxReq = {
      wallet,
      contractAddress,
      datum,
      datumHash,
      sell,
      buy,
      feFees,
      ptFees,
      poolProvider,
    };
    const txSignRequest: HaskellShelleyTxSignRequest = await props.stores.substores.ada.swapStore.createUnsignedSwapTx(
      swapTxReq
    );
    runInAction(() => {
      setSignRequest(txSignRequest);
    });
  };

  return (
    <>
      <Box display="flex" flexDirection="column" height="100%">
        <Box
          sx={{ flexGrow: '1', overflowY: 'auto', p: '24px' }}
          borderBottom="1px solid"
          borderColor="grayscale.200"
        >
          {orderStep === 0 && (
            <CreateSwapOrder
              swapStore={props.stores.substores.ada.swapStore}
              slippageValue={slippageValue}
              onSetNewSlippage={onSetNewSlippage}
              defaultTokenInfo={defaultTokenInfo}
              priceImpactState={priceImpactState}
            />
          )}
          {orderStep === 1 && (
            <ConfirmSwapTransaction
              slippageValue={slippageValue}
              walletAddress={selectedWalletAddress}
              priceImpactState={priceImpactState}
              onRemoteOrderDataResolved={onRemoteOrderDataResolved}
              userPasswordState={userPasswordState}
              txSubmitErrorState={txSubmitErrorState}
              defaultTokenInfo={defaultTokenInfo}
              getFormattedPairingValue={getFormattedPairingValue}
            />
          )}
          {orderStep === 2 && (
            <TxSubmittedStep
              txSubmitErrorState={txSubmitErrorState}
              onTryAgain={processBackToStart}
              onSuccess={() => {
                props.actions.router.goToRoute.trigger({ route: ROUTES.SWAP.ORDERS });
              }}
            />
          )}
        </Box>
        {orderStep < 2 && (
          <Box
            flexShrink={0}
            gap="24px"
            p="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {orderStep === 1 && (
              <Button
                onClick={processBackToStart}
                sx={{ minWidth: '128px', minHeight: '48px' }}
                variant="outlined"
              >
                Back
              </Button>
            )}
            <Button
              onClick={processSwapOrder}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
              disabled={!isSwapEnabled || isButtonLoader}
            >
              {(isButtonLoader && <LoadingSpinner />) || (orderStep === 0 ? 'Swap' : 'Confirm')}
            </Button>
          </Box>
        )}
      </Box>

      {openedDialog === 'loadingOverlay' && <LoadingOverlay />}

      {openedDialog === 'limitOrderWarning' && (
        <LimitOrderWarningDialog
          onContinue={() => {
            setOrderStepValue(1);
            setOpenedDialog('');
          }}
          onCancel={() => setOpenedDialog('')}
        />
      )}

      {openedDialog === 'priceImpactAlert' && (
        <PriceImpactAlert
          onContinue={() => {
            setOrderStepValue(1);
            setOpenedDialog('');
          }}
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
    </>
  );
}

export default (observer(SwapPage): React$ComponentType<StoresAndActionsProps>);
