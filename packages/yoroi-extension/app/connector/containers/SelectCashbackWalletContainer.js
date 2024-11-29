// @flow
import { Component, type Node } from 'react';
import ConnectPage from '../components/connect/ConnectPage';
import { observer } from 'mobx-react';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { WalletState } from '../../../chrome/extension/background/types';
import { setCashbackWallet } from '../../api/thunk';
import type { ConnectorStoresAndActionsProps } from '../../types/injectedProps.types';

@observer
export default class SelectCashbackWalletContainer extends Component<ConnectorStoresAndActionsProps> {
  componentDidMount() {
    this.props.actions.connector.refreshWallets.trigger();
  }

  onCancel() {
    window.close();
  }

  onSelectWallet(wallet: WalletState) {
    setCashbackWallet(wallet.publicDeriverId);
    window.close();
  }

  render(): Node {
    const { stores, actions } = this.props;

    return (
      <ConnectPage
        selectedWallet={{ index: -1, deriver: undefined, checksum: undefined }} // placeholder
        onConnect={async () => {}} // placeholder
        onCancel={this.onCancel}
        isAppAuth={false} // na
        hidePasswordForm={() => {}} // placeholder
        loading={stores.connector.loadingWallets}
        error={''} // na
        message={null} // na
        publicDerivers={stores.connector.wallets}
        onSelectWallet={this.onSelectWallet}
        network="Cardano"
        getTokenInfo={genLookupOrFail(stores.tokenInfoStore.tokenInfo)}
        shouldHideBalance={stores.profile.shouldHideBalance}
        unitOfAccount={stores.profile.unitOfAccount}
        getCurrentPrice={stores.coinPriceStore.getCurrentPrice}
        onUpdateHideBalance={actions.profile.updateHideBalance.trigger}
        isSelectingCashbackWallet
      />
    );
  }
}

