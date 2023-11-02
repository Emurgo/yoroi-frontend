// @flow

import type { lf$Database } from 'lovefield';
import Store from '../base/Store';
import type { IFetcher } from '../../api/ada/lib/state-fetch/IFetcher';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';

const POLL_INTERVAL = 15 * 60 * 60 * 1000;

export default class ProtocolParametersStore<
  StoresMapType: {
    +loading: {
      +getDatabase: () => ?lf$Database,
      ...
    },
    +substores: {
      +ada: {
        +stateFetchStore: {
          +fetcher: IFetcher,
          ...
        },
        ...
      },
      ...
    },
    +wallets: {
      publicDerivers: Array<PublicDeriver<>>,
      ...
    },
    ...
  },
> extends Store<StoresMapType, {...}> {
  setup(): void {
    setInterval(this.updateProtocolParameters, POLL_INTERVAL);
  }

  updateProtocolParameters: () => Promise<void> = async () => {
    const db = this.stores.loading.getDatabase();
    if (db == null) {
      throw new Error(`db is unexpectedly missing`);
    }
    const changedNetworks = await this.api.ada.updateProtocolParametersForCardanoNetworks(
      db,
      this.stores.substores.ada.stateFetchStore.fetcher.getProtocolParameters,
    );
    // update network protocol parameters cached in memory
    for (const publicDeriver of this.stores.wallets.publicDerivers) {
      const originalNetwork = publicDeriver.getParent.getNetworkInfo();
      const changedNetwork = changedNetworks.find(
        network => network.NetworkId === originalNetwork.NetworkId
      );
      if (changedNetwork) {
        originalNetwork.BaseConfig = changedNetwork.BaseConfig;
      }
    }
  }
}
