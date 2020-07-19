// @flow

import BaseDaedalusTransferStore from '../base/BaseDaedalusTransferStore';
import {
  buildDaedalusTransferTx,
} from '../../api/ada/transactions/transfer/legacyDaedalus';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import type { ActionsMap } from '../../actions/index';
import type { StoresMap } from '../index';
import type { Api } from '../../api/index';

export default class AdaDaedalusTransferStore extends BaseDaedalusTransferStore {

  constructor(stores: StoresMap, api: Api, actions: ActionsMap) {
    super(
      stores, api, actions,
      async (request) => {
        const { selectedNetwork } = stores.profile;
        if (selectedNetwork == null) throw new Error(`buildTxFunc no network selected`);

        return await buildDaedalusTransferTx({
          addressKeys: request.addressKeys,
          outputAddr: request.outputAddr,
          getUTXOsForAddresses:
            stores.substores.ada.stateFetchStore.fetcher.getUTXOsForAddresses,
          legacy: selectedNetwork.NetworkId !== networks.JormungandrMainnet.NetworkId
        });
      }
    );
  }
}
