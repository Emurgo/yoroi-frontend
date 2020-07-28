// @flow

import Store from '../base/Store';
import {
  daedalusTransferTxFromAddresses,
} from '../../api/ada/transactions/transfer/legacyDaedalus';
import type { BuildTxFunc } from '../toplevel/DaedalusTransferStore';
import { getCardanoHaskellBaseConfig } from '../../api/ada/lib/storage/database/prepackaged/networks';

export default class AdaDaedalusTransferStore extends Store {

  buildTx: BuildTxFunc = async (request) => {
    const selectedNetwork = this.stores.profile.selectedNetwork;
    if (selectedNetwork == null) throw new Error(`${nameof(AdaDaedalusTransferStore)} transfer tx no selected network`);

    if (this.stores.profile.selectedNetwork == null) {
      throw new Error(`${nameof(AdaDaedalusTransferStore)}::${nameof(this.buildTx)} no network selected`);
    }
    const config = getCardanoHaskellBaseConfig(
      this.stores.profile.selectedNetwork
    ).reduce((acc, next) => Object.assign(acc, next), {});

    return await daedalusTransferTxFromAddresses({
      addressKeys: request.addressKeys,
      outputAddr: request.outputAddr,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      byronNetworkMagic: config.ByronNetworkId,
    });
  }
}
