// @flow

// Wrapper API to Save&Load localstorage using JSON

import type { AdaWallet } from '../../adaTypes';
import { RustModule } from '../cardanoCrypto/rustLoader';
import type { ExplorerType } from '../../../../domain/Explorer';
import { Explorer } from '../../../../domain/Explorer';
import { getLocalItem, setLocalItem } from '../../../localStorage/primitives';

export type CryptoAccount = {
  account: number,
  // master public key
  root_cached_key: RustModule.Wallet.Bip44AccountPublic,
  derivation_scheme: string
}

type LocalStorageCryptoAccount = {
  account: number,
  root_cached_key: string, // MasterPublicKey
  derivation_scheme: string
}

export type LocalStorageWallet = {
  adaWallet: AdaWallet,
  masterKey?: string, // unused in hardware wallets
   // this is a per-account setting but we only have 1 account per wallet in Yoroi
  lastReceiveAddressIndex: number
}

// Use constant keys to store/load localstorage
const storageKeys = {
  ACCOUNT_KEY: 'ACCOUNT', // Note: only a single account
  WALLET_KEY: 'WALLET',
  LAST_BLOCK_NUMBER_KEY: 'LAST_BLOCK_NUMBER',
  SELECTED_EXPLORER_KEY: 'SELECTED_EXPLORER',
};

/* Account storage */

export async function saveCryptoAccount(
  ca: CryptoAccount
): Promise<void> {
  const localAccount: LocalStorageCryptoAccount = {
    account: ca.account,
    root_cached_key: ca.root_cached_key.key().to_hex(),
    derivation_scheme: ca.derivation_scheme
  };
  await _saveInStorage(storageKeys.ACCOUNT_KEY, localAccount);
}

export async function getCurrentCryptoAccount(): Promise<?CryptoAccount> {
  const localAccount = await _getFromStorage(storageKeys.ACCOUNT_KEY);
  if (!localAccount) {
    return null;
  }
  if (localAccount.derivation_scheme !== 'V2') {
    throw Error('Sanity check');
  }
  const pubKey = RustModule.Wallet.PublicKey.from_hex(localAccount.root_cached_key);
  const account = RustModule.Wallet.Bip44AccountPublic.new(
    pubKey,
    RustModule.Wallet.DerivationScheme.v2()
  );
  return {
    account: localAccount.account,
    root_cached_key: account,
    derivation_scheme: localAccount.derivation_scheme
  };
}

export async function getCurrentAccountIndex(): Promise<?number> {
  const localAccount = await _getFromStorage(storageKeys.ACCOUNT_KEY);
  return localAccount ? localAccount.account : undefined;
}

/* Wallet storage */

export async function createStoredWallet(
  adaWallet: AdaWallet,
  masterKey?: string
): Promise<void> {
  await _saveInStorage(storageKeys.WALLET_KEY, ({
    adaWallet,
    masterKey,
    lastReceiveAddressIndex: 0 // always start by showing one address
  }: LocalStorageWallet));
}

export async function getAdaWallet(): Promise<?AdaWallet> {
  const stored = await _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.adaWallet : null;
}

export async function saveAdaWallet(adaWallet: AdaWallet): Promise<void> {
  const stored: ?LocalStorageWallet = await _getFromStorage(storageKeys.WALLET_KEY);
  if (!stored) {
    throw new Error('Need to create a wallet before saving wallet metadata');
  }
  stored.adaWallet = adaWallet;
  await _saveInStorage(storageKeys.WALLET_KEY, stored);
}

export async function getWalletMasterKey(): Promise<?string> {
  const stored = await _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.masterKey : undefined;
}

export async function saveWalletMasterKey(masterKey: string): Promise<void> {
  const stored: ?LocalStorageWallet = await _getFromStorage(storageKeys.WALLET_KEY);
  if (!stored) {
    throw new Error('Need to create a wallet before saving wallet metadata');
  }
  stored.masterKey = masterKey;
  await _saveInStorage(storageKeys.WALLET_KEY, stored);
}

/* Last block number storage */

export async function saveLastBlockNumber(blockNumber: number): Promise<void> {
  await _saveInStorage(storageKeys.LAST_BLOCK_NUMBER_KEY, blockNumber);
}

export async function getLastBlockNumber(): Promise<number> {
  const lastBlockNum = await _getFromStorage(storageKeys.LAST_BLOCK_NUMBER_KEY);
  // Note: have to cast to number because an old version of Yoroi saved as a string
  return lastBlockNum
    ? Number(lastBlockNum)
    : 0;
}

/* Selected explorer storage */

export async function saveSelectedExplorer(explorer: ExplorerType): Promise<void> {
  await _saveInStorage(storageKeys.SELECTED_EXPLORER_KEY, explorer);
}

export async function getSelectedExplorer(): Promise<ExplorerType> {
  const explorer = await _getFromStorage(storageKeys.SELECTED_EXPLORER_KEY);
  return explorer || Explorer.SEIZA;
}

/* Last receive index storage */

export async function saveLastReceiveAddressIndex(index: number): Promise<void> {
  const stored: ?LocalStorageWallet = await _getFromStorage(storageKeys.WALLET_KEY);
  if (!stored) {
    throw new Error('Need to create a wallet before saving wallet metadata');
  }
  stored.lastReceiveAddressIndex = index;
  await _saveInStorage(storageKeys.WALLET_KEY, stored);
}

export async function getLastReceiveAddressIndex(): Promise<number> {
  const stored = await _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.lastReceiveAddressIndex : 0;
}

/* Util functions */
async function _saveInStorage(key: string, toSave: any): Promise<void> {
  await setLocalItem(key, JSON.stringify(toSave));
}

async function _getFromStorage(key: string): any | typeof undefined {
  return await getLocalItem(key).then((result) => {
    if (result !== '') return JSON.parse(result);
    return undefined;
  });
}
