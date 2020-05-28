// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';
import globalMessages from '../../i18n/global-messages';
import { tryAddressToKind } from '../../api/ada/lib/storage/bridge/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

import {
  DECIMAL_PLACES_IN_ADA,
  MAX_INTEGER_PLACES_IN_ADA
} from '../../config/numbersConfig';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type {
  GeneratedData as WalletSendConfirmationDialogContainerData
} from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import {
  copySignRequest,
  IGetFee,
  IReceivers,
  ITotalInput,
} from '../../api/ada/transactions/utils';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { SelectedApiType } from '../../stores/toplevel/ProfileStore';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';

const messagesLedger = defineMessages({
  infoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  infoLine2: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.2',
    defaultMessage: '!!!Make sure Cardano ADA app must remain open on the Ledger device throughout the process.',
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
});

const messagesTrezor = defineMessages({
  infoLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  infoLine2: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.2',
    defaultMessage: '!!!A new tab will appear. Please follow the instructions in the new tab.',
  },
  sendUsingHWButtonLabel: {
    id: 'wallet.send.trezor.confirmationDialog.submit',
    defaultMessage: '!!!Send using Trezor',
  },
});

export type GeneratedData = typeof WalletSendPage.prototype.generated;

@observer
export default class WalletSendPage extends Component<InjectedOrGenerated<GeneratedData>> {

  static contextTypes: {|intl: $npm$ReactIntl$IntlFormat|} = {
    intl: intlShape.isRequired,
  };

  @observable showMemo: boolean = false;

  componentDidMount(): void {
    runInAction(() => {
      this.showMemo = this.generated.initialShowMemoState;
    });
  }

  getSelectedApi: void => SelectedApiType = () => {
    const { selectedAPI } = this.generated.stores.profile;
    if (selectedAPI === undefined) {
      throw new Error(`${nameof(WalletSendPage)} no API selected`);
    }
    return selectedAPI;
  }

  @action
  toggleShowMemo: void => void = () => {
    this.showMemo = !this.showMemo;
  };

  render(): Node {
    const selectedAPI = this.getSelectedApi();
    const { transactions, transactionBuilderStore } = this.generated.stores.substores.ada;
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for WalletSendPage.');

    const { uiDialogs, profile, } = this.generated.stores;
    const { actions } = this.generated;
    const { validateAmount, hasAnyPending } = transactions;
    const { txBuilderActions } = this.generated.actions.ada;

    // disallow sending when pending tx exists
    if (uiDialogs.isOpen && hasAnyPending) {
      actions.dialogs.closeActiveDialog.trigger();
    }

    const walletType = publicDeriver.getParent().getWalletType();
    const targetDialog = walletType === WalletTypeOption.HARDWARE_WALLET ?
      HWSendConfirmationDialog :
      WalletSendConfirmationDialog;

    const onSubmit = () => {
      actions.dialogs.open.trigger({
        dialog: targetDialog
      });
      txBuilderActions.updateTentativeTx.trigger();
    };

    return (
      <>
        <WalletSendForm
          currencyUnit={{
            unitName: selectedAPI.meta.unitName,
            primaryTicker: selectedAPI.meta.primaryTicker,
          }}
          currencyMaxIntegerDigits={MAX_INTEGER_PLACES_IN_ADA}
          currencyMaxFractionalDigits={DECIMAL_PLACES_IN_ADA}
          validateAmount={validateAmount}
          onSubmit={onSubmit}
          isValidShelleyAddress={address => {
            const kind = tryAddressToKind(address, 'bech32');
            if (kind == null) return false;
            if (kind === CoreAddressTypes.CARDANO_LEGACY) return false;
            return true;
          }}
          isValidLegacyAddress={address => {
            const kind = tryAddressToKind(address, 'bech32');
            if (kind == null) return false;
            if (kind === CoreAddressTypes.CARDANO_LEGACY) return true;
            return false;
          }}
          totalInput={transactionBuilderStore.totalInput}
          hasAnyPending={hasAnyPending}
          classicTheme={profile.isClassicTheme}
          updateReceiver={(addr: void | string) => txBuilderActions.updateReceiver.trigger(addr)}
          updateAmount={(value: void | number) => txBuilderActions.updateAmount.trigger(value)}
          updateMemo={(content: void | string) => txBuilderActions.updateMemo.trigger(content)}
          shouldSendAll={transactionBuilderStore.shouldSendAll}
          toggleSendAll={txBuilderActions.toggleSendAll.trigger}
          fee={transactionBuilderStore.fee}
          isCalculatingFee={transactionBuilderStore.createUnsignedTx.isExecuting}
          reset={txBuilderActions.reset.trigger}
          error={transactionBuilderStore.createUnsignedTx.error}
          uriParams={this.generated.stores.loading.uriParams}
          resetUriParams={this.generated.stores.loading.resetUriParams}
          showMemo={this.showMemo}
          onAddMemo={() => this.showMemoDialog({
            dialog: MemoNoExternalStorageDialog,
            continuation: this.toggleShowMemo,
          })}
        />
        {this.renderDialog()}
      </>
    );
  }

  renderDialog: (() => Node) = () => {
    const { uiDialogs } = this.generated.stores;

    if (uiDialogs.isOpen(WalletSendConfirmationDialog)) {
      return this.webWalletDoConfirmation();
    }
    if (uiDialogs.isOpen(HWSendConfirmationDialog)) {
      return this.hardwareWalletDoConfirmation();
    }
    if (uiDialogs.isOpen(MemoNoExternalStorageDialog)) {
      return this.noCloudWarningDialog();
    }
    return '';
  }

  /** Web Wallet Send Confirmation dialog
    * Callback that creates a container to avoid the component knowing about actions/stores */
  webWalletDoConfirmation: (() => Node) = () => {
    const { intl } = this.context;

    const { transactionBuilderStore } = this.generated.stores.substores.ada;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error('webWalletDoConfirmation::should never happen');
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore
          .getCurrentPrice('ADA', this.generated.stores.profile.unitOfAccount.currency)
      )
      : null;

    return (<WalletSendConfirmationDialogContainer
      {...this.generated.WalletSendConfirmationDialogContainerProps}
      signRequest={signRequest}
      staleTx={transactionBuilderStore.txMismatch}
      currencyUnit={intl.formatMessage(globalMessages.unitAda)}
      unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
      coinPrice={coinPrice}
    />);
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
    * Callback that creates a component to avoid the component knowing about actions/stores
    * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation: (() => Node) = () => {
    const selectedAPI = this.getSelectedApi();
    const { intl } = this.context;
    const publicDeriver = this.generated.stores.wallets.selected;
    const { transactionBuilderStore } = this.generated.stores.substores.ada;
    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for hardwareWalletDoConfirmation.');

    if (!transactionBuilderStore.tentativeTx) {
      throw new Error('hardwareWalletDoConfirmation::should never happen');
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    const totalInput = ITotalInput(signRequest, true);
    const fee = IGetFee(signRequest, true);
    const receivers = IReceivers(signRequest, false);

    const coinPrice: ?number = this.generated.stores.profile.unitOfAccount.enabled
      ? (
        this.generated.stores.coinPriceStore
          .getCurrentPrice('ADA', this.generated.stores.profile.unitOfAccount.currency)
      )
      : null;

    const conceptualWallet = publicDeriver.getParent();
    let hwSendConfirmationDialog: Node = null;

    const unsignedTx = signRequest.unsignedTx;
    if (!(unsignedTx instanceof RustModule.WalletV2.Transaction)) {
      throw new Error('hardwareWalletDoConfirmation hw wallets unsupported for Shelley');
    }
    const v2Request = {
      ...signRequest,
      unsignedTx,
    };
    if (isLedgerNanoWallet(conceptualWallet)) {
      const ledgerSendAction = this.generated.actions[selectedAPI.type].ledgerSend;
      ledgerSendAction.init.trigger();
      const ledgerSendStore = this.generated.stores.substores[selectedAPI.type].ledgerSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          amount={totalInput.minus(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          messages={messagesLedger}
          isSubmitting={ledgerSendStore.isActionProcessing}
          error={ledgerSendStore.error}
          onSubmit={
            () => ledgerSendAction.sendUsingLedger.trigger({
              params: { signRequest: copySignRequest(v2Request) },
              publicDeriver,
            })
          }
          onCancel={ledgerSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          coinPrice={coinPrice}
        />);
    } else if (isTrezorTWallet(conceptualWallet)) {
      const trezorSendAction = this.generated.actions[selectedAPI.type].trezorSend;
      const trezorSendStore = this.generated.stores.substores[selectedAPI.type].trezorSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={this.generated.stores.profile.selectedExplorer}
          amount={totalInput.minus(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          currencyUnit={intl.formatMessage(globalMessages.unitAda)}
          messages={messagesTrezor}
          isSubmitting={trezorSendStore.isActionProcessing}
          error={trezorSendStore.error}
          onSubmit={
            () => trezorSendAction.sendUsingTrezor.trigger({
              params: { signRequest: copySignRequest(v2Request) },
              publicDeriver,
            })
          }
          onCancel={trezorSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          coinPrice={coinPrice}
        />);
    } else {
      throw new Error('Unsupported hardware wallet found at hardwareWalletDoConfirmation.');
    }

    return hwSendConfirmationDialog;
  };

  showMemoDialog: {|
    continuation: void => void,
    dialog: any,
  |} => void = (request) => {
    if (this.generated.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.generated.actions.dialogs.open.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  }

  noCloudWarningDialog: void => Node = () => {
    const { actions, } = this.generated;
    return (<MemoNoExternalStorageDialog
      onCancel={actions.memos.closeMemoDialog.trigger}
      addExternal={() => {
        actions.memos.closeMemoDialog.trigger();
        actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
      }}
      onAcknowledge={() => {
        actions.memos.closeMemoDialog.trigger();
        this.generated.stores.uiDialogs.getParam<void => void>('continuation')();
      }}
    />);
  }

  @computed get generated() {
    if (this.props.generated !== undefined) {
      return this.props.generated;
    }
    if (this.props.stores == null || this.props.actions == null) {
      throw new Error(`${nameof(WalletSendPage)} no way to generated props`);
    }
    const { stores, actions } = this.props;
    const adaStore = stores.substores.ada;
    return Object.freeze({
      stores: {
        profile: {
          selectedAPI: stores.profile.selectedAPI,
          isClassicTheme: stores.profile.isClassicTheme,
          selectedExplorer: stores.profile.selectedExplorer,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        memos: {
          hasSetSelectedExternalStorageProvider: stores.memos.hasSetSelectedExternalStorageProvider,
        },
        loading: {
          uriParams: stores.loading.uriParams,
          resetUriParams: stores.loading.resetUriParams,
        },
        coinPriceStore: {
          getCurrentPrice: stores.coinPriceStore.getCurrentPrice,
        },
        uiDialogs: {
          isOpen: stores.uiDialogs.isOpen,
          getParam: stores.uiDialogs.getParam,
        },
        substores: {
          ada: {
            transactions: {
              validateAmount: adaStore.transactions.validateAmount,
              hasAnyPending: adaStore.transactions.hasAnyPending,
            },
            ledgerSend: {
              isActionProcessing: adaStore.ledgerSend.isActionProcessing,
              error: adaStore.ledgerSend.error,
            },
            trezorSend: {
              isActionProcessing: adaStore.trezorSend.isActionProcessing,
              error: adaStore.trezorSend.error,
            },
            transactionBuilderStore: {
              totalInput: adaStore.transactionBuilderStore.totalInput,
              fee: adaStore.transactionBuilderStore.fee,
              shouldSendAll: adaStore.transactionBuilderStore.shouldSendAll,
              tentativeTx: adaStore.transactionBuilderStore.tentativeTx,
              txMismatch: adaStore.transactionBuilderStore.txMismatch,
              createUnsignedTx: {
                isExecuting: adaStore.transactionBuilderStore.createUnsignedTx.isExecuting,
                error: adaStore.transactionBuilderStore.createUnsignedTx.error,
              },
            },
          },
        },
      },
      actions: {
        dialogs: {
          open: { trigger: actions.dialogs.open.trigger },
          closeActiveDialog: { trigger: actions.dialogs.closeActiveDialog.trigger },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeMemoDialog: {
            trigger: actions.memos.closeMemoDialog.trigger
          },
        },
        ada: {
          ledgerSend: {
            init: { trigger: actions.ada.ledgerSend.init.trigger },
            cancel: { trigger: actions.ada.ledgerSend.cancel.trigger },
            sendUsingLedger: { trigger: actions.ada.ledgerSend.sendUsingLedger.trigger },
          },
          trezorSend: {
            cancel: { trigger: actions.ada.trezorSend.cancel.trigger },
            sendUsingTrezor: { trigger: actions.ada.trezorSend.sendUsingTrezor.trigger },
          },
          txBuilderActions: {
            updateTentativeTx: { trigger: actions.ada.txBuilderActions.updateTentativeTx.trigger },
            updateReceiver: { trigger: actions.ada.txBuilderActions.updateReceiver.trigger },
            updateAmount: { trigger: actions.ada.txBuilderActions.updateAmount.trigger },
            toggleSendAll: { trigger: actions.ada.txBuilderActions.toggleSendAll.trigger },
            reset: { trigger: actions.ada.txBuilderActions.reset.trigger },
            updateMemo: { trigger: actions.ada.txBuilderActions.updateMemo.trigger },
          },
        },
      },
      initialShowMemoState: (false: boolean),
      WalletSendConfirmationDialogContainerProps: (
        { actions, stores, }: InjectedOrGenerated<WalletSendConfirmationDialogContainerData>
      ),
    });
  }
}
