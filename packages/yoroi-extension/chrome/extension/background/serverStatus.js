// @flow
import { ConceptualWalletSchema } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import { raii, getAll } from '../../../app/api/ada/lib/storage/database/utils';
import { getDb } from './state';
import { networks } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type { NetworkRow } from '../../../app/api/ada/lib/storage/database/primitives/tables';
import type { ConceptualWalletRow } from '../../../app/api/ada/lib/storage/database/walletTypes/core/tables';
import { getCommonStateFetcher } from './utils';
import environment from '../../../app/environment';
import type { ServerStatus } from './types';
import {
  getSubscriptions,
  registerCallback,
  emitUpdateToSubscriptions,
} from './subscriptionManager';

const serverStatusByNetworkId: Map<number, ServerStatus> = new Map();

async function getUsedNetworks(): Promise<$ReadOnlyArray<NetworkRow>> {
  const db = await getDb();
  const allConceptualWallets = await raii<$ReadOnlyArray<ConceptualWalletRow>>(
    db,
    [],
    tx => getAll(
      db, tx,
      ConceptualWalletSchema.name,
    )
  );
  const allNetworkIdSet = new Set(allConceptualWallets.map(w => w.NetworkId));
  return Object.keys(networks).map(n => networks[n]).filter(
    ({ NetworkId }) => allNetworkIdSet.has(NetworkId)
  );
}

async function updateServerStatus() {
  const usedNetworks = await getUsedNetworks();
  const fetcher = await getCommonStateFetcher();

  for (const network of usedNetworks) {
    const backend = network.Backend.BackendServiceZero;
    if (!backend) {
      throw new Error('unexpectedly missing backend zero');
    }
    const startTime = Date.now();
    let resp;
    try {
      resp = await fetcher.checkServerStatus({ backend });
    } catch {
      continue;
    }
    const endTime = Date.now();
    const roundtripTime = endTime - startTime;

    serverStatusByNetworkId.set(
      network.NetworkId,
      {
        networkId: network.NetworkId,
        isServerOk: resp.isServerOk,
        isMaintenance: resp.isMaintenance || false,
        // server time = local time + clock skew
        clockSkew: resp.serverTime + roundtripTime  / 2 - endTime,
        lastUpdateTimestamp: startTime + roundtripTime / 2,
      }
    );
  }
}

let lastUpdateTimestamp: number = 0;
let updatePromise: null | Promise<void> = null;

async function updateServerStatusTick() {
  const refreshInterval = environment.getServerStatusRefreshInterval();

  if (getSubscriptions().length === 0) {
    return;
  }

  if (Date.now() - lastUpdateTimestamp > refreshInterval) {
    if (!updatePromise) {
      updatePromise = updateServerStatus();
    }
    await updatePromise;
    updatePromise = null;
    lastUpdateTimestamp = Date.now();
  }

  emitUpdateToSubscriptions({
    type: 'server-status-update',
    params: [...serverStatusByNetworkId.values()],
  });

  setTimeout(updateServerStatusTick, refreshInterval);
}

export function startMonitorServerStatus() {
  registerCallback(params => {
    if (params.type === 'subscriptionChange') {
      updateServerStatusTick();
    }
  });
}
