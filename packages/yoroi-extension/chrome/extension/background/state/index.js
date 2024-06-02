// @flow
import { schema } from 'lovefield';
import { copyDbToMemory, loadLovefieldDB, } from '../../../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../../../app/api/common/migration';
import LocalStorageApi from '../../../../app/api/localStorage/index';
import { environment } from '../../../../app/environment';
import type { lf$Database, } from 'lovefield';
import type { PublicDeriver, } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import { connectorGetUtxosCardano } from '../../connector/api';
import { getWallets } from '../../../../app/api/common/index';
import { RustModule } from '../../../../app/api/ada/lib/cardanoCrypto/rustLoader';
import { getCardanoStateFetcher } from '../utils';
import AdaApi from '../../../../app/api/ada';
import type { WalletState } from '../types';
import { asHasLevels } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/traits';

/*::
declare var chrome;
*/

let dbCache = null;
let migratePromiseCache = null;

export async function init(): Promise<void> {
  // eagerly cache
  await _getDb();
}

async function _getDb(): Promise<lf$Database> {
  const localStorageApi = new LocalStorageApi();

  if (!dbCache) {
    dbCache = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
  }
  
  if (!migratePromiseCache) {
    migratePromiseCache =  migrateNoRefresh({
      localStorageApi,
      persistentDb: dbCache,
      currVersion: environment.getVersion(),
    });
  }
  await migratePromiseCache;

  return dbCache;
}

// Get the db handle. The client should only read from the db.
export async function getDb(): Promise<lf$Database> {
  const db = await _getDb();

  // To be extra safe, we return an in-memory copy of the DB to the caller.
  // So if the caller mistakenly update the database,
  // the changes are lost but the db won't be corrupt due to concurrent writes.
  return await copyDbToMemory(db);
}

type WalletId = number;
type SyncState = {|
  promise: Promise<void>,
|};
const syncState: Map<WalletId, SyncState> = new Map();

export async function syncWallet(wallet: PublicDeriver<>): Promise<void> {
  const walletId = wallet.getPublicDeriverId();
  const state = syncState.get(walletId);
  if (state && state.promise) {
    return state.promise;
  }
  const promise = _syncWallet(wallet);
  syncState.set(walletId, { promise });
  await promise;
  syncState.delete(walletId);
  notifyWalletState([wallet]);
}

async function notifyWalletState(wallets: Array<PublicDeriver<>>): Promise<void> {
  const state = null; // fixme await Promise.all(wallets.map(getWalletState));
  const json = JSON.stringify(state);
  for (const tabId of subscribedTabIds) {
    chrome.tabs.sendMessage(tabId, json);
  }    
}

async function _syncWallet(publicDeriver: PublicDeriver<>): Promise<void> {
  try {
    await RustModule.load();
    console.debug('sync started');
    const localStorageApi = new LocalStorageApi();
    const stateFetcher = await getCardanoStateFetcher(localStorageApi);

    const withLevels = asHasLevels(publicDeriver);
    if (!withLevels) {
      throw new Error('unexpected missing asHasLevels result');
    }

    const adaApi = new AdaApi();
    adaApi.refreshTransactions({
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
    console.debug('sync ended');
  } catch (e) {
    console.error(`Syncing failed: ${e}`);
  }
}

const subscribedTabIds: Array<number> = [];

export async function subscribeWalletStateChanges(tabId: number): Promise<void> {
  subscribedTabIds.push(tabId);
  //fixme
}

chrome.tabs.onRemoved.addListener((tabId: number, _info) => {
  const index = subscribedTabIds.indexOf(tabId);
  if (index >= 0) {
    subscribedTabIds.splice(index, 1);
  }
});
