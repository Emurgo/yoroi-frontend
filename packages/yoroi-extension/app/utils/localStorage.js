// @flow
import type { PublicDeriver } from '../api/ada/lib/storage/models/PublicDeriver';
import { asGetPublicKey } from '../api/ada/lib/storage/models/PublicDeriver/traits';

type SyncedWallet = {|
  publicKey: string,
  isSynced: boolean,
  publicDeriverId: number,
|};

type StoredWallets = {|
  wallets: SyncedWallet[],
  isFirstTime: boolean,
|};

const SYNCED_WALLETS = 'wallets/synced';
const SYNCED_WALLETS_DEFAULT = JSON.stringify({
  wallets: [],
  // When we push this into production
  // we want to take existing wallets,
  // store them and mark them as synced.
  isFirstTime: true,
});

const getSyncedWallets = (): StoredWallets => {
  return JSON.parse(localStorage.getItem(SYNCED_WALLETS) || SYNCED_WALLETS_DEFAULT);
};

const createSyncedWalletObj = async (publicDeriver: PublicDeriver<>): Promise<SyncedWallet> => {
  const withPubKey = asGetPublicKey(publicDeriver);
  if (withPubKey == null) {
    throw new Error(`${nameof(createSyncedWalletObj)} should never happen`);
  }
  const publicKey = await withPubKey.getPublicKey();

  return {
    publicKey: publicKey.Hash,
    isSynced: true,
    publicDeriverId: publicDeriver.publicDeriverId,
  };
};

export const getCurrentWalletFromLS = async (
  publicDeriver: PublicDeriver<>
): Promise<void | SyncedWallet> => {
  const syncedWallet = await createSyncedWalletObj(publicDeriver);
  return getSyncedWallets().wallets.find(wallet => compareWallets(wallet, syncedWallet));
};

export const removeWalletFromLS = async (publicDeriver: PublicDeriver<>): Promise<void> => {
  const syncedWallet = await createSyncedWalletObj(publicDeriver);
  const syncedWallets = getSyncedWallets();
  const filteredWallets = syncedWallets.wallets.filter(
    wallet => !compareWallets(wallet, syncedWallet)
  );
  localStorage.setItem(
    SYNCED_WALLETS,
    JSON.stringify({
      isFirstTime: syncedWallets.isFirstTime,
      wallets: filteredWallets,
    })
  );
};

export const updateSyncedWallets = async (publicDeriver: PublicDeriver<>): Promise<void> => {
  const syncedWallet = await createSyncedWalletObj(publicDeriver);
  const syncedWallets = getSyncedWallets();
  const wallet = syncedWallets.wallets.find(w => compareWallets(w, syncedWallet));
  if (wallet) {
    wallet.isSynced = true;
  } else {
    syncedWallets.wallets.push(syncedWallet);
  }
  localStorage.setItem(SYNCED_WALLETS, JSON.stringify(syncedWallets));
};

// Utils
function compareWallets(first: SyncedWallet, second: SyncedWallet) {
  return first.publicKey === second.publicKey && first.publicDeriverId === second.publicDeriverId;
}
