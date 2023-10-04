// @flow
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import type { Node, ComponentType } from 'react';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { InjectedOrGenerated } from '../../types/injectedPropsType';

import WalletSendFormClassic from '../../components/wallet/send/WalletSendForm';
import WalletSendFormRevamp from '../../components/wallet/send/WalletSendFormRevamp';

// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import type { GeneratedData as WalletSendConfirmationDialogContainerData } from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
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
import { ApiOptions, getApiForNetwork } from '../../api/common/utils';
import { validateAmount, getMinimumValue } from '../../utils/validations';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { MultiToken } from '../../api/common/lib/MultiToken';
import type { TokenInfoMap } from '../../stores/toplevel/TokenInfoStore';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import TransactionSuccessDialog from '../../components/wallet/send/TransactionSuccessDialog';
import type { LayoutComponentMap } from '../../styles/context/layout';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import globalMessages from '../../i18n/global-messages';
import { withLayout } from '../../styles/context/layout';
import AddNFTDialog from '../../components/wallet/send/WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from '../../components/wallet/send/WalletSendFormSteps/AddTokenDialog';
import { trackSend } from '../../api/analytics';

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

export type GeneratedData = typeof WalletSendPage.prototype.generated;

type Props = {|
  ...InjectedOrGenerated<GeneratedData>,
|};
type InjectedProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
  +selectedLayout: string,
|};
type AllProps = {| ...Props, ...InjectedProps |};

