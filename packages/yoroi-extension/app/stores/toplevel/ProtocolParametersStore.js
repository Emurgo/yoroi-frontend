// @flow
// All legacy code base expects the protocol parameters to be accessible synchronously. So this store caches
// the protocol parameters to make it accessible synchronously.

import Store from '../base/Store';
import type { ProtocolParameters } from '@emurgo/yoroi-lib/dist/protocol-parameters/models';

export default class ProtocolParametersStore<
  StoresMapType: { ... }, // no dependency on other stores
> extends Store<StoresMapType, {...}> {
  cache: Map<number, ProtocolParameters> = new Map();

  async loadProtocolParameters(): Promise<void> {
  }

  getProtocolParameters(networkId: number): ProtocolParameters {
    const protocolParameters = this.cache.get(networkId);
    if (protocolParameters == null) {
      throw new Error(`unexpectedly missing protocol parameters for network id ${networkId}`);
    }
    return protocolParameters;
  }
}
