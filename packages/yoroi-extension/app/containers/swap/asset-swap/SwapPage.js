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
import type { State } from '../context/swap-form/types';
import { StateWrap } from '../context/swap-form/types';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import { addressHexToBech32 } from '../../../api/ada/lib/cardanoCrypto/utils';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import LoadingOverlay from '../../../components/swap/LoadingOverlay';
import { IncorrectWalletPasswordError } from '../../../api/common/errors';
import { observer } from 'mobx-react';
import useSwapForm from '../context/swap-form/useSwapForm';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import { CoreAddressTypes } from '../../../api/ada/lib/storage/database/primitives/enums';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import globalMessages from '../../../i18n/global-messages';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import { defineMessages, injectIntl } from 'react-intl';
import { ampli } from '../../../../ampli/index';
import { tokenInfoToAnalyticsFromAndToAssets } from '../swapAnalytics';
import { useSwapFeeDisplay } from '../hooks';

const messages = defineMessages({
  sendUsingLedgerNano: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
  sendUsingTrezorT: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});


export const PRICE_IMPACT_MODERATE_RISK = 1;
export const PRICE_IMPACT_HIGH_RISK = 10;
export const LIMIT_PRICE_WARNING_THRESHOLD = 0.1;

const SWAP_AGGREGATOR = 'muesliswap';

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function SwapPage(props: StoresAndActionsProps & Intl): Node {
  const { stores } = props;
  const [openedDialog, setOpenedDialog] = useState('');
  const { orderStep, setOrderStepValue } = stores.substores.ada.swapStore;

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
  const { sellTokenInfo, buyTokenInfo, resetSwapForm, sellQuantity, buyQuantity } = useSwapForm();

  const wallet = stores.wallets.selectedOrFail;
  const walletType: string = wallet.type;
  const isHardwareWallet = wallet.isHardware;
  const network = getNetworkById(wallet.networkId);
  const defaultTokenInfo = stores.tokenInfoStore.getDefaultTokenInfoSummary(
    network.NetworkId
  );
  const getTokenInfoBatch: Array<string> => { [string]: Promise<RemoteTokenInfo> } = ids =>
    stores.tokenInfoStore.fetchMissingAndGetLocalOrRemoteMetadata(network, ids);
  const getTokenInfo: string => Promise<RemoteTokenInfo> = id =>
    getTokenInfoBatch([id])[id].then(res => res ?? {});

  const isMarketOrder = orderType === 'market';
  const impact = isMarketOrder ? Number(selectedPoolCalculation?.prices.priceImpact ?? 0) : 0;
  const priceImpactState: PriceImpact | null =
    impact > PRICE_IMPACT_MODERATE_RISK ? { isSevere: impact > PRICE_IMPACT_HIGH_RISK } : null;

  const { formattedFeeQuantity } = useSwapFeeDisplay(defaultTokenInfo);

  const [disclaimerStatus, setDisclaimerStatus] = useState<?boolean>(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<?string>(null);
  const [slippageValue, setSlippageValue] = useState(String(defaultSlippage));
  const [signRequest, setSignRequest] = useState<?HaskellShelleyTxSignRequest>(null);
  const userPasswordState: ?State<string> = isHardwareWallet ? null : StateWrap(useState<string>(''));
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
    sellQuantity.error == null &&
    buyQuantity.error == null &&
    isValidTickers;

  const confirmationCanContinue =
    (isHardwareWallet || userPasswordState?.value !== '')
    && signRequest != null;

  const isButtonLoader = orderStep === 1 && signRequest == null;

  const isSwapEnabled = (orderStep === 0 && swapFormCanContinue) || (orderStep === 1 && confirmationCanContinue);

  const disclaimerFlag = stores.substores.ada.swapStore.swapDisclaimerAcceptanceFlag;

  useEffect(() => {
    // MOUNT

    ampli.swapInitiated({
      ...tokenInfoToAnalyticsFromAndToAssets(sellTokenInfo, buyTokenInfo),
      slippage_tolerance: defaultSlippage,
      order_type: orderType,
    });

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
    setSelectedWalletAddress(addressHexToBech32(wallet.externalAddressesByType[CoreAddressTypes.CARDANO_BASE][0].address));
    stores.substores.ada.stateFetchStore.fetcher
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
      ampli.swapSlippageChanged({
        slippage_tolerance: newSlippage,
      });
    });
  };

  // <TODO:DEDUPLICATE> extract this and fix all places where it's duplicated
  const getFormattedPairingValue = (lovelaces: string): string => {
    const { currency } = stores.profile.unitOfAccount;
    if (currency == null || defaultTokenInfo.ticker == null) return '-';
    const price = stores.coinPriceStore.getCurrentPrice(defaultTokenInfo.ticker, currency);
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
      userPasswordState?.update('');
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
    const password = userPasswordState?.value;

    const baseBroadcastRequest = { wallet, signRequest };
    const broadcastRequest = isHardwareWallet
      ? { [walletType]: baseBroadcastRequest }
      : { normal: { ...baseBroadcastRequest, password },
    };
    try {
      const refreshWallet = () => stores.wallets.refreshWalletFromRemote(wallet.publicDeriverId);
      // $FlowIgnore[incompatible-call]
      await stores.substores.ada.wallets.adaSendAndRefresh({ broadcastRequest, refreshWallet });
      setOrderStepValue(2);
      try {
        ampli.swapOrderSubmitted({
          ...tokenInfoToAnalyticsFromAndToAssets(sellTokenInfo, buyTokenInfo),
          from_amount: sellQuantity.displayValue,
          to_amount: buyQuantity.displayValue,
          pool_source: selectedPoolCalculation?.pool.provider,
          order_type: orderType,
          slippage_tolerance: Number(slippageValue),
          swap_fees: Number(formattedFeeQuantity),
        });
      } catch (e) {
        console.error('analytics fail', e);
      }
      resetSwapForm();
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
    if (!isHardwareWallet) {
      if (userPasswordState?.value === '') {
        throw new Error('Incorrect state! User password is required');
      }
    }
  }

  function handleTransactionError(e) {
    const isPasswordError = e instanceof IncorrectWalletPasswordError;
    runInAction(() => {
      txSubmitErrorState.update(e);
      setOrderStepValue(isPasswordError ? 1 : 2);
    });
    if (!isPasswordError) {
      console.error('Failed to submit swap tx', e);
    }
  }

  const onRemoteOrderDataResolved: any => Promise<void> = async ({ contractAddress, datum, datumHash }) => {
    // creating tx
    if (selectedPoolCalculation == null) {
      throw new Error('Incorrect state. Pool calculations are not available to prepare the transaction');
    }
    if (contractAddress == null || datum == null || datumHash == null) {
      throw new Error(`Incorrect remote order resolve! ${JSON.stringify({ contractAddress, datum, datumHash })}`);
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
    const txSignRequest: HaskellShelleyTxSignRequest = await stores.substores.ada.swapStore.createUnsignedSwapTx(swapTxReq);
    runInAction(() => {
      setSignRequest(txSignRequest);
    });
  };

  function confirmationButtonMessage() {
    if (walletType === 'ledger') return messages.sendUsingLedgerNano;
    if (walletType === 'trezor') return messages.sendUsingTrezorT;
    return globalMessages.confirm;
  }

  function intl(msg): string {
    // noinspection JSUnresolvedFunction
    return props.intl.formatMessage(msg);
  }

  return (
    <>
      <Box display="flex" flexDirection="column" height="100%">
        <Box sx={{ flexGrow: '1', overflowY: 'auto', p: '24px' }} borderBottom="1px solid" borderColor="grayscale.200">
          {orderStep === 0 && (
            <CreateSwapOrder
              swapStore={stores.substores.ada.swapStore}
              slippageValue={slippageValue}
              onSetNewSlippage={onSetNewSlippage}
              defaultTokenInfo={defaultTokenInfo}
              getTokenInfo={getTokenInfo}
              getTokenInfoBatch={getTokenInfoBatch}
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
              getTokenInfo={getTokenInfo}
              getFormattedPairingValue={getFormattedPairingValue}
              onError={() => {
                stores.app.goToRoute({ route: ROUTES.SWAP.ERROR });
              }}
            />
          )}
          {orderStep === 2 && (
            <TxSubmittedStep
              txSubmitErrorState={txSubmitErrorState}
              onTryAgain={processBackToStart}
              onSuccess={() => {
                stores.app.goToRoute({ route: ROUTES.WALLETS.ROOT });
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
            sx={{ height: '97px' }}
          >
            {orderStep === 1 && (
              <Button onClick={processBackToStart} sx={{ minWidth: '128px', minHeight: '48px' }} variant="secondary">
                Back
              </Button>
            )}
            <Button
              onClick={processSwapOrder}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
              disabled={!isSwapEnabled || isButtonLoader}
            >
              {(isButtonLoader && <LoadingSpinner />) || (orderStep === 0 ? 'Swap' : intl(confirmationButtonMessage()))}
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
            stores.app.redirect({ route: ROUTES.WALLETS.ROOT });
          }}
        />
      )}
    </>
  );
}

export default (injectIntl(observer(SwapPage)): React$ComponentType<StoresAndActionsProps>);
