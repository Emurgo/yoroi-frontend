// @flow

import Store from '../base/Store';
import {
  buildDaedalusTransferTx,
} from '../../api/ada/transactions/transfer/legacyDaedalus';
import { isJormungandr } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { BuildTxFunc } from '../toplevel/DaedalusTransferStore';

export default class AdaDaedalusTransferStore extends Store {

  buildTx: BuildTxFunc = async (request) => {
    const selectedNetwork = this.stores.profile.selectedNetwork;
    if (selectedNetwork == null) throw new Error(`${nameof(AdaDaedalusTransferStore)} transfer tx no selected network`);
    return await buildDaedalusTransferTx({
      addressKeys: request.addressKeys,
      outputAddr: request.outputAddr,
      getUTXOsForAddresses:
        this.stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
      legacy: !isJormungandr(selectedNetwork)
    });
  }
}
