// @flow
import type { AdaWallet } from '../ada/adaTypes';
import type { WalletMasterKey } from '../ada/lib/cardanoCrypto/cryptoWallet';

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
  masterKey: WalletMasterKey
): void {
  _saveInStorage(storageKeys.WALLET_KEY, { adaWallet, masterKey });
}

export function getAdaWallet(): ?AdaWallet {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.adaWallet : null;
}

export function getWalletMasterKey(): WalletMasterKey {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored.masterKey;
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
