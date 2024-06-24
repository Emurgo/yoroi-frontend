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
import { getSubscriptions, registerCallback } from './subscriptionManager';
import LocalStorageApi, {
  loadSubmittedTransactions,
  persistSubmittedTransactions,
} from '../../../../app/api/localStorage/index';

let refreshRunning: boolean = false;

registerCallback((params) => {
  if (params.type === 'subscriptionChange') {
    refreshMain();
  }
});

export async function refreshMain(): Promise<void> {
  if (refreshRunning) {
    return;
  }
  refreshRunning = true;

  for (;;) {
    if (getSubscriptions().length === 0) {
      break;
    }
    await refreshAllParallel();
    await new Promise(resolve => setTimeout(resolve, environment.getWalletRefreshInterval()));
  }

  refreshRunning = false;
}

// return delay in ms for next run
// this function should not have unhandled exception
async function refreshAllParallel(): Promise<void> {
  const subscriptions = getSubscriptions();

  const db = await getDb();
  const publicDerivers = await getWallets({ db });

  let counter = 0;
  for (const publicDeriver of publicDerivers) {
    console.log(
      'syncing public deriver %s of %s ID %s "%s"',
      counter += 1,
      publicDerivers.length,
      publicDeriver.getPublicDeriverId(),
      (await publicDeriver.getParent().getFullConceptualWalletInfo()).Name,
    );
    const lastSyncInfo = await publicDeriver.getLastSyncInfo();
    if (Date.now() - (lastSyncInfo.Time?.valueOf() || 0) < environment.getWalletRefreshInterval()) {
      return;
    }
    try {
      await syncWallet(publicDeriver);
    } catch(error) {
      console.error('Error when refreshing wallet', error);
    }
  };
}

export const refreshingWalletIdSet: Set<number> = new Set();

export async function syncWallet(publicDeriver: PublicDeriver<>): Promise<void> {
  const publicDeriverId = publicDeriver.getPublicDeriverId();
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
  } catch (e) {
    console.error(`Syncing failed: ${e}`);
  } finally {
    refreshingWalletIdSet.delete(publicDeriverId);
    emitUpdate(publicDeriverId, false);
  }
}

/*::
declare var chrome;
*/
function emitUpdate(publicDeriverId: number, isRefreshing: boolean): void {
  for (const { tabId } of getSubscriptions()) {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: 'wallet-state-update',
        publicDeriverId,
        isRefreshing,
      }
    );
  }    
}
