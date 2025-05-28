// @flow
import type { Node } from 'react';
import type { PriceImpact } from '../../../components/swap/types';
import type { State } from '../context/swap-form/types';
import type { RemoteTokenInfo } from '../../../api/ada/lib/state-fetch/types';
import type { $npm$ReactIntl$IntlShape } from 'react-intl';
import type { StoresProps } from '../../../stores';
import ConfirmSwapTransaction from './ConfirmSwapTransaction';
import TxSubmittedStep from './TxSubmittedStep';
import LimitOrderWarningDialog from '../../../components/swap/LimitOrderWarningDialog';
import BigNumber from 'bignumber.js';
import SwapDisclaimerDialog from '../../../components/swap/SwapDisclaimerDialog';
import LoadingSpinner from '../../../components/widgets/LoadingSpinner';
import LoadingOverlay from '../../../components/swap/LoadingOverlay';
import useSwapForm from '../context/swap-form/useSwapForm';
import globalMessages from '../../../i18n/global-messages';
import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { CreateSwapOrder } from './CreateSwapOrder';
import { useSwap } from '@yoroi/swap';
import { runInAction } from 'mobx';
import { calculateAndFormatValue } from '../../../utils/unit-of-account';
import { ROUTES } from '../../../routes-config';
import { PriceImpactAlert } from '../../../components/swap/PriceImpact';
import { StateWrap } from '../context/swap-form/types';
import { addressHexToBech32 } from '../../../api/ada/lib/cardanoCrypto/utils';
import { HaskellShelleyTxSignRequest } from '../../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { IncorrectWalletPasswordError } from '../../../api/common/errors';
import { observer } from 'mobx-react';
import { CoreAddressTypes } from '../../../api/ada/lib/storage/database/primitives/enums';
import { getNetworkById } from '../../../api/ada/lib/storage/database/prepackaged/networks';
import { injectIntl } from 'react-intl';
import { ampli } from '../../../../ampli/index';
import { tokenInfoToAnalyticsFromAndToAssets } from '../swapAnalytics';
import { useSwapFeeDisplay } from '../hooks';
import { useStrings } from '../common/useStrings';
import { downloadLogs } from '../../../utils/logging';
// $FlowIgnore: suppressing this error
import { useTxReviewModal } from '../../../UI/features/transaction-review/module/ReviewTxProvider';
import { SwapPoolLabel } from '../../../components/swap/SwapPoolComponents';
import { SwapTxInfo } from './SwapTxInfo';
// $FlowIgnore: suppressing this error
import { TransactionResult } from '../../../UI/features/transaction-review/common/types';

export const PRICE_IMPACT_MODERATE_RISK = 1;
export const PRICE_IMPACT_HIGH_RISK = 10;
export const LIMIT_PRICE_WARNING_THRESHOLD = 0.1;

const SWAP_AGGREGATOR = 'muesliswap';

type Intl = {|
  intl: $npm$ReactIntl$IntlShape,
|};

function SwapPage(props: StoresProps & Intl): Node {
  const { stores } = props;
  const [openedDialog, setOpenedDialog] = useState('');
  const { back, sendUsingLedgerNano, sendUsingTrezorT, swap } = useStrings();
  const { orderStep, setOrderStepValue } = stores.substores.ada.swapStore;

  const { openTxReviewModal, changeModalView, showTxResultModal } = useTxReviewModal();

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
  const defaultTokenInfo = stores.tokenInfoStore.getDefaultTokenInfoSummary(network.NetworkId);
  const getTokenInfoBatch: (Array<string>) => { [string]: Promise<RemoteTokenInfo> } = ids =>
    stores.tokenInfoStore.fetchMissingAndGetLocalOrRemoteMetadata(network, ids);
  const getTokenInfo: string => Promise<RemoteTokenInfo> = id => getTokenInfoBatch([id])[id].then(res => res ?? {});

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
  // TODO check after if I can remove this - maybe add a displatch to add it directly in txProvider state
  const [parsedSignRequest, setParsedSignRequest] = useState(null);

  // useEffect(() => {
  //   userPasswordState?.update(passwordInputValue);
  // }, [passwordInputValue, userPasswordState?.value]);

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

  const confirmationCanContinue = true;
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

  const processSwapOrder = async () => {
    try {
      if (orderStep === 0) {
        handleInitialStep();
      } else if (orderStep === 1) {
        const isAutoPool = selectedPoolCalculation.pool?.poolId === selectedPoolCalculation.pool.bestPool?.poolId;
        openTxReviewModal({
          title: 'Transaction confirmation',
          modalView: 'transactionReview',
          receiverCustomTitle: {
            to: <SwapPoolLabel provider={selectedPoolCalculation.pool?.provider} isAutoPool={isAutoPool} />,
          },
          submitTx: password => {
            handleSubmitTransaction(password);
          },
          extraOverviewDetails: {
            title: 'Swap Details',
            onClick: () => changeModalView({ modalView: 'extraDetails' }),
            component: (
              <SwapTxInfo
                defaultTokenInfo={defaultTokenInfo}
                getTokenInfo={getTokenInfo}
                priceImpactState={priceImpactState}
                slippageValue={slippageValue}
              />
            ),
          },
          unsignedTx: parsedSignRequest, // Ensure it stays in sync with the store
        });
      }
    } catch (error) {
      console.error('Error handling next step', error);
    }
  };

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
  const handleSubmitTransaction = async (password) => {
    if (signRequest == null) return;
    validateSignRequestAndUserPassword(password);

    setOpenedDialog('loadingOverlay');

    try {
      await stores.transactionProcessingStore.adaSendAndRefresh({
        wallet,
        signRequest,
        password,
        callback: () => stores.wallets.refreshWalletFromRemote(wallet.publicDeriverId),
      });

      setOrderStepValue(2);
      showTxResultModal(TransactionResult.SUCCESS);

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
  };

  const validateSignRequestAndUserPassword = password => {
    if (signRequest == null) {
      throw new Error('Incorrect state! Order transaction is not prepared properly');
    }
    if (!isHardwareWallet) {
      if (password === '') {
        throw new Error('Incorrect state! User password is required');
      }
    }
  };

  function handleTransactionError(e) {
    const isPasswordError = e instanceof IncorrectWalletPasswordError;
    runInAction(() => {
      txSubmitErrorState.update(e);
      setOrderStepValue(isPasswordError ? 1 : 2);
      showTxResultModal(TransactionResult.FAIL);
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
    const txSignRequest = await stores.substores.ada.swapStore.createUnsignedSwapTx(swapTxReq);
    const unsigned = txSignRequest;
    const txBodyjson = unsigned.unsignedTx;

    runInAction(() => {
      setParsedSignRequest(txBodyjson);
      setSignRequest(txSignRequest);
    });
  };

  function confirmationButtonMessage() {
    if (walletType === 'ledger') return sendUsingLedgerNano;
    if (walletType === 'trezor') return sendUsingTrezorT;
    return props.intl.formatMessage(globalMessages.confirm);
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
              onDownloadLogs={downloadLogs}
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
                {back}
              </Button>
            )}
            <Button
              onClick={processSwapOrder}
              sx={{ minWidth: '128px', minHeight: '48px' }}
              variant="primary"
              disabled={!isSwapEnabled || isButtonLoader}
            >
              {(isButtonLoader && <LoadingSpinner small color={3} />) || (orderStep === 0 ? swap : confirmationButtonMessage())}
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

export default (injectIntl(observer(SwapPage)): React$ComponentType<StoresProps>);
