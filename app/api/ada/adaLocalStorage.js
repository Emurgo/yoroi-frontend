// @flow
import type { AdaWallet } from '../ada/adaTypes';
import type { WalletSeed } from '../ada/lib/cardanoCrypto/cryptoWallet';

const storageKeys = {
  ACCOUNT_KEY: 'ACCOUNT',
  WALLET_KEY: 'WALLET',
  LAST_BLOCK_NUMBER_KEY: 'LAST_BLOCK_NUMBER'
};

export function saveCryptoAccount(
  ca: CryptoAccount
): void {
  _saveInStorage(storageKeys.ACCOUNT_KEY, ca);
}

export function getSingleCryptoAccount(): CryptoAccount {
  return _getFromStorage(storageKeys.ACCOUNT_KEY);
}

export function saveAdaWallet(
  adaWallet: AdaWallet,
  seed: WalletSeed
): void {
  _saveInStorage(storageKeys.WALLET_KEY, { adaWallet, seed });
}

export function getAdaWallet(): ?AdaWallet {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.adaWallet : null;
}

export function getWalletSeed(): WalletSeed {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored.seed;
}

export function saveLastBlockNumber(blockNumber: number): void {
  _saveInStorage(storageKeys.LAST_BLOCK_NUMBER_KEY, blockNumber);
}

export function getLastBlockNumber() {
  return _getFromStorage(storageKeys.LAST_BLOCK_NUMBER_KEY);
}

function _saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

function _getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}
