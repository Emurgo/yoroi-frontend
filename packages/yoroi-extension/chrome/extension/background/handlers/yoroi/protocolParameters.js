// @flow
import type { HandlerType } from './type';
import type {
  ProtocolParameters as _ProtocolParameters
} from '@emurgo/yoroi-lib/dist/protocol-parameters/models';
import { ProtocolParametersApi } from '@emurgo/yoroi-lib/dist/protocol-parameters/emurgo-api';
import {
  getNetworkById,
  getCardanoHaskellBaseConfigCombined,
  networks,
} from '../../../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type {
  CardanoHaskellConfig,
  NetworkRow,
} from '../../../../../app/api/ada/lib/storage/database/primitives/tables';
import {
  type StorageField,
  createStorageField,
} from '../../../../../app/api/localStorage';

// tmp measure before lib update
type ProtocolParameters = {|
  ...$Exact<_ProtocolParameters>,
  epoch: number,
|};

// cache protocol parameters of the current epoch
// also may cache for the future epoch should the backend provides them
type ProtocolParameterCache = Array<ProtocolParameters>;

function validate(protocolParameters: Object): boolean {
  const decNumRegex = /^\d+$/;
  return (
    typeof protocolParameters?.linearFee?.constant === 'string' &&
    decNumRegex.test(protocolParameters?.linearFee?.constant) &&
    typeof protocolParameters?.linearFee?.coefficient === 'string' &&
    decNumRegex.test(protocolParameters?.linearFee?.coefficient) &&
    typeof protocolParameters?.coinsPerUtxoByte === 'string' &&
    decNumRegex.test(protocolParameters?.coinsPerUtxoByte) &&
    typeof protocolParameters?.poolDeposit === 'string' &&
    decNumRegex.test(protocolParameters?.poolDeposit) &&
    typeof protocolParameters?.keyDeposit === 'string' &&
    decNumRegex.test(protocolParameters?.keyDeposit) &&
    typeof protocolParameters.epoch === 'number'
  );
}

const  EPOCH_TIMESTAMP = Object.freeze({
  CardanoMainnet: {
    epoch: 504,
    startTimestamp: 1723931091000, // Aug 18, 2024 5:44:51 AM
  },
  CardanoPreprodTestnet: {
    epoch: 162,
    startTimestamp: 1724025600000, // Aug 19, 2024 8:00:00 AM
  },
  CardanoPreviewTestnet: {
    epoch: 665,
    startTimestamp: 1724112000000, // Aug 20, 2024 8:00:00 AM
  },
  CardanoSanchoTestnet: {
    epoch: 431,
    startTimestamp: 1724027420000, // 08/19/2024, 08:30:20
  },
});
// type assertion to ensure we have every network in `EpochTimestam`
(networks: {| [$Keys<typeof EPOCH_TIMESTAMP>]: any |});

class ProcolParameterApi {
  #networkId: number;

  constructor(networkId: number) {
    this.#networkId = networkId;
  }

  getNetworkKey(): string {
    for (const key of Object.keys(networks)) {
      if (networks[key].NetworkId === this.#networkId) {
        return key;
      }
    }
    throw new Error('nonexistent network id');
  }

