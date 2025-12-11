import { Component } from 'react';
import type { StoresProps } from '../../stores';
import SingleAddress from '../../components/wallet/receive/SingleAddress';
import { addressHexToBech32 } from '../../api/ada/lib/cardanoCrypto/utils';
import { CoreAddressTypes } from '../../api/ada/lib/storage/database/primitives/enums';

export default class SingleAddressReceivePage extends Component<StoresProps> {
  render() {
    const { stores } = this.props;
    const firstAddress = stores.wallets.selectedOrFail.allAddresses.utxoAddresses.find(a => a.address.Type === CoreAddressTypes.CARDANO_BASE);
    const walletAddress = addressHexToBech32(
      firstAddress.address.Hash
    );

    const selectedExplorerForNetwork =
      stores.explorers.selectedExplorer.get(stores.wallets.selectedOrFail.networkId) ??
      (() => {
        throw new Error('No explorer for wallet network');
      })();

    return (
          <SingleAddress
            walletAddress={walletAddress}
            selectedExplorer={selectedExplorerForNetwork}
            isWalletAddressUsed={firstAddress.IsUsed}
            onCopyAddressTooltip={()=>{}}
          />
    );
  }
}
