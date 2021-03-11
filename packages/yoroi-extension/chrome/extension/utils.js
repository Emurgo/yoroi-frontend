// @flow

import { schema } from 'lovefield';
import type {
  lf$Database,
} from 'lovefield';
import {
  loadLovefieldDB,
} from '../../app/api/ada/lib/storage/database/index';
import {
  getWallets
} from '../../app/api/common/index';
import {
  asGetPublicKey,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import type {
  PendingSignData,
  RpcUid,
  AccountInfo,
} from './ergo-connector/types';
import {
  connectorGetBalance,
} from './ergo-connector/api';
import { GenericApiError } from '../../app/api/common/errors';
import { isErgo, isCardanoHaskell, } from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import { Bip44Wallet } from '../../app/api/ada/lib/storage/models/Bip44Wallet/wrapper';
import { walletChecksum, legacyWalletChecksum } from '@emurgo/cip4-js';
import type { WalletChecksum } from '@emurgo/cip4-js';

/*::
declare var chrome;
*/

type PendingSign = {|
  // data needed to complete the request
  request: PendingSignData,
  // if an opened window has been created for this request to show the user
  openedWindow: boolean,
  // resolve function from signRequest's Promise
  resolve: any
|}

// This is a temporary workaround to DB duplicate key constraint violations
// that is happening when multiple DBs are loaded at the same time, or possibly
// this one being loaded while Yoroi's main App is doing DB operations.
let loadedDB: ?lf$Database = null;
let dbPromise: ?Promise<lf$Database> = null;

export async function loadDB(): Promise<lf$Database> {
  if (loadedDB == null) {
    if (dbPromise == null) {
      dbPromise = loadLovefieldDB(schema.DataStoreType.INDEXED_DB)
        .then(db => {
          loadedDB = db;
          return Promise.resolve(loadedDB);
        });
    }
    return dbPromise;
  }
  return Promise.resolve(loadedDB);
}

export type AccountIndex = number;

// AccountIndex = successfully connected - which account the user selected
// null = refused by user
type ConnectedStatus = ?AccountIndex | {|
  // response (?AccountIndex) - null means the user refused, otherwise the account they selected
  resolve: any,
  // if a window has fetched this to show to the user yet
  openedWindow: boolean,
|};

export type ConnectedSite = {|
  url: string,
  status: ConnectedStatus,
  pendingSigns: Map<RpcUid, PendingSign>
|};

async function getChecksum(
  publicDeriver: ReturnType<typeof asGetPublicKey>,
): Promise<void | WalletChecksum> {
  if (publicDeriver == null) return undefined;

  const hash = (await publicDeriver.getPublicKey()).Hash;

  const isLegacyWallet =
    isCardanoHaskell(publicDeriver.getParent().getNetworkInfo()) &&
    publicDeriver.getParent() instanceof Bip44Wallet;
  const checksum = isLegacyWallet
    ? legacyWalletChecksum(hash)
    : walletChecksum(hash);

  return checksum;
}

export async function getWalletsInfo(): Promise<AccountInfo[]> {
  try {
    const db = await loadDB();
    const wallets = await getWallets({ db });
    // information about each wallet to show to the user
    const accounts = [];
    for (const wallet of wallets) {
      const conceptualWallet = wallet.getParent();
      const withPubKey = asGetPublicKey(wallet);

      const conceptualInfo = await conceptualWallet.getFullConceptualWalletInfo();
      if (isErgo(conceptualWallet.getNetworkInfo())) {
        // TODO: we can't get the pending txs from background.js from here
        // since it runs in a different context. Need a better solution
        const pendingTxs = [];
        const balance = await connectorGetBalance(wallet, pendingTxs, 'ERG');
        accounts.push({
          name: conceptualInfo.Name,
          balance: balance.toString(),
          checksum: await getChecksum(withPubKey)
        });
      }
    }
    return accounts;
  } catch (error) {
    throw new GenericApiError();
  }
}

export function getActiveSites(): Array<string> {
  const activeSites = []
  // TODO: can't get connected sites from background.js
  // because it runs in a different context
  const connectedSites = [];
  for (const value of connectedSites.values()){
    activeSites.push(value);
  }
  return activeSites.map(item => item.url);
}