@observer
class WalletSendPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable showMemo: boolean = false;

  closeTransactionSuccessDialog: void => void = () => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
    this.generated.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
  };

  openTransactionSuccessDialog: void => void = () => {
    this.generated.actions.dialogs.push.trigger({
      dialog: TransactionSuccessDialog,
    });
  };

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

  openDialog: any => void = dialog => {
    this.generated.actions.dialogs.closeActiveDialog.trigger();
    this.generated.actions.dialogs.push.trigger({
      dialog,
    });
  };

  _getNumDecimals(): number {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);
    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );
    const getTokenInfo = genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo);
    const info = getTokenInfo({
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

  render(): Node {
    const publicDeriver = this.generated.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);

    const { transactionBuilderStore } = this.generated.stores;

    const { uiDialogs, profile } = this.generated.stores;
    const { actions } = this.generated;
    const { hasAnyPending } = this.generated.stores.transactions;
    const { txBuilderActions } = this.generated.actions;

    // disallow sending when pending tx exists
    if (
      (uiDialogs.isOpen(HWSendConfirmationDialog) ||
        uiDialogs.isOpen(WalletSendConfirmationDialog)) &&
      hasAnyPending
    ) {
      actions.dialogs.closeActiveDialog.trigger();
    }

    const walletType = publicDeriver.getParent().getWalletType();
    const targetDialog =
      walletType === WalletTypeOption.HARDWARE_WALLET
        ? HWSendConfirmationDialog
        : WalletSendConfirmationDialog;

    const onSubmit = () => {
      actions.dialogs.push.trigger({
        dialog: targetDialog,
      });
      txBuilderActions.updateTentativeTx.trigger();
    };

    const defaultToken = this.generated.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );

    if (this.props.selectedLayout === 'REVAMP') {
      return (
        <>
          <WalletSendFormRevamp
            selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
            selectedWallet={publicDeriver}
            selectedExplorer={this.generated.stores.explorers.selectedExplorer}
            selectedToken={transactionBuilderStore.selectedToken}
            defaultToken={defaultToken}
            getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
            onSubmit={txBuilderActions.updateTentativeTx.trigger}
            totalInput={transactionBuilderStore.totalInput}
            hasAnyPending={hasAnyPending}
            isClassicTheme={profile.isClassicTheme}
            shouldSendAll={transactionBuilderStore.shouldSendAll}
            updateReceiver={(addr: void | string) => txBuilderActions.updateReceiver.trigger(addr)}
            updateAmount={(value: ?BigNumber) => txBuilderActions.updateAmount.trigger(value)}
            updateSendAllStatus={txBuilderActions.updateSendAllStatus.trigger}
            fee={transactionBuilderStore.fee}
            isCalculatingFee={transactionBuilderStore.createUnsignedTx.isExecuting}
            reset={txBuilderActions.reset.trigger}
            error={transactionBuilderStore.createUnsignedTx.error}
            // Min ADA for all tokens that is already included in the tx
            minAda={transactionBuilderStore.minAda}
            uriParams={this.generated.stores.loading.uriParams}
            resetUriParams={this.generated.stores.loading.resetUriParams}
            memo={transactionBuilderStore.memo}
            showMemo={this.showMemo}
            updateMemo={(content: void | string) => txBuilderActions.updateMemo.trigger(content)}
            onAddMemo={() =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: this.toggleShowMemo,
              })}
            spendableBalance={this.generated.stores.transactions.balance}
            onAddToken={txBuilderActions.addToken.trigger}
            onRemoveTokens={txBuilderActions.removeTokens.trigger}
            plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
            isDefaultIncluded={transactionBuilderStore.isDefaultIncluded}
            openDialog={this.openDialog}
            closeDialog={this.generated.actions.dialogs.closeActiveDialog.trigger}
            isOpen={uiDialogs.isOpen}
            openTransactionSuccessDialog={this.openTransactionSuccessDialog.bind(this)}
            unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
            getCurrentPrice={this.generated.stores.coinPriceStore.getCurrentPrice}
            calculateMaxAmount={txBuilderActions.calculateMaxAmount.trigger}
            maxSendableAmount={transactionBuilderStore.maxSendableAmount}
            signRequest={transactionBuilderStore.tentativeTx}
            staleTx={transactionBuilderStore.txMismatch}
            sendMoneyRequest={this.generated.stores.wallets.sendMoneyRequest}
            sendMoney={this.generated.actions.wallets.sendMoney.trigger}
            ledgerSendError={this.generated.stores.substores.ada.ledgerSend.error || null}
            trezorSendError={this.generated.stores.substores.ada.trezorSend.error || null}
            ledgerSend={this.generated.actions.ada.ledgerSend}
            trezorSend={this.generated.actions.ada.trezorSend}
          />
          {this.renderDialog()}
        </>
      );
    }
    return (
      <>
        <WalletSendFormClassic
          selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
          validateAmount={amount =>
            validateAmount(
              amount,
              transactionBuilderStore.selectedToken ?? defaultToken,
              getMinimumValue(
                publicDeriver.getParent().getNetworkInfo(),
                transactionBuilderStore.selectedToken?.IsDefault ?? true
              ),
              this.context.intl
            )
          }
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
          updateSendAllStatus={txBuilderActions.updateSendAllStatus.trigger}
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
          spendableBalance={this.generated.stores.transactions.balance}
          onAddToken={txBuilderActions.addToken.trigger}
          selectedToken={transactionBuilderStore.selectedToken}
        />
        {this.renderDialog()}
      </>
    );
  }

  renderDialog: () => Node = () => {
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
    if (uiDialogs.isOpen(TransactionSuccessDialog)) {
      return (
        <TransactionSuccessDialog
          onClose={this.closeTransactionSuccessDialog}
          classicTheme={this.generated.stores.profile.isClassicTheme}
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
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);

    const { transactionBuilderStore } = this.generated.stores;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.webWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    return (
      <WalletSendConfirmationDialogContainer
        {...this.generated.WalletSendConfirmationDialogContainerProps}
        signRequest={signRequest}
        staleTx={transactionBuilderStore.txMismatch}
        unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
        openTransactionSuccessDialog={this.openTransactionSuccessDialog}
      />
    );
  };

  /** Hardware Wallet (Trezor or Ledger) Confirmation dialog
   * Callback that creates a component to avoid the component knowing about actions/stores
   * separate container is not needed, this container acts as container for Confirmation dialog */
  hardwareWalletDoConfirmation: () => Node = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);
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
      throw new Error(
        `${nameof(this.hardwareWalletDoConfirmation)} hw wallets only supported for Byron`
      );
    }
    const selectedExplorerForNetwork =
      this.generated.stores.explorers.selectedExplorer.get(
        publicDeriver.getParent().getNetworkInfo().NetworkId
      ) ??
      (() => {
        throw new Error('No explorer for wallet network');
      })();

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
          onSubmit={() => {
            ledgerSendAction.sendUsingLedgerWallet.trigger({
              params: { signRequest },
              publicDeriver,
              onSuccess: this.openTransactionSuccessDialog,
            });
            trackSend();
          }}
          onCancel={ledgerSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          addressToDisplayString={addr =>
            addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
          }
        />
      );
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
          onSubmit={() => {
            trezorSendAction.sendUsingTrezor.trigger({
              params: { signRequest },
              publicDeriver,
              onSuccess: this.openTransactionSuccessDialog,
            });
            trackSend();
          }}
          onCancel={trezorSendAction.cancel.trigger}
          unitOfAccountSetting={this.generated.stores.profile.unitOfAccount}
          addressToDisplayString={addr =>
            addressToDisplayString(addr, publicDeriver.getParent().getNetworkInfo())
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
    if (this.generated.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.generated.actions.dialogs.push.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  noCloudWarningDialog: void => Node = () => {
    const { actions } = this.generated;
    return (
      <MemoNoExternalStorageDialog
        onCancel={actions.memos.closeMemoDialog.trigger}
        addExternal={() => {
          actions.memos.closeMemoDialog.trigger();
          actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
        }}
        onAcknowledge={() => {
          this.generated.stores.uiDialogs.getParam<(void) => void>('continuation')();
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
    const { transactionBuilderStore } = this.generated.stores;
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
    const { transactionBuilderStore } = this.generated.stores;
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
    const { maxAssetsAllowed } = this.generated.stores.transactionBuilderStore;

    const allTokens = this._mergeTokens(tokens);

    return allTokens.length <= maxAssetsAllowed;
  };

  renderNFTDialog: void => Node = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AddNFTDialog)}.`);

    const { transactionBuilderStore } = this.generated.stores;
    const { txBuilderActions } = this.generated.actions;

    return (
      <AddNFTDialog
        onClose={this.generated.actions.dialogs.closeActiveDialog.trigger}
        spendableBalance={this.generated.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        classicTheme={this.generated.stores.profile.isClassicTheme}
        updateAmount={(value: ?BigNumber) => txBuilderActions.updateAmount.trigger(value)}
        onAddToken={txBuilderActions.addToken.trigger}
        onRemoveTokens={txBuilderActions.removeTokens.trigger}
        selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
        calculateMinAda={this.calculateMinAda}
        plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
        shouldAddMoreTokens={this.shouldAddMoreTokens}
      />
    );
  };

  renderAddTokenDialog: void => Node = () => {
    const publicDeriver = this.generated.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AddTokenDialog)}.`);

    const { transactionBuilderStore } = this.generated.stores;
    const { txBuilderActions } = this.generated.actions;

    return (
      <AddTokenDialog
        onClose={() => {
          txBuilderActions.deselectToken.trigger();
          this.generated.actions.dialogs.closeActiveDialog.trigger();
        }}
        spendableBalance={this.generated.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.generated.stores.tokenInfoStore.tokenInfo)}
        updateAmount={(value: ?BigNumber) => txBuilderActions.updateAmount.trigger(value)}
        calculateMinAda={this.calculateMinAda}
        onAddToken={txBuilderActions.addToken.trigger}
        onRemoveTokens={txBuilderActions.removeTokens.trigger}
        shouldAddMoreTokens={this.shouldAddMoreTokens}
        plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
        selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
      />
    );
  };

  @computed get generated(): {|
    WalletSendConfirmationDialogContainerProps: InjectedOrGenerated<WalletSendConfirmationDialogContainerData>,
    actions: {|
      ada: {|
        ledgerSend: {|
          cancel: {| trigger: (params: void) => void |},
          init: {| trigger: (params: void) => void |},
          sendUsingLedgerWallet: {|
            trigger: (params: {|
              params: SendUsingLedgerParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>,
          |},
        |},
        trezorSend: {|
          cancel: {| trigger: (params: void) => void |},
          sendUsingTrezor: {|
            trigger: (params: {|
              params: SendUsingTrezorParams,
              publicDeriver: PublicDeriver<>,
              onSuccess?: void => void,
            |}) => Promise<void>,
          |},
        |},
      |},
      txBuilderActions: {|
        calculateMaxAmount: {|
          trigger: (params: void) => Promise<void>,
        |},
        reset: {|
          trigger: (params: void) => void,
        |},
        updateSendAllStatus: {|
          trigger: (params: boolean | void) => void,
        |},
        updateAmount: {|
          trigger: (params: ?BigNumber) => void,
        |},
        addToken: {|
          trigger: (params: {|
            token?: $ReadOnly<TokenRow>,
            shouldReset?: boolean,
          |}) => void,
        |},
        deselectToken: {|
          trigger: void => void,
        |},
        removeTokens: {|
          trigger: (params: Array<$ReadOnly<TokenRow>>) => void,
        |},
        updateMemo: {|
          trigger: (params: void | string) => void,
        |},
        updateReceiver: {|
          trigger: (params: void | string) => void,
        |},
        updateTentativeTx: {|
          trigger: (params: void) => void,
        |},
      |},
      wallets: {|
        sendMoney: {|
          trigger: (params: {|
            password: string,
            publicDeriver: PublicDeriver<>,
            signRequest: ISignRequest<any>,
            onSuccess?: void => void,
          |}) => Promise<void>,
        |},
      |},
      dialogs: {|
        closeActiveDialog: {|
          trigger: (params: void) => void,
        |},
        push: {|
          trigger: (params: {|
            dialog: any,
            params?: any,
          |}) => void,
        |},
      |},
      memos: {|
        closeMemoDialog: {| trigger: (params: void) => void |},
      |},
      router: {|
        goToRoute: {|
          trigger: (params: {|
            publicDeriver?: null | PublicDeriver<>,
            params?: ?any,
            route: string,
          |}) => void,
        |},
      |},
    |},
    initialShowMemoState: boolean,
    stores: {|
      coinPriceStore: {|
        getCurrentPrice: (from: string, to: string) => ?string,
      |},
      loading: {|
        resetUriParams: void => void,
        uriParams: ?UriParams,
      |},
      memos: {|
        hasSetSelectedExternalStorageProvider: boolean,
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
        unitOfAccount: UnitOfAccountSettingType,
      |},
      transactionBuilderStore: {|
        createUnsignedTx: {|
          error: ?LocalizableError,
          isExecuting: boolean,
        |},
        fee: ?MultiToken,
        shouldSendAll: boolean,
        tentativeTx: null | ISignRequest<any>,
        totalInput: ?MultiToken,
        txMismatch: boolean,
        isDefaultIncluded: boolean,
        selectedToken: void | $ReadOnly<TokenRow>,
        memo: void | string,
        maxAssetsAllowed: number,
        plannedTxInfoMap: Array<{|
          token: $ReadOnly<TokenRow>,
          amount?: string,
          shouldSendAll?: boolean,
        |}>,
        minAda: ?MultiToken,
        calculateMinAda: (Array<{| token: $ReadOnly<TokenRow> |}>) => string,
        maxSendableAmount: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          result: ?BigNumber,
        |},
      |},
      substores: {|
        ada: {|
          ledgerSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean,
          |},
          trezorSend: {|
            error: ?LocalizableError,
            isActionProcessing: boolean,
          |},
        |},
      |},
      transactions: {|
        hasAnyPending: boolean,
        balance: ?MultiToken,
      |},
      uiDialogs: {|
        getParam: <T>(number | string) => T,
        isOpen: any => boolean,
      |},
      wallets: {|
        selected: null | PublicDeriver<>,
        sendMoneyRequest: {|
          error: ?LocalizableError,
          isExecuting: boolean,
          reset: () => void,
        |},
      |},
    |},
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
          sendMoneyRequest: {
            isExecuting: stores.wallets.sendMoneyRequest.isExecuting,
            reset: stores.wallets.sendMoneyRequest.reset,
            error: stores.wallets.sendMoneyRequest.error,
          },
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
          balance: stores.transactions.balance,
        },
        transactionBuilderStore: {
          totalInput: stores.transactionBuilderStore.totalInput,
          fee: stores.transactionBuilderStore.fee,
          minAda: stores.transactionBuilderStore.minAda,
          shouldSendAll: stores.transactionBuilderStore.shouldSendAll,
          tentativeTx: stores.transactionBuilderStore.tentativeTx,
          txMismatch: stores.transactionBuilderStore.txMismatch,
          isDefaultIncluded: stores.transactionBuilderStore.isDefaultIncluded,
          createUnsignedTx: {
            isExecuting: stores.transactionBuilderStore.createUnsignedTx.isExecuting,
            error: stores.transactionBuilderStore.createUnsignedTx.error,
          },
          selectedToken: stores.transactionBuilderStore.selectedToken,
          memo: stores.transactionBuilderStore.memo,
          plannedTxInfoMap: stores.transactionBuilderStore.plannedTxInfoMap,
          maxAssetsAllowed: stores.transactionBuilderStore.maxAssetsAllowed,
          calculateMinAda: stores.transactionBuilderStore.calculateMinAda,
          maxSendableAmount: {
            isExecuting: stores.transactionBuilderStore.maxSendableAmount.isExecuting,
            error: stores.transactionBuilderStore.maxSendableAmount.error,
            result: stores.transactionBuilderStore.maxSendableAmount.result,
          },
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
        wallets: {
          sendMoney: {
            trigger: actions.wallets.sendMoney.trigger,
          },
        },
        router: {
          goToRoute: { trigger: actions.router.goToRoute.trigger },
        },
        memos: {
          closeMemoDialog: {
            trigger: actions.memos.closeMemoDialog.trigger,
          },
        },
        txBuilderActions: {
          updateTentativeTx: { trigger: actions.txBuilderActions.updateTentativeTx.trigger },
          updateReceiver: { trigger: actions.txBuilderActions.updateReceiver.trigger },
          updateAmount: { trigger: actions.txBuilderActions.updateAmount.trigger },
          addToken: { trigger: actions.txBuilderActions.addToken.trigger },
          deselectToken: { trigger: actions.txBuilderActions.deselectToken.trigger },
          removeTokens: { trigger: actions.txBuilderActions.removeTokens.trigger },
          updateSendAllStatus: { trigger: actions.txBuilderActions.updateSendAllStatus.trigger },
          reset: { trigger: actions.txBuilderActions.reset.trigger },
          updateMemo: { trigger: actions.txBuilderActions.updateMemo.trigger },
          calculateMaxAmount: {
            trigger: actions.txBuilderActions.calculateMaxAmount.trigger,
          },
        },
        ada: {
          ledgerSend: {
            init: { trigger: actions.ada.ledgerSend.init.trigger },
            cancel: { trigger: actions.ada.ledgerSend.cancel.trigger },
            sendUsingLedgerWallet: {
              trigger: actions.ada.ledgerSend.sendUsingLedgerWallet.trigger,
            },
          },
          trezorSend: {
            cancel: { trigger: actions.ada.trezorSend.cancel.trigger },
            sendUsingTrezor: { trigger: actions.ada.trezorSend.sendUsingTrezor.trigger },
          },
        },
      },
      initialShowMemoState: (false: boolean),
      WalletSendConfirmationDialogContainerProps: ({
        actions,
        stores,
      }: InjectedOrGenerated<WalletSendConfirmationDialogContainerData>),
    });
  }
}

export default (withLayout(WalletSendPage): ComponentType<Props>);
