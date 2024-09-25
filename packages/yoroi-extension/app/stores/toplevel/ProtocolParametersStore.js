// @flow
// Some legacy code expects the protocol parameters to be accessible synchronously. So this store caches
// the protocol parameters to make it accessible synchronously.

import Store from '../base/Store';
import type { ProtocolParameters } from '@emurgo/yoroi-lib/dist/protocol-parameters/models';
import { getProtocolParameters } from '../../api/thunk';
import { networks } from '../../api/ada/lib/storage/database/prepackaged/networks';
import LocalizedRequest from '../lib/LocalizedRequest';
import { observable } from 'mobx';

export default class ProtocolParametersStore<
  StoresMapType: { ... }, // no dependency on other stores
> extends Store<StoresMapType, {...}> {
  @observable loadProtocolParametersRequest: LocalizedRequest<() => Promise<void>> =
    new LocalizedRequest(() => this.loadProtocolParameters());

  cache: Map<number, ProtocolParameters> = new Map();

  async loadProtocolParameters(): Promise<void> {
    for (const key of Object.keys(networks)) {
      const networkId = networks[key].NetworkId;
      const protocolParameters = await getProtocolParameters({ networkId });
      this.cache.set(networkId, protocolParameters);
    }
  }

  getProtocolParameters(networkId: number): ProtocolParameters {
    const protocolParameters = this.cache.get(networkId);
    if (protocolParameters == null) {
      throw new Error(`unexpectedly missing protocol parameters for network id ${networkId}`);
    }
    return protocolParameters;
  }
}
