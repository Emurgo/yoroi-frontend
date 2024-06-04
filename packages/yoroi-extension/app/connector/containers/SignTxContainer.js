// @flow
import type { Node } from 'react';
import type { ConnectorStoresAndActionsProps } from '../../types/injectedProps.types';
import { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, runInAction } from 'mobx';
import config from '../../config';
import globalMessages from '../../i18n/global-messages';
import CardanoSignTxPage from '../components/signin/CardanoSignTxPage';
import { genLookupOrNull } from '../../stores/stateless/tokenHelpers';
import VerticallyCenteredLayout from '../../components/layout/VerticallyCenteredLayout';
import FullscreenLayout from '../../components/layout/FullscreenLayout';
import LoadingSpinner from '../../components/widgets/LoadingSpinner';
import { addressToDisplayString } from '../../api/ada/lib/storage/bridge/utils';
import { Box } from '@mui/material';
import AddCollateralPage from '../components/signin/AddCollateralPage';
import {
  isLedgerNanoWallet,
  isTrezorTWallet,
} from '../../api/ada/lib/storage/models/ConceptualWallet/index';
import { WalletTypeOption } from '../../api/ada/lib/storage/models/ConceptualWallet/interfaces';

@observer
export default class SignTxContainer extends Component<
  ConnectorStoresAndActionsProps
