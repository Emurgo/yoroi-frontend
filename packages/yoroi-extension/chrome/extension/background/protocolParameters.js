// @flow

import type { ProtocolParameters } from '@emurgo/yoroi-lib/protocol-parameters/models';
import {
  getNetworkById,
  getCardanoHaskellBaseConfig,
  networks,
} from '../../../app/api/ada/lib/storage/database/prepackaged/networks';


const EpochTimestamp = Object.freeze({
  CardanoMainnet: {},
  CardanoTestnet: {},
  CardanoPreprodTestnet: {},
  CardanoPreviewTestnet: {},
  CardanoSanchoTestnet: {},
});
// type assertion to ensure we have every network in `EpochTimestam`
(networks: {| [$Keys<typeof EpochTimestamp>]: any |});

class PerNetworkProcolParameterHandler {
  #networkId: number;

  constructor(networkId: number) {
    this.#networkId = networkId;
  }

  getCurrentEpoch(): number {
    const config = getCardanoHaskellBaseConfig(
      getNetworkById(this.#networkId)
    ).reduce((acc, next) => Object.assign(acc, next), {});
    const { SlotsPerEpoch, SlotDuration } = config;

    return 1;
  }
}

