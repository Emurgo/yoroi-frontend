//@flow
import type { PublicDeriver } from "../api/ada/lib/storage/models/PublicDeriver";
import { asGetPublicKey } from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';
  
type SyncedWallet = {|
    publicKey: string,
    isSynced: boolean,
|}
    
export const SYNCED_WALLETS = 'wallets/synced'
const getSyncedWallets = (): SyncedWallet[] => {
    return JSON.parse(localStorage.getItem(SYNCED_WALLETS) || '[]' )
}

export const getCurrentWalletFromLS = async (publicDeriver: PublicDeriver<>): Promise<void | SyncedWallet> => {
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) return
    const publicKey = await withPubKey.getPublicKey();
    console.log({publicKey: publicKey.Hash})
    return getSyncedWallets().find(wallet => wallet.publicKey === publicKey.Hash)
}

const createSyncedWalletObj = async (publicDeriver: PublicDeriver<>): Promise<SyncedWallet> => {
    const withPubKey = asGetPublicKey(publicDeriver);
    if (withPubKey == null) {
        throw new Error(`${nameof(createSyncedWalletObj)} should never happen`);
    }
    const publicKey = await withPubKey.getPublicKey();

    return {
        publicKey: publicKey.Hash,
        isSynced: true
    }
}

export const updateSyncedWallets = async (publicDeriver: PublicDeriver<>): Promise<void> => {
    const syncedWallet = await createSyncedWalletObj(publicDeriver);
    const wallets = getSyncedWallets()
    const wallet = wallets.find(wallet => wallet.publicKey === syncedWallet.publicKey)
    if (wallet) {
        wallet.isSynced = true
    } else {
        wallets.push(syncedWallet)
    }
    localStorage.setItem(SYNCED_WALLETS, JSON.stringify(wallets))
}