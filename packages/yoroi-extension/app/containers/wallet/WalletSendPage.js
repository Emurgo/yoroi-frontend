// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import type { Node } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import WalletSendForm from '../../components/wallet/send/WalletSendForm';
// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type {
  GeneratedData as WalletSendConfirmationDialogContainerData
} from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { isLedgerNanoWallet, isTrezorTWallet } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import type { SendUsingLedgerParams } from '../../actions/ada/ledger-send-actions';
import type { SendUsingTrezorParams } from '../../actions/ada/trezor-send-actions';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { UriParams } from '../../utils/URIHandling';
import { SelectedExplorer } from '../../domain/SelectedExplorer';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import LocalizableError from '../../i18n/LocalizableError';
import type { ISignRequest } from '../../api/common/lib/transactions/ISignRequest';
import { ApiOptions, getApiForNetwork, } from '../../api/common/utils';
import { validateAmount, getMinimumValue } from '../../utils/validations';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import {
  MultiToken,
} from '../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import globalMessages from '../../i18n/global-messages';

const messages = defineMessages({
  txConfirmationLedgerNanoLine1: {
    id: 'wallet.send.ledger.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Ledger device to your computer’s USB port, press the Send using Ledger button.',
  },
  sendUsingLedgerNano: {
    id: 'wallet.send.ledger.confirmationDialog.submit',
    defaultMessage: '!!!Send using Ledger',
  },
  txConfirmationTrezorTLine1: {
    id: 'wallet.send.trezor.confirmationDialog.info.line.1',
    defaultMessage: '!!!After connecting your Trezor device to your computer, press the Send using Trezor button.',
  },
  sendUsingTrezorT: {
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

  @action
  toggleShowMemo: void => void = () => {
    this.showMemo = !this.showMemo;
    this.generated.actions.memos.closeMemoDialog.trigger();
  };

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);

    const { transactionBuilderStore } = this.generated.stores;

    const { uiDialogs, profile, } = this.generated.stores;
    const { actions } = this.generated;
    const { hasAnyPending } = this.generated.stores.transactions;
    const { txBuilderActions } = this.generated.actions;

    // disallow sending when pending tx exists
    if (uiDialogs.isOpen && hasAnyPending) {
      actions.dialogs.closeActiveDialog.trigger();
    }

    const walletType = publicDeriver.getParent().getWalletType();
    const targetDialog = walletType === WalletTypeOption.HARDWARE_WALLET ?
      HWSendConfirmationDialog :
      WalletSendConfirmationDialog;

    const onSubmit = () => {
      actions.dialogs.push.trigger({
        dialog: targetDialog
      });
      txBuilderActions.updateTentativeTx.trigger();
    };

    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );

    return (
      <>
        <WalletSendForm
          selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
          validateAmount={(amount) => validateAmount(
            amount,
            transactionBuilderStore.selectedToken ?? defaultToken,
            getMinimumValue(
              publicDeriver.getParent().getNetworkInfo(),
              transactionBuilderStore.selectedToken?.IsDefault ?? true
            ),
            this.context.intl,
          )}
          defaultToken={defaultToken}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          onSubmit={onSubmit}
          totalInput={transactionBuilderStore.totalInput}
          hasAnyPending={hasAnyPending}
          classicTheme={profile.isClassicTheme}
          updateReceiver={(addr: void | string) => txBuilderActions.updateReceiver.trigger(addr)}
          updateAmount={(value: ?BigNumber) => txBuilderActions.updateAmount.trigger(value)}
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
          spendableBalance={this.generated.stores.transactions.getBalanceRequest.result}
          onAddToken={txBuilderActions.updateToken.trigger}
          selectedToken={transactionBuilderStore.selectedToken}
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
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);

    const { transactionBuilderStore } = this.generated.stores;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.webWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    return (<WalletSendConfirmationDialogContainer
      {...this.generated.WalletSendConfirmationDialogContainerProps}
      signRequest={signRequest}
      staleTx={transactionBuilderStore.txMismatch}
      unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
    />);
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
    * Callback that creates a component to avoid the component knowing about actions/stores
    * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation: (() => Node) = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);
    const selectedApiType = getApiForNetwork(publicDeriver.getParent().getNetworkInfo());

    if (selectedApiType !== ApiOptions.ada) {
      throw new Error(`${nameof(this.hardwareWalletDoConfirmation)} not ADA API type`);
    }
    const adaApi = ApiOptions.ada;

    const { transactionBuilderStore } = this.generated.stores;
    // Guard against potential null values
    if (!publicDeriver) throw new Error('Active wallet required for hardwareWalletDoConfirmation.');

    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.hardwareWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    const totalInput = signRequest.totalInput();
    const fee = signRequest.fee();
    const receivers = signRequest.receivers(false);

    const conceptualWallet = publicDeriver.getParent();
    let hwSendConfirmationDialog: Node = null;

    if (!(signRequest instanceof HaskellShelleyTxSignRequest)) {
      throw new Error(`${nameof(this.hardwareWalletDoConfirmation)} hw wallets only supported for Byron`);
    }
    const selectedExplorerForNetwork = this.generated.stores.explorers.selectedExplorer
      .get(publicDeriver.getParent().getNetworkInfo().NetworkId)
      ?? (() => { throw new Error('No explorer for wallet network'); })();

    if (isLedgerNanoWallet(conceptualWallet)) {
      const messagesLedgerNano = {
        infoLine1: messages.txConfirmationLedgerNanoLine1,
        infoLine2: globalMessages.txConfirmationLedgerNanoLine2,
        sendUsingHWButtonLabel: messages.sendUsingLedgerNano,
      };
      const ledgerSendAction = this.generated.actions[adaApi].ledgerSend;
      ledgerSendAction.init.trigger();
      const ledgerSendStore = this.generated.stores.substores[adaApi].ledgerSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          selectedExplorer={selectedExplorerForNetwork}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
          amount={totalInput.joinSubtractCopy(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          messages={messagesLedgerNano}
          isSubmitting={ledgerSendStore.isActionProcessing}
          error={ledgerSendStore.error}
          onSubmit={
            () => ledgerSendAction.sendUsingLedgerWallet.trigger({
              params: { signRequest },
              publicDeriver,
            })
          }
          onCancel={ledgerSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          addressToDisplayString={
            addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
          }
        />);
    } else if (isTrezorTWallet(conceptualWallet)) {
      const messagesTrezor = {
        infoLine1: messages.txConfirmationTrezorTLine1,
        infoLine2: globalMessages.txConfirmationTrezorTLine2,
        sendUsingHWButtonLabel: messages.sendUsingTrezorT,
      };
      const trezorSendAction = this.generated.actions[adaApi].trezorSend;
      const trezorSendStore = this.generated.stores.substores[adaApi].trezorSend;
      hwSendConfirmationDialog = (
        <HWSendConfirmationDialog
          staleTx={transactionBuilderStore.txMismatch}
          getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
          selectedExplorer={selectedExplorerForNetwork}
          getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
          amount={totalInput.joinSubtractCopy(fee)}
          receivers={receivers}
          totalAmount={totalInput}
          transactionFee={fee}
          messages={messagesTrezor}
          isSubmitting={trezorSendStore.isActionProcessing}
          error={trezorSendStore.error}
          onSubmit={
            () => trezorSendAction.sendUsingTrezor.trigger({
              params: { signRequest },
              publicDeriver,
            })
          }
          onCancel={trezorSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          addressToDisplayString={
            addr => addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
          }
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

    this.generated.actions.dialogs.push.trigger({
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
        this.generated.stores.uiDialogs.getParam<void => void>('continuation')();
      }}
    />);
  }

  @computed get generated(): {|
    WalletSendConfirmationDialogContainerProps:
      InjectedOrGenerated<WalletSendConfirmationDialogContainerData>,
    actions: {|
      ada: {|
        ledgerSend: {|
          cancel: {| trigger: (params: void) => void |},
          init: {| trigger: (params: void) => void |},
          sendUsingLedgerWallet: {|
            trigger: (params: {|
              params: SendUsingLedgerParams,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |}
        |},
        trezorSend: {|
          cancel: {| trigger: (params: void) => void |},
          sendUsingTrezor: {|
            trigger: (params: {|
              params: SendUsingTrezorParams,
              publicDeriver: PublicDeriver<>
            |}) => Promise<void>
          |}
        |},
      |},
      txBuilderActions: {|
        reset: {|
          trigger: (params: void) => void
        |},
        toggleSendAll: {|
          trigger: (params: void) => void
        |},
        updateAmount: {|
          trigger: (params: ?BigNumber) => void
        |},
        updateToken: {|
          trigger: (params: void | $ReadOnly<TokenRow>) => void
        |},
        updateMemo: {|
          trigger: (params: void | string) => void
        |},
        updateReceiver: {|
          trigger: (params: void | string) => void
        |},
        updateTentativeTx: {|
          trigger: (params: void) => void
        |}
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void
        |},
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any
          |}) => void
        |},
      |},
      memos: {|
        closeMemoDialog: {| trigger: (params: void) => void |}
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string
          |}) => void
        |}
      |}
    |},
    initialShowMemoState: boolean,
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?number
      |},
      loading: {|
        resetUriParams: void => void,
        uriParams: ?UriParams
      |},
      memos: {|
        hasSetSelectedExternalStorageProvider: boolean
      |},
      explorers: {|
        selectedExplorer: Map<number, SelectedExplorer>,
      |},
      tokenInfoStore: {|
        tokenInfo: TokenInfoMap,
        getDefaultTokenInfo: number => $ReadOnly<TokenRow>,
      |},
      profile: {|
        isClassicTheme: boolean,
        unitOfAccount: UnitOfAccountSettingType
      |},
      transactionBuilderStore: {|
        createUnsignedTx: {|
          error: ?LocalizableError,
          isExecuting: boolean
        |},
        fee: ?MultiToken,
        shouldSendAll: boolean,
        tentativeTx: null | ISignRequest<any>,
        totalInput: ?MultiToken,
        txMismatch: boolean,
        selectedToken: void | $ReadOnly<TokenRow>,
      |},
      substores: {|
        ada: {|
          ledgerSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean
          |},
          trezorSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean
          |}
        |}
      |},
      transactions: {|
        hasAnyPending: boolean,
        getBalanceRequest: {|
          result: ?MultiToken,
        |},
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean
      |},
      wallets: {| selected: null | PublicDeriver<> |}
    |}
    |} {
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
        explorers: {
          selectedExplorer: stores.explorers.selectedExplorer,
        },
        profile: {
          isClassicTheme: stores.profile.isClassicTheme,
          unitOfAccount: stores.profile.unitOfAccount,
        },
        wallets: {
          selected: stores.wallets.selected,
        },
        tokenInfoStore: {
          tokenInfo: stores.tokenInfoStore.tokenInfo,
          getDefaultTokenInfo: stores.tokenInfoStore.getDefaultTokenInfo,
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
        transactions: {
          hasAnyPending: stores.transactions.hasAnyPending,
          getBalanceRequest: (() => {
            if (stores.wallets.selected == null) return {
              result: undefined,
            };
            const { requests } = stores.transactions.getTxRequests(stores.wallets.selected);

            return {
              result: requests.getBalanceRequest.result,
            };
          })(),
        },
        transactionBuilderStore: {
          totalInput: stores.transactionBuilderStore.totalInput,
          fee: stores.transactionBuilderStore.fee,
          shouldSendAll: stores.transactionBuilderStore.shouldSendAll,
          tentativeTx: stores.transactionBuilderStore.tentativeTx,
          txMismatch: stores.transactionBuilderStore.txMismatch,
          createUnsignedTx: {
            isExecuting: stores.transactionBuilderStore.createUnsignedTx.isExecuting,
            error: stores.transactionBuilderStore.createUnsignedTx.error,
          },
          selectedToken: stores.transactionBuilderStore.selectedToken,
        },
        substores: {
          ada: {
            ledgerSend: {
              isActionProcessing: adaStore.ledgerSend.isActionProcessing,
              error: adaStore.ledgerSend.error,
            },
            trezorSend: {
              isActionProcessing: adaStore.trezorSend.isActionProcessing,
              error: adaStore.trezorSend.error,
            },
          },
        },
      },
      actions: {
        dialogs: {
          push: {
            trigger: actions.dialogs.push.trigger,
          },
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
        txBuilderActions: {
          updateTentativeTx: { trigger: actions.txBuilderActions.updateTentativeTx.trigger },
          updateReceiver: { trigger: actions.txBuilderActions.updateReceiver.trigger },
          updateAmount: { trigger: actions.txBuilderActions.updateAmount.trigger },
          updateToken: { trigger: actions.txBuilderActions.updateToken.trigger },
          toggleSendAll: { trigger: actions.txBuilderActions.toggleSendAll.trigger },
          reset: { trigger: actions.txBuilderActions.reset.trigger },
          updateMemo: { trigger: actions.txBuilderActions.updateMemo.trigger },
        },
        ada: {
          ledgerSend: {
            init: { trigger: actions.ada.ledgerSend.init.trigger },
            cancel: { trigger: actions.ada.ledgerSend.cancel.trigger },
            sendUsingLedgerWallet: {
              trigger: actions.ada.ledgerSend.sendUsingLedgerWallet.trigger
            },
          },
          trezorSend: {
            cancel: { trigger: actions.ada.trezorSend.cancel.trigger },
            sendUsingTrezor: { trigger: actions.ada.trezorSend.sendUsingTrezor.trigger },
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
