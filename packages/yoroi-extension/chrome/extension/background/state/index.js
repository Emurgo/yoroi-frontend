// @flow
import { schema } from 'lovefield';
import { copyDbToMemory, loadLovefieldDB, } from '../../../../app/api/ada/lib/storage/database/index';
import { migrateNoRefresh } from '../../../../app/api/common/migration';
import LocalStorageApi from '../../../../app/api/localStorage/index';
import { environment } from '../../../../app/environment';
import type { lf$Database, } from 'lovefield';
import type { PublicDeriver, } from '../../../../app/api/ada/lib/storage/models/PublicDeriver/index';

async function migrate(): Promise<void> {
  const localStorageApi = new LocalStorageApi();
  const db = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
  await migrateNoRefresh({
    localStorageApi,
    persistentDb: db,
    currVersion: environment.getVersion(),
  })
}

const migratePromise = migrate();

async function _getDb(): Promise<lf$Database> {
  await migratePromise;
  return await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
}

// Get the db handle. The client should only read from the db.
export async function getDb(): Promise<lf$Database> {
  const db = await _getDb();

  // To be extra safe, we return an in-memory copy of the DB to the caller.
  // So if the caller mistakenly update the database,
  // the changes are lost but the db won't be corrupt due to concurrent writes.
  return await copyDbToMemory(db);
}

export async function syncWallet(wallet: PublicDeriver<>): Promise<void> {
  /*
  const isCardano = isCardanoHaskell(wallet.getParent().getNetworkInfo());
  try {
    const lastSync = await wallet.getLastSyncInfo();
    // don't sync more than every 30 seconds
    const now = Date.now();
    if (lastSync.Time == null || now - lastSync.Time.getTime() > 30*1000) {
      if (syncing == null) {
        syncing = true;
        await RustModule.load();
        Logger.debug('sync started');
        if (isCardano) {
          const stateFetcher: CardanoIFetcher =
            await getCardanoStateFetcher(localStorageApi);
          await cardanoUpdateTransactions(
            wallet.getDb(),
            wallet,
            stateFetcher.checkAddressesInUse,
            stateFetcher.getTransactionsHistoryForAddresses,
            stateFetcher.getRecentTransactionHashes,
            stateFetcher.getTransactionsByHashes,
            stateFetcher.getBestBlock,
            stateFetcher.getTokenInfo,
            stateFetcher.getMultiAssetMintMetadata,
            stateFetcher.getMultiAssetSupply,
          )
        } else {
          throw new Error('non-cardano wallet. Should not happen');
        }
        Logger.debug('sync ended');
      }
    }
  } catch (e) {
    Logger.error(`Syncing failed: ${e}`);
  } finally {
    syncing = null;
  }
  */
}
