// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { StoresAndActionsProps } from '../../types/injectedProps.types';

import WalletSendFormRevamp from '../../components/wallet/send/WalletSendFormRevamp';

// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import TransactionSuccessDialog from '../../components/wallet/send/TransactionSuccessDialog';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import globalMessages from '../../i18n/global-messages';
import AddNFTDialog from '../../components/wallet/send/WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from '../../components/wallet/send/WalletSendFormSteps/AddTokenDialog';
import { ampli } from '../../../ampli/index';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';

const messages = defineMessages({
  txConfirmationLedgerNanoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage:
      '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  sendUsingLedgerNano: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
  txConfirmationTrezorTLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage:
      '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  sendUsingTrezorT: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});

@observer
export default class WalletSendPage extends Component<StoresAndActionsProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable showMemo: boolean = false;
  @observable showSupportedAddressDomainBanner: boolean = true;

  closeTransactionSuccessDialog: void => void = () => {
    const { stores } = this.props;
    const redirect = stores.loading.sellAdaParams?.redirect;
    if (redirect) {
      window.document.location = redirect;
    } else {
      this.props.stores.uiDialogs.closeActiveDialog();
      stores.app.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
    }
  };

  openTransactionSuccessDialog: void => void = () => {
    this.props.stores.uiDialogs.push({
      dialog: TransactionSuccessDialog,
    });
  };

  componentDidMount(): void {
    runInAction(() => {
      this.showMemo = false;
      this.showSupportedAddressDomainBanner =
        this.props.stores.substores.ada.addresses.getSupportedAddressDomainBannerState();
    });
    const { loadProtocolParametersRequest } = this.props.stores.protocolParameters;
    loadProtocolParametersRequest.reset();
    loadProtocolParametersRequest.execute();
    ampli.sendInitiated();
  }

  @action
  toggleShowMemo: void => void = () => {
    this.showMemo = !this.showMemo;
    this.props.stores.memos.closeMemoDialog();
  };

  openDialog: any => void = dialog => {
    this.props.stores.uiDialogs.closeActiveDialog();
    this.props.stores.uiDialogs.push({
      dialog,
    });
  };

  @action
  onSupportedAddressDomainBannerClose: void => void = () => {
    this.props.stores.substores.ada.addresses.setSupportedAddressDomainBannerState(false);
    this.showSupportedAddressDomainBanner = false;
  };

  _getNumDecimals(): number {
    const { selected } = this.props.stores.wallets;
    if (!selected) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      selected.networkId
    );
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);
    const info = getTokenInfo({
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

  render(): Node {
    const { stores } = this.props;
    const { selected } = stores.wallets;
    if (!selected) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);

    const {
      uiDialogs,
      transactionBuilderStore,
      protocolParameters,
    } = stores;

    if (!protocolParameters.loadProtocolParametersRequest.wasExecuted) {
      return null;
    }

    const { hasAnyPending } = stores.transactions;

    // disallow sending when pending tx exists
    if (
      (uiDialogs.isOpen(HWSendConfirmationDialog) ||
        uiDialogs.isOpen(WalletSendConfirmationDialog)) &&
      hasAnyPending
    ) {
      stores.uiDialogs.closeActiveDialog();
    }

    const defaultToken = stores.tokenInfoStore.getDefaultTokenInfo(
      selected.networkId
    );
    const network  = getNetworkById(selected.networkId);

    const addressStore = stores.substores.ada.addresses;
    const resolveDomainAddressFunc = addressStore.domainResolverSupported()
      ? addressStore.resolveDomainAddress.bind(addressStore)
      : null;
    return (
      <>
        <WalletSendFormRevamp
          resolveDomainAddress={resolveDomainAddressFunc}
          supportedAddressDomainBannerState={{
            isDisplayed: this.showSupportedAddressDomainBanner,
            onClose: this.onSupportedAddressDomainBannerClose,
          }}
          selectedNetwork={network}
          selectedWallet={selected}
          selectedExplorer={stores.explorers.selectedExplorer}
          selectedToken={transactionBuilderStore.selectedToken}
          defaultToken={defaultToken}
          getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
          onSubmit={transactionBuilderStore.updateTentativeTx}
          totalInput={transactionBuilderStore.totalInput}
          hasAnyPending={hasAnyPending}
          shouldSendAll={transactionBuilderStore.shouldSendAll}
          updateReceiver={(addr: void | string) => transactionBuilderStore.updateReceiver(addr)}
          updateAmount={(value: ?BigNumber) => transactionBuilderStore.updateAmount(value)}
          updateSendAllStatus={transactionBuilderStore.updateSendAllStatus}
          fee={transactionBuilderStore.fee}
          isCalculatingFee={transactionBuilderStore.createUnsignedTx.isExecuting}
          reset={transactionBuilderStore.reset}
          error={transactionBuilderStore.createUnsignedTx.error}
          // Min ADA for all tokens that is already included in the tx
          minAda={transactionBuilderStore.minAda}
          uriParams={stores.loading.uriParams}
          resetUriParams={stores.loading.resetUriParams}
          memo={transactionBuilderStore.memo}
          showMemo={this.showMemo}
          updateMemo={(content: void | string) => transactionBuilderStore.updateMemo(content)}
          onAddMemo={() =>
            this.showMemoDialog({
              dialog: MemoNoExternalStorageDialog,
              continuation: this.toggleShowMemo,
            })}
          spendableBalance={stores.transactions.balance}
          onAddToken={transactionBuilderStore.addToken}
          onRemoveTokens={transactionBuilderStore.removeTokens}
          plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
          isDefaultIncluded={transactionBuilderStore.isDefaultIncluded}
          openDialog={this.openDialog}
          closeDialog={this.props.stores.uiDialogs.closeActiveDialog}
          isOpen={uiDialogs.isOpen}
          openTransactionSuccessDialog={this.openTransactionSuccessDialog.bind(this)}
          unitOfAccountSetting={stores.profile.unitOfAccount}
          getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
          calculateMaxAmount={transactionBuilderStore.calculateMaxAmount}
          maxSendableAmount={transactionBuilderStore.maxSendableAmount}
          signRequest={transactionBuilderStore.tentativeTx}
          staleTx={transactionBuilderStore.txMismatch}
          sendMoneyRequest={stores.wallets.sendMoneyRequest}
          sendMoney={stores.substores.ada.mnemonicSend.sendMoney}
          ledgerSendError={stores.substores.ada.ledgerSend.error || null}
          trezorSendError={stores.substores.ada.trezorSend.error || null}
          ledgerSend={stores.substores.ada.ledgerSend}
          trezorSend={stores.substores.ada.trezorSend}
        />
        {this.renderDialog()}
      </>
    );
  }

  renderDialog: () => Node = () => {
    const { uiDialogs } = this.props.stores;

    if (uiDialogs.isOpen(WalletSendConfirmationDialog)) {
      return this.webWalletDoConfirmation();
    }
    if (uiDialogs.isOpen(HWSendConfirmationDialog)) {
      return this.hardwareWalletDoConfirmation();
    }
    if (uiDialogs.isOpen(MemoNoExternalStorageDialog)) {
      return this.noCloudWarningDialog();
    }
    if (uiDialogs.isOpen(TransactionSuccessDialog)) {
      const process = this.props.stores.loading.sellAdaParams?.redirect ?
        'for-sell' : 'normal';
      return (
        <TransactionSuccessDialog
          process={process}
          onClose={this.closeTransactionSuccessDialog}
        />
      );
    }

    if (uiDialogs.isOpen(AddNFTDialog)) {
      return this.renderNFTDialog();
    }

    if (uiDialogs.isOpen(AddTokenDialog)) {
      return this.renderAddTokenDialog();
    }

    return '';
  };

  /** Web Wallet Send Confirmation dialog
   * Callback that creates a container to avoid the component knowing about actions/stores */
  webWalletDoConfirmation: () => Node = () => {
    const { stores } = this.props;
    const { selected } = this.props.stores.wallets;
    if (!selected)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);

    const { transactionBuilderStore } = this.props.stores;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.webWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    return (
      <WalletSendConfirmationDialogContainer
        stores={stores}
        signRequest={signRequest}
        staleTx={transactionBuilderStore.txMismatch}
        unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
        openTransactionSuccessDialog={this.openTransactionSuccessDialog}
      />
    );
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
   * Callback that creates a component to avoid the component knowing about actions/stores
   * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation: () => Node = () => {
    const { selected } = this.props.stores.wallets;
    if (!selected)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);
    const { transactionBuilderStore } = this.props.stores;

    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.hardwareWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    const totalInput = signRequest.totalInput();
    const fee = signRequest.fee();
    const receivers = signRequest.receivers(false);

    let hwSendConfirmationDialog: Node = null;

    if (!(signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(
        `${nameof(this.hardwareWalletDoConfirmation)} hw wallets only supported for Byron`
      );
    }
    const selectedExplorerForNetwork =
      this.props.stores.explorers.selectedExplorer.get(
        selected.networkId
      ) ??
      (() => {
        throw new Error('No explorer for wallet network');
      })();

    if (selected.type === 'ledger') {
      const messagesLedgerNano = {
        infoLine1: messages.txConfirmationLedgerNanoLine1,
        infoLine2: globalMessages.txConfirmationLedgerNanoLine2,
        sendUsingHWButtonLabel: messages.sendUsingLedgerNano,
      };
      const ledgerSendStore = this.props.stores.substores.ada.ledgerSend;
      ledgerSendStore.init();
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={selectedExplorerForNetwork}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
          amount={totalInput.joinSubtractCopy(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          messages={messagesLedgerNano}
          isSubmitting={ledgerSendStore.isActionProcessing}
          error={ledgerSendStore.error}
          onSubmit={
            () => ledgerSendStore.sendUsingLedgerWallet({
              params: { signRequest },
              onSuccess: this.openTransactionSuccessDialog,
              wallet: selected,
            })
          }
          onCancel={ledgerSendStore.cancel}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
          addressToDisplayString={addr =>
            addressToDisplayString(addr, getNetworkById(selected.networkId))
          }
        />
      );
    } else if (selected.type === 'trezor') {
      const messagesTrezor = {
        infoLine1: messages.txConfirmationTrezorTLine1,
        infoLine2: globalMessages.txConfirmationTrezorTLine2,
        sendUsingHWButtonLabel: messages.sendUsingTrezorT,
      };
      const trezorSendStore = this.props.stores.substores.ada.trezorSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
          selectedExplorer={selectedExplorerForNetwork}
          getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
          amount={totalInput.joinSubtractCopy(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          messages={messagesTrezor}
          isSubmitting={trezorSendStore.isActionProcessing}
          error={trezorSendStore.error}
          onSubmit={
            () => trezorSendStore.sendUsingTrezor({
              params: { signRequest },
              onSuccess: this.openTransactionSuccessDialog,
              wallet: selected,
            })
          }
          onCancel={trezorSendStore.cancel}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
          addressToDisplayString={addr =>
            addressToDisplayString(addr, getNetworkById(selected.networkId))
          }
        />
      );
    } else {
      throw new Error('Unsupported hardware wallet found at hardwareWalletDoConfirmation.');
    }

    return hwSendConfirmationDialog;
  };

  showMemoDialog: ({|
    continuation: void => void,
    dialog: any,
  |}) => void = request => {
    if (this.props.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.props.stores.uiDialogs.push({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  noCloudWarningDialog: void => Node = () => {
    const { stores } = this.props;
    return (
      <MemoNoExternalStorageDialog
        onCancel={stores.memos.closeMemoDialog}
        addExternal={() => {
          stores.memos.closeMemoDialog();
          stores.app.goToRoute({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
        }}
        onAcknowledge={() => {
          this.props.stores.uiDialogs.getParam<(void) => void>('continuation')?.();
        }}
      />
    );
  };

  calculateMinAda: (
    Array<{|
      token: $ReadOnly<TokenRow>,
      included: boolean,
    |}>
  ) => string = selectedTokens => {
    const { transactionBuilderStore } = this.props.stores;
    const { calculateMinAda } = transactionBuilderStore;
    const tokens = this._mergeTokens(selectedTokens);
    const minAdaAmount = calculateMinAda(tokens.map(token => ({ token })));
    return new BigNumber(minAdaAmount).shiftedBy(-this._getNumDecimals()).toString();
  };

  _mergeTokens: (
    Array<{|
      token: $ReadOnly<TokenRow>,
      included: boolean,
    |}>
  ) => Array<$ReadOnly<TokenRow>> = selectedTokens => {
    const { transactionBuilderStore } = this.props.stores;
    const { plannedTxInfoMap } = transactionBuilderStore;
    const tokens = new Map<string, $ReadOnly<TokenRow>>();
    const shouldNotInclude = new Set();
    // Remove duplicated tokens
    selectedTokens.forEach(entry => {
      const id = entry.token.Identifier;
      if (entry.included) {
        tokens.set(id, entry.token);
      } else {
        shouldNotInclude.add(id);
      }
    });
    plannedTxInfoMap.forEach(entry => {
      const id = entry.token.Identifier;
      if (!shouldNotInclude.has(id)) tokens.set(id, entry.token);
    });

    return [...tokens.values()];
  };

  shouldAddMoreTokens: (
    Array<{| token: $ReadOnly<TokenRow>, included: boolean |}>
  ) => boolean = tokens => {
    const { maxAssetsAllowed } = this.props.stores.transactionBuilderStore;

    const allTokens = this._mergeTokens(tokens);

    return allTokens.length <= maxAssetsAllowed;
  };

  renderNFTDialog: void => Node = () => {
    const { selected } = this.props.stores.wallets;
    if (!selected) throw new Error(`Active wallet required for ${nameof(AddNFTDialog)}.`);

    const { transactionBuilderStore } = this.props.stores;

    return (
      <AddNFTDialog
        onClose={this.props.stores.uiDialogs.closeActiveDialog}
        spendableBalance={this.props.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        updateAmount={(value: ?BigNumber) => transactionBuilderStore.updateAmount(value)}
        onAddToken={transactionBuilderStore.addToken}
        onRemoveTokens={transactionBuilderStore.removeTokens}
        selectedNetwork={getNetworkById(selected.networkId)}
        calculateMinAda={this.calculateMinAda}
        plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
        shouldAddMoreTokens={this.shouldAddMoreTokens}
      />
    );
  };

  renderAddTokenDialog: void => Node = () => {
    const { selected } = this.props.stores.wallets;
    if (!selected) throw new Error(`Active wallet required for ${nameof(AddTokenDialog)}.`);

    const { transactionBuilderStore } = this.props.stores;

    return (
      <AddTokenDialog
        onClose={() => {
          transactionBuilderStore.deselectToken();
          this.props.stores.uiDialogs.closeActiveDialog();
        }}
        spendableBalance={this.props.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        updateAmount={(value: ?BigNumber) => transactionBuilderStore.updateAmount(value)}
        calculateMinAda={this.calculateMinAda}
        onAddToken={transactionBuilderStore.addToken}
        onRemoveTokens={transactionBuilderStore.removeTokens}
        shouldAddMoreTokens={this.shouldAddMoreTokens}
        plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
        selectedNetwork={getNetworkById(selected.networkId)}
      />
    );
  };
}
