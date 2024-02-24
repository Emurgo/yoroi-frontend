// @flow
import type { ComponentType, Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import type { $npm$ReactIntl$IntlFormat } from 'react-intl';
import { defineMessages, intlShape } from 'react-intl';
import { ROUTES } from '../../routes-config';
import type { StoresAndActionsProps } from '../../types/injectedPropsType';

import WalletSendFormClassic from '../../components/wallet/send/WalletSendForm';
import WalletSendFormRevamp from '../../components/wallet/send/WalletSendFormRevamp';

// Web Wallet Confirmation
import WalletSendConfirmationDialogContainer from './dialogs/WalletSendConfirmationDialogContainer';
import WalletSendConfirmationDialog from '../../components/wallet/send/WalletSendConfirmationDialog';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';
import { isLedgerNanoWallet, isTrezorTWallet, } from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { HaskellShelleyTxSignRequest } from '../../api/ada/transactions/shelley/HaskellShelleyTxSignRequest';
import { getMinimumValue, validateAmount } from '../../utils/validations';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import TransactionSuccessDialog from '../../components/wallet/send/TransactionSuccessDialog';
import type { LayoutComponentMap } from '../../styles/context/layout';
import { withLayout } from '../../styles/context/layout';

// Hardware Wallet Confirmation
import HWSendConfirmationDialog from '../../components/wallet/send/HWSendConfirmationDialog';
import globalMessages from '../../i18n/global-messages';
import AddNFTDialog from '../../components/wallet/send/WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from '../../components/wallet/send/WalletSendFormSteps/AddTokenDialog';
import { ampli } from '../../../ampli/index';

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

type Props = {|
  ...StoresAndActionsProps,
|};
type InjectedLayoutProps = {|
  +renderLayoutComponent: LayoutComponentMap => Node,
  +selectedLayout: string,
|};
type AllProps = {| ...Props, ...InjectedLayoutProps |};

@observer
class WalletSendPage extends Component<AllProps> {
  static contextTypes: {| intl: $npm$ReactIntl$IntlFormat |} = {
    intl: intlShape.isRequired,
  };

  @observable showMemo: boolean = false;
  @observable showSupportedAddressDomainBanner: boolean = true;

  closeTransactionSuccessDialog: void => void = () => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
    this.props.actions.router.goToRoute.trigger({ route: ROUTES.WALLETS.TRANSACTIONS });
  };

  openTransactionSuccessDialog: void => void = () => {
    this.props.actions.dialogs.push.trigger({
      dialog: TransactionSuccessDialog,
    });
  };

  componentDidMount(): void {
    runInAction(() => {
      this.showMemo = false;
      this.showSupportedAddressDomainBanner =
        this.props.stores.substores.ada.addresses.getSupportedAddressDomainBannerState();
    });
    ampli.sendInitiated();
  }

  @action
  toggleShowMemo: void => void = () => {
    this.showMemo = !this.showMemo;
    this.props.actions.memos.closeMemoDialog.trigger();
  };

  openDialog: any => void = dialog => {
    this.props.actions.dialogs.closeActiveDialog.trigger();
    this.props.actions.dialogs.push.trigger({
      dialog,
    });
  };

  @action
  onSupportedAddressDomainBannerClose: void => void = () => {
    this.props.stores.substores.ada.addresses.setSupportedAddressDomainBannerState(false);
    this.showSupportedAddressDomainBanner = false;
  };

  _getNumDecimals(): number {
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );
    const getTokenInfo = genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo);
    const info = getTokenInfo({
      identifier: defaultToken.Identifier,
      networkId: defaultToken.NetworkId,
    });
    return info.Metadata.numberOfDecimals;
  }

  render(): Node {
    const publicDeriver = this.props.stores.wallets.selected;
    // Guard against potential null values
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(WalletSendPage)}.`);

    const { transactionBuilderStore } = this.props.stores;

    const { uiDialogs, profile } = this.props.stores;
    const { actions } = this.props;
    const { hasAnyPending } = this.props.stores.transactions;
    const { txBuilderActions } = this.props.actions;

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

    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(
      publicDeriver.getParent().getNetworkInfo().NetworkId
    );

    if (this.props.selectedLayout === 'REVAMP') {
      const addressStore = this.props.stores.substores.ada.addresses;
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
            selectedNetwork={publicDeriver.getParent().getNetworkInfo()}
            selectedWallet={publicDeriver}
            selectedExplorer={this.props.stores.explorers.selectedExplorer}
            selectedToken={transactionBuilderStore.selectedToken}
            defaultToken={defaultToken}
            getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
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
            uriParams={this.props.stores.loading.uriParams}
            resetUriParams={this.props.stores.loading.resetUriParams}
            memo={transactionBuilderStore.memo}
            showMemo={this.showMemo}
            updateMemo={(content: void | string) => txBuilderActions.updateMemo.trigger(content)}
            onAddMemo={() =>
              this.showMemoDialog({
                dialog: MemoNoExternalStorageDialog,
                continuation: this.toggleShowMemo,
              })}
            spendableBalance={this.props.stores.transactions.balance}
            onAddToken={txBuilderActions.addToken.trigger}
            onRemoveTokens={txBuilderActions.removeTokens.trigger}
            plannedTxInfoMap={transactionBuilderStore.plannedTxInfoMap}
            isDefaultIncluded={transactionBuilderStore.isDefaultIncluded}
            openDialog={this.openDialog}
            closeDialog={this.props.actions.dialogs.closeActiveDialog.trigger}
            isOpen={uiDialogs.isOpen}
            openTransactionSuccessDialog={this.openTransactionSuccessDialog.bind(this)}
            unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
            getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
            calculateMaxAmount={txBuilderActions.calculateMaxAmount.trigger}
            maxSendableAmount={transactionBuilderStore.maxSendableAmount}
            signRequest={transactionBuilderStore.tentativeTx}
            staleTx={transactionBuilderStore.txMismatch}
            sendMoneyRequest={this.props.stores.wallets.sendMoneyRequest}
            sendMoney={this.props.actions.wallets.sendMoney.trigger}
            ledgerSendError={this.props.stores.substores.ada.ledgerSend.error || null}
            trezorSendError={this.props.stores.substores.ada.trezorSend.error || null}
            ledgerSend={this.props.actions.ada.ledgerSend}
            trezorSend={this.props.actions.ada.trezorSend}
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
          getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
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
          uriParams={this.props.stores.loading.uriParams}
          resetUriParams={this.props.stores.loading.resetUriParams}
          showMemo={this.showMemo}
          onAddMemo={() => this.showMemoDialog({
            dialog: MemoNoExternalStorageDialog,
            continuation: this.toggleShowMemo,
          })}
          spendableBalance={this.props.stores.transactions.balance}
          onAddToken={txBuilderActions.addToken.trigger}
          selectedToken={transactionBuilderStore.selectedToken}
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
      return (
        <TransactionSuccessDialog
          onClose={this.closeTransactionSuccessDialog}
          classicTheme={this.props.stores.profile.isClassicTheme}
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
    const { actions, stores } = this.props;
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);

    const { transactionBuilderStore } = this.props.stores;
    if (!transactionBuilderStore.tentativeTx) {
      throw new Error(`${nameof(this.webWalletDoConfirmation)}::should never happen`);
    }
    const signRequest = transactionBuilderStore.tentativeTx;

    return (
      <WalletSendConfirmationDialogContainer
        actions={actions}
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
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver)
      throw new Error(`Active wallet required for ${nameof(this.webWalletDoConfirmation)}.`);
    const { transactionBuilderStore } = this.props.stores;
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
      this.props.stores.explorers.selectedExplorer.get(
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
      const ledgerSendAction = this.props.actions.ada.ledgerSend;
      ledgerSendAction.init.trigger();
      const ledgerSendStore = this.props.stores.substores.ada.ledgerSend;
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
            () => ledgerSendAction.sendUsingLedgerWallet.trigger({
              params: { signRequest },
              publicDeriver,
              onSuccess: this.openTransactionSuccessDialog,
            })
          }
          onCancel={ledgerSendAction.cancel.trigger}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
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
      const trezorSendAction = this.props.actions.ada.trezorSend;
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
            () => trezorSendAction.sendUsingTrezor.trigger({
              params: { signRequest },
              publicDeriver,
              onSuccess: this.openTransactionSuccessDialog,
            })
          }
          onCancel={trezorSendAction.cancel.trigger}
          unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
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
    if (this.props.stores.memos.hasSetSelectedExternalStorageProvider) {
      return request.continuation();
    }

    this.props.actions.dialogs.push.trigger({
      dialog: request.dialog,
      params: {
        continuation: request.continuation,
      },
    });
  };

  noCloudWarningDialog: void => Node = () => {
    const { actions } = this.props;
    return (
      <MemoNoExternalStorageDialog
        onCancel={actions.memos.closeMemoDialog.trigger}
        addExternal={() => {
          actions.memos.closeMemoDialog.trigger();
          actions.router.goToRoute.trigger({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
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
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AddNFTDialog)}.`);

    const { transactionBuilderStore } = this.props.stores;
    const { txBuilderActions } = this.props.actions;

    return (
      <AddNFTDialog
        onClose={this.props.actions.dialogs.closeActiveDialog.trigger}
        spendableBalance={this.props.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
        classicTheme={this.props.stores.profile.isClassicTheme}
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
    const publicDeriver = this.props.stores.wallets.selected;
    if (!publicDeriver) throw new Error(`Active wallet required for ${nameof(AddTokenDialog)}.`);

    const { transactionBuilderStore } = this.props.stores;
    const { txBuilderActions } = this.props.actions;

    return (
      <AddTokenDialog
        onClose={() => {
          txBuilderActions.deselectToken.trigger();
          this.props.actions.dialogs.closeActiveDialog.trigger();
        }}
        spendableBalance={this.props.stores.transactions.balance}
        getTokenInfo={genLookupOrFail(this.props.stores.tokenInfoStore.tokenInfo)}
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
}

export default (withLayout(WalletSendPage): ComponentType<Props>);