> {
  @observable notificationElementId: string = '';

  onUnload: (SyntheticEvent<>) => void = ev => {
    ev.preventDefault();
    this.props.actions.connector.cancelSignInTx.trigger();
  };

  componentDidMount() {
    this.props.actions.connector.refreshWallets.trigger();
    window.addEventListener('beforeunload', this.onUnload);
    window.addEventListener('unload', this.onUnload);
  }

  onConfirm: (WalletState) => string => Promise<void> = deriver => async password => {
    const { signingMessage } = this.props.stores.connector;
    if (signingMessage == null) {
      throw new Error('missing the signing message');
    }
    const connectedWallet = this.props.stores.connector.filteredWallets.find(
      wallet => wallet.publicDeriverId === signingMessage.publicDeriverId
    );
    if (connectedWallet == null) {
      throw new Error('missing connected wallet');
    }

    if (connectedWallet.type === 'mnemonic') {
      // will throw a WrongPasswordError if password is wrong
      await getPrivateStakingKey({ publicDeriverId: deriver.publicDeriverId, password });
    }
    window.removeEventListener('beforeunload', this.onUnload);
    window.removeEventListener('unload', this.onUnload);

    await this.props.actions.connector.confirmSignInTx.trigger(password);
  };
  onCancel: () => void = () => {
    window.removeEventListener('beforeunload', this.onUnload);
    window.removeEventListener('unload', this.onUnload);
    this.props.actions.connector.cancelSignInTx.trigger();
    setTimeout(() => { window.close(); }, 100);
  };

  renderLoading(): Node {
    return (
      <FullscreenLayout bottomPadding={0}>
        <VerticallyCenteredLayout>
          <LoadingSpinner />
        </VerticallyCenteredLayout>
      </FullscreenLayout>
    );
  }

  renderError(errorMessage: string): Node {
    return (
      <FullscreenLayout bottomPadding={0}>
        {errorMessage}
      </FullscreenLayout>
    );
  }

  render(): Node {
    const actions = this.props.actions;
    const { uiNotifications } = this.props.stores;

    const { signingMessage, unrecoverableError } = this.props.stores.connector;
    if (unrecoverableError != null) return this.renderError(unrecoverableError);
    if (signingMessage == null) return this.renderLoading();

    const selectedWallet = this.props.stores.connector.filteredWallets.find(
      wallet => wallet.publicDeriverId === signingMessage.publicDeriverId
    );
    if (selectedWallet == null) return this.renderLoading();
    const whitelistEntries = this.props.stores.connector.currentConnectorWhitelist;
    const connectedWebsite = whitelistEntries.find(
      cacheEntry =>
        selectedWallet.publicDeriverId === cacheEntry.publicDeriverId &&
        cacheEntry.url === signingMessage.requesterUrl
    );

    const tooltipNotification = {
      duration: config.wallets.ADDRESS_COPY_TOOLTIP_NOTIFICATION_DURATION,
      message: globalMessages.copyTooltipMessage,
    };

    const handleCopyAddressTooltip = (address, elementId) => {
      if (!uiNotifications.isOpen(elementId)) {
        runInAction(() => {
          this.notificationElementId = elementId;
        });
        actions.notifications.open.trigger({
          id: elementId,
          duration: tooltipNotification.duration,
          message: tooltipNotification.message,
        });
      }
    };

    const getAddressToDisplay = addr =>
      addressToDisplayString(addr, getNetworkById(selectedWallet.networkId));

    const handleConfirm = password => this.onConfirm(selectedWallet)(password);

    const notification =
      this.notificationElementId == null
        ? null
        : uiNotifications.getTooltipActiveNotification(this.notificationElementId);

    const signData =
      signingMessage.sign.type === 'data'
        ? { address: signingMessage.sign.address, payload: signingMessage.sign.payload }
        : null;

    const selectedExplorer =
      this.props.stores.explorers.selectedExplorer.get(
        selectedWallet.networkId
      ) ??
      (() => {
        throw new Error('No explorer for wallet network');
      })();

    let component = null;

    // TODO: handle other sign types
    switch (signingMessage.sign.type) {
      case 'tx-reorg/cardano': {
        const txData = this.props.stores.connector.adaTransaction;
        if (txData == null && signData == null) return this.renderLoading();
        component = (
          <AddCollateralPage
            txData={txData}
            getTokenInfo={genLookupOrNull(this.props.stores.tokenInfoStore.tokenInfo)}
            onConfirm={handleConfirm}
            onCancel={this.onCancel}
            selectedExplorer={selectedExplorer}
            submissionError={this.props.stores.connector.submissionError}
            walletType={selectedWallet.type}
            hwWalletError={this.props.stores.connector.hwWalletError}
          />
        );
        break;
      }
      case 'data':
      case 'tx/cardano': {
        const txData = this.props.stores.connector.adaTransaction;
        if (txData == null && signData == null) return this.renderLoading();
        let tx;
        if (signingMessage.sign.type === 'tx/cardano') {
          tx = signingMessage.sign.tx.tx;
        } else {
          tx = '';
        }
        component = (
          <CardanoSignTxPage
            shouldHideBalance={this.props.stores.profile.shouldHideBalance}
            connectedWebsite={connectedWebsite}
            selectedWallet={selectedWallet}
            onCopyAddressTooltip={handleCopyAddressTooltip}
            notification={notification}
            txData={txData}
            getTokenInfo={genLookupOrNull(this.props.stores.tokenInfoStore.tokenInfo)}
            defaultToken={{
              defaultNetworkId: selectedWallet.networkId,
              defaultIdentifier: selectedWallet.defaultTokenId,
            }}
            network={getNetworkById(selectedWallet.networkId)}
            onConfirm={handleConfirm}
            onCancel={this.onCancel}
            addressToDisplayString={getAddressToDisplay}
            getCurrentPrice={this.props.stores.coinPriceStore.getCurrentPrice}
            selectedExplorer={selectedExplorer}
            unitOfAccountSetting={this.props.stores.profile.unitOfAccount}
            submissionError={this.props.stores.connector.submissionError}
            signData={signData}
            walletType={walletType}
            hwWalletError={this.props.stores.connector.hwWalletError}
            isHwWalletErrorRecoverable={this.props.stores.connector.isHwWalletErrorRecoverable}
            tx={tx}
          />
        );
        break;
      }
      default:
        component = null;
    }

    return <Box sx={{ height: 'calc(100vh - 52px)', bgcolor: 'white' }}>{component}</Box>;
  }
}