  getNetwork(): $ReadOnly<NetworkRow> {
    const network = getNetworkById(this.#networkId);
    if (!network) {
      throw new Error('unexpectedly missing network');
    }
    return network;
  }

  getConfig(): CardanoHaskellConfig {
    return getCardanoHaskellBaseConfigCombined(getNetworkById(this.#networkId));
  }

  getEpochData(): {|
    currentEpoch: number,
  |} {
    const { SlotsPerEpoch, SlotDuration } = this.getConfig();
    if (SlotsPerEpoch == null || SlotDuration == null) {
      throw new Error('unexpectedly missing epoch length data');
    }
    const { epoch, startTimestamp } = EPOCH_TIMESTAMP[this.getNetworkKey()];

    const now = Date.now();
    const delta = now - startTimestamp;
    const currentEpoch = epoch + Math.floor(delta / (SlotsPerEpoch * SlotDuration * 1000));

    return { currentEpoch };
  }

  getDefaultProtocolParameters(): ProtocolParameters {
    const { currentEpoch } = this.getEpochData();
    const config = this.getConfig();
    if (!config.LinearFee || !config.CoinsPerUtxoByte || !config.PoolDeposit || !config.KeyDeposit) {
      throw new Error('unexpectedly missing config parameters');
    }

    return   {
      linearFee: {
        constant: config.LinearFee.constant,
        coefficient: config.LinearFee.coefficient,
      },
      coinsPerUtxoByte: config.CoinsPerUtxoByte,
      poolDeposit: config.PoolDeposit,
      keyDeposit: config.KeyDeposit,
      epoch: currentEpoch,
  };
  }

  getCacheStorage(): StorageField<ProtocolParameterCache | null> {
    return createStorageField<ProtocolParameterCache | null>(
      'PROTOCOL_PARAMETERS_' + this.#networkId,
      JSON.stringify,
      JSON.parse,
      null
    );
  }

  async getCachedProtocolParameters(
    epoch: number,
    allowFallbackToPreviousEpoch: boolean
  ): Promise<?ProtocolParameters> {
    const storage = this.getCacheStorage();
    const cache = await storage.get();
    if (!cache) {
      return null;
    }
    return cache.find((protocolParameters) => {
      if (allowFallbackToPreviousEpoch) {
        return protocolParameters.epoch <= epoch;
      }
      return protocolParameters.epoch === epoch;
    });
  }

  async cacheProtocolParameters(protocolParameters: ProtocolParameters): Promise<void> {
    const storage = this.getCacheStorage();
    let cache = await storage.get();
    if (!cache) {
      cache = [];
    }
    cache = cache.filter(( { epoch } ) => epoch > protocolParameters.epoch);
    cache.push(protocolParameters);
    await storage.set(cache);
  }

  async fetchProtocolParametersFromNetwork(): Promise<ProtocolParameters | null> {
    const { BackendServiceZero } = this.getNetwork().Backend;
    const api = new ProtocolParametersApi(BackendServiceZero);
    const protocolParameters: Object = await api.getParameters();

    if (!validate(protocolParameters)) {
      return null;
    }
    await this.cacheProtocolParameters(protocolParameters);
    return protocolParameters;
  }

  async getProtocolParameters(): Promise<ProtocolParameters> {
    const { currentEpoch } = this.getEpochData();
    const cached = await this.getCachedProtocolParameters(currentEpoch, false);
    if (cached) {
      return cached;
    }
    try {
      const fetched = await this.fetchProtocolParametersFromNetwork();
      if (fetched) {
        return fetched;
      }
    } catch (error) {
      console.error(
        'failed to fetch protocol parameters for network %s epoch $S:',
        this.#networkId,
        currentEpoch,
        error
      );
    }
    const cachedPrevious = await this.getCachedProtocolParameters(currentEpoch, true);
    if (cachedPrevious) {
      return cachedPrevious;
    }
    return this.getDefaultProtocolParameters();
  }
}

export const GetProtocolParameters: HandlerType<
  {| networkId: number |},
  ProtocolParameters
> = Object.freeze({
  typeTag: 'get-protocol-parameters',

  handle: async (request) => {
    const api = new ProcolParameterApi(request.networkId);
    return await api.getProtocolParameters();
  },
});

export const getProtocolParameters: (number) => Promise<ProtocolParameters> =
 (networkId) => GetProtocolParameters.handle({ networkId });

export async function updateProtocolParametersCacheFromNetwork(networkId: number, epoch: ?number) {
  const api = new ProcolParameterApi(networkId);
  if (epoch == null || await api.getCachedProtocolParameters(epoch, false) == null) {
    await api.fetchProtocolParametersFromNetwork();
  }
}
