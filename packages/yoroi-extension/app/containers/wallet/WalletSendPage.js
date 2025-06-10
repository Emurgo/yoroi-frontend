// @flow
import type { Node } from 'react';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import { IntlContext } from 'react-intl';
import { ROUTES } from '../../routes-config';
import WalletSendFormRevamp from '../../components/wallet/send/WalletSendFormRevamp';
import MemoNoExternalStorageDialog from '../../components/wallet/memos/MemoNoExternalStorageDialog';
import type { TokenRow } from '../../api/ada/lib/storage/database/primitives/tables';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import BigNumber from 'bignumber.js';
import TransactionSuccessDialog from '../../components/wallet/send/TransactionSuccessDialog';
import AddNFTDialog from '../../components/wallet/send/WalletSendFormSteps/AddNFTDialog';
import AddTokenDialog from '../../components/wallet/send/WalletSendFormSteps/AddTokenDialog';
import { ampli } from '../../../ampli/index';
import { getNetworkById } from '../../api/ada/lib/storage/database/prepackaged/networks';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import type { StoresProps } from '../../stores';
// $FlowIgnore: suppressing this error
import { ReviewTxProvider } from '../../UI/features/transaction-review/module/ReviewTxProvider';
// $FlowIgnore: suppressing this error
import { ReviewTxModal } from '../../UI/features/transaction-review/useCases/ReviewTx';
// $FlowIgnore: suppressing this error
import { ModalProvider } from '../../UI/components/modals/ModalContext';
// $FlowIgnore: suppressing this error
import { ModalManager } from '../../UI/components/modals/ModalManager';
// $FlowIgnore: suppressing this error
import { CurrencyProvider } from '../../UI/context/CurrencyContext';

@observer
export default class WalletSendPage extends Component<StoresProps> {
  static contextType:any = IntlContext;
  @observable showMemo: boolean = false;
  @observable showSupportedAddressDomainBanner: boolean = true;

  closeTransactionSuccessDialog: void => void = () => {
    const { stores } = this.props;
    const redirect = stores.loading.sellAdaParams?.redirect;
    if (redirect) {
      window.document.location = redirect;
    } else {
      this.props.stores.uiDialogs.closeActiveDialog();
      stores.routing.goToRoute({ route: ROUTES.WALLETS.TRANSACTIONS });
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
      this.showSupportedAddressDomainBanner = this.props.stores.substores.ada.addresses.getSupportedAddressDomainBannerState();
    });
    const { loadProtocolParametersRequest } = this.props.stores.protocolParameters;
    if (!loadProtocolParametersRequest.wasExecuted && !loadProtocolParametersRequest.isExecuting) {
      loadProtocolParametersRequest.reset();
      loadProtocolParametersRequest.execute();
    }
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
    const defaultToken = this.props.stores.tokenInfoStore.getDefaultTokenInfo(selected.networkId);
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

    const { uiDialogs, transactionBuilderStore, protocolParameters } = stores;

    if (!protocolParameters.loadProtocolParametersRequest.wasExecuted) {
      return (
        <FullscreenLayout bottomPadding={0}>
          <VerticallyCenteredLayout>
            <LoadingSpinner />
          </VerticallyCenteredLayout>
        </FullscreenLayout>
      );
    }

    const { hasAnyPending } = stores.transactions;

    // disallow sending when pending tx exists
    if (hasAnyPending) {
      stores.uiDialogs.closeActiveDialog();
    }

    const defaultToken = stores.tokenInfoStore.getDefaultTokenInfo(selected.networkId);
    const network = getNetworkById(selected.networkId);

    const addressStore = stores.substores.ada.addresses;
    const resolveDomainAddressFunc = addressStore.domainResolverSupported()
      ? addressStore.resolveDomainAddress.bind(addressStore)
      : null;
    return (
      <ModalProvider>
        <ModalManager />
        <CurrencyProvider currency={this.props.stores.profile.unitOfAccount.currency || 'USD'}>
          <ReviewTxProvider stores={stores} intl={this.context}>
            <ReviewTxModal />
            <WalletSendFormRevamp
              stores={this.props.stores}
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
              updateReceiver={(address: void | string, handle: void | {| handle: string, nameServer: string |}) =>
                transactionBuilderStore.updateReceiver({ address, handle })
              }
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
                })
              }
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
            />
            {this.renderDialog()}
          </ReviewTxProvider>
        </CurrencyProvider>
      </ModalProvider>
    );
  }

  renderDialog: () => Node = () => {
    const { uiDialogs } = this.props.stores;

    if (uiDialogs.isOpen(MemoNoExternalStorageDialog)) {
      return this.noCloudWarningDialog();
    }
    if (uiDialogs.isOpen(TransactionSuccessDialog)) {
      const process = this.props.stores.loading.sellAdaParams?.redirect ? 'for-sell' : 'normal';
      return <TransactionSuccessDialog process={process} onClose={this.closeTransactionSuccessDialog} />;
    }

    if (uiDialogs.isOpen(AddNFTDialog)) {
      return this.renderNFTDialog();
    }

    if (uiDialogs.isOpen(AddTokenDialog)) {
      return this.renderAddTokenDialog();
    }

    return '';
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
          stores.routing.goToRoute({ route: ROUTES.SETTINGS.EXTERNAL_STORAGE });
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

  shouldAddMoreTokens: (Array<{| token: $ReadOnly<TokenRow>, included: boolean |}>) => boolean = tokens => {
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
