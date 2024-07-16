// @flow
import type { PublicDeriver, } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { getWallets } from '../../../../app/api/common/index';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { getCardanoStateFetcher } from '../utils';
import AdaApi from '../../../../app/api/ada';
import type { WalletState } from '../types';
import { asHasLevels } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import environment from '../../../../app/environment';
import { getDb } from './databaseManager';
import {
  getSubscriptions,
  registerCallback,
  emitUpdateToSubscriptions,
} from '../subscriptionManager';
import LocalStorageApi, {
  loadSubmittedTransactions,
  persistSubmittedTransactions,
} from '../../../../app/api/localStorage/index';
import { Queue } from 'async-await-queue';

registerCallback((params) => {
  if (params.type === 'subscriptionChange') {
    refreshThreadMain();
  }
});

let refreshRunning: boolean = false;
// Start a "thread" to periodically refresh all wallets. Ensure only one such thread running.
export async function refreshThreadMain(): Promise<void> {
  if (refreshRunning) {
    return;
  }
  refreshRunning = true;

  for (;;) {
    if (getSubscriptions().length === 0) {
      break;
    }
    await refreshAll();
    await new Promise(resolve => setTimeout(resolve, environment.getWalletRefreshInterval()));
  }

  refreshRunning = false;
}

async function refreshAll(): Promise<void> {
  // this function should not have unhandled exception
  const db = await getDb();
  const publicDerivers = await getWallets({ db });

  for (let i = 0; i < publicDerivers.length; i++) {
    try {
      await syncWallet(
        publicDerivers[i],
        `periodical refresh ${i+1} of ${publicDerivers.length}`,
      );
    } catch(error) {
      console.error('Error when refreshing wallet.', error);
    }
  };
}

// Keep track of whether a wallet is being synced because the UI shows this.
export const refreshingWalletIdSet: Set<number> = new Set();
// There are multiple entry points to syncWallet. Ensure only one is running.
const syncingQueue = new Queue();

export async function syncWallet(
  publicDeriver: PublicDeriver<>,
  logInfo: string,
  priority: number = 0
): Promise<void> {
  return syncingQueue.run(() => _syncWallet(publicDeriver, logInfo), priority);
}
async function _syncWallet(publicDeriver: PublicDeriver<>, logInfo: string): Promise<void> {
  const publicDeriverId = publicDeriver.getPublicDeriverId();
  console.log(
    'Syncing wallet ID %s name "%s" for %s.',
    publicDeriverId,
    (await publicDeriver.getParent().getFullConceptualWalletInfo()).Name,
    logInfo,
  );

  const lastSyncInfo = await publicDeriver.getLastSyncInfo();
  if (Date.now() - (lastSyncInfo.Time?.valueOf() || 0) < environment.getWalletRefreshInterval()) {
    console.log('last sync was %s, skip syncing', lastSyncInfo.Time);
    return;
  }

  refreshingWalletIdSet.add(publicDeriverId);
  emitUpdate(publicDeriverId, true);

  try {
    await RustModule.load();
    const localStorageApi = new LocalStorageApi();
    const stateFetcher = await getCardanoStateFetcher(localStorageApi);

    const withLevels = asHasLevels(publicDeriver);
    if (!withLevels) {
      throw new Error('unexpected missing asHasLevels result');
    }

    const adaApi = new AdaApi();
    const txs = await adaApi.refreshTransactions({
      // skip
      // number
      publicDeriver: withLevels,
      isLocalRequest: false,
      beforeTx: undefined,
      afterTx: undefined,
      getRecentTransactionHashes: stateFetcher.getRecentTransactionHashes,
      getTransactionsByHashes: stateFetcher.getTransactionsByHashes,
      checkAddressesInUse: stateFetcher.checkAddressesInUse,
      getBestBlock: stateFetcher.getBestBlock,
      getTokenInfo: stateFetcher.getTokenInfo,
      getMultiAssetMetadata: stateFetcher.getMultiAssetMintMetadata,
      getMultiAssetSupply: stateFetcher.getMultiAssetSupply,
      getTransactionHistory: stateFetcher.getTransactionsHistoryForAddresses,
    });

    const remoteTransactionIds = new Set();
    for (const { txid } of txs) {
      remoteTransactionIds.add(txid);
    }

    const submittedTransactions = await loadSubmittedTransactions();
    let submittedTransactionsChanged = false;

    for (let i = 0; i < submittedTransactions.length; ) {
      const txId = submittedTransactions[i].transaction.txid;
      if (remoteTransactionIds.has(txId)) {
        submittedTransactions.splice(i, 1);
        submittedTransactionsChanged = true;
      } else {
        i++;
      }
    }

    if (submittedTransactionsChanged) {
      persistSubmittedTransactions(submittedTransactions);
    }
    console.log('Syncing wallet %s finished.', publicDeriverId);
  } catch (error) {
    console.error('Syncing wallet %s failed:', publicDeriverId, error);
  } finally {
    refreshingWalletIdSet.delete(publicDeriverId);
    emitUpdate(publicDeriverId, false);
  }
}

function emitUpdate(publicDeriverId: number, isRefreshing: boolean): void {
  emitUpdateToSubscriptions({
    type: 'wallet-state-update',
    params: {
      eventType: 'update',
      publicDeriverId,
      isRefreshing,
    },
  });
}

