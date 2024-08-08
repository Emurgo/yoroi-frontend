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


async function getUsedNetworks(): Promise<$ReadOnlyArray<NetworkRow>> {
  const db = await getDb();
  const allConceptualWallets = await raii<$ReadOnlyArray<ConceptualWalletRow>>(
    db,
    [db.getSchema().table(ConceptualWalletSchema.name)],
    tx => getAll(
      db, tx,
      ConceptualWalletSchema.name,
    )
  );
  console.log('>>>conceptual wallets:', allConceptualWallets.map(w=>w.Name));
  const allNetworkIdSet = new Set(allConceptualWallets.map(w => w.NetworkId));
  return Object.keys(networks).map(n => networks[n]).filter(
    ({ NetworkId }) => allNetworkIdSet.has(NetworkId)
  );
}

let lastUpdateTimestamp: number = 0;
const serverStatusByNetworkId: Map<number, ServerStatus> = new Map();

async function updateServerStatus() {
  if (Date.now() - lastUpdateTimestamp > environment.getServerStatusRefreshInterval()) {
    const usedNetworks = await getUsedNetworks();
    const fetcher = await getCommonStateFetcher();

    for (const network of usedNetworks) {
      const backend = network.Backend.BackendService;
      if (!backend) {
        throw new Error('unexpectedly missing backend zero');
      }
      const startTime = Date.now();
      let resp;
      try {
        resp = await fetcher.checkServerStatus({ backend });
      } catch {
        resp = {
          isServerOk: false,
          isMaintenance: false,
          serverTime: Date.now(),
        };
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
          lastUpdateTimestamp: Math.floor(startTime + roundtripTime / 2),
        }
      );
    }

    lastUpdateTimestamp = Date.now();
  }

  emitUpdateToSubscriptions({
    type: 'server-status-update',
    params: [...serverStatusByNetworkId.values()],
  });
}

let isRunning: boolean = false;

async function updateServerStatusThreadMain() {
  if (isRunning) {
    return;
  }
  isRunning = true;

  for (;;) {
    if (getSubscriptions().length === 0) {
      isRunning = false;
      return;
    }
    await updateServerStatus();

    await new Promise(resolve => setTimeout(resolve, environment.getServerStatusRefreshInterval()));
  }
}

export function startMonitorServerStatus() {
  registerCallback(params => {
    if (params.type === 'subscriptionChange') {
      updateServerStatusThreadMain().catch(error => {
        console.error('error when updating server status', error)
      });
    }
  });
}
