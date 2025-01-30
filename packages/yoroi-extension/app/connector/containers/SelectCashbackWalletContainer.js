// @flow
import { Component, type Node } from 'react';
import ConnectPage from '../components/connect/ConnectPage';
import { observer } from 'mobx-react';
import { genLookupOrFail } from '../../stores/stateless/tokenHelpers';
import type { WalletState } from '../../../chrome/extension/background/types';
import { setCashbackWallet } from '../../api/thunk';
import type { ConnectorStoresProps } from '../stores';

@observer
export default class SelectCashbackWalletContainer extends Component<ConnectorStoresProps> {
  componentDidMount() {
    this.props.stores.connector.refreshWallets();
  }

  onSelectWallet(wallet: { +publicDeriverId: number, ... }) {
    setCashbackWallet(wallet.publicDeriverId);
    // must delay or the message gets lost
    setTimeout(window.close, 50);
  }

  render(): Node {
    const { stores } = this.props;

    return (
      <ConnectPage
        selectedWallet={{ index: -1, deriver: undefined, checksum: undefined }} // placeholder
        onConnect={async () => {}} // placeholder
        onCancel={() => this.onSelectWallet({ publicDeriverId: -1 })}
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
        onUpdateHideBalance={stores.profile.updateHideBalance}
        isSelectingCashbackWallet
      />
    );
  }
}

