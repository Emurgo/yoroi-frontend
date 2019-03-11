// @flow

// Wrapper API to Save&Load localstorage using JSON

import type { AdaWallet } from './adaTypes';

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
};

/* Account storage */

export function saveCryptoAccount(
  ca: CryptoAccount
): void {
  _saveInStorage(storageKeys.ACCOUNT_KEY, ca);
}

export function getSingleCryptoAccount(): CryptoAccount {
  return _getFromStorage(storageKeys.ACCOUNT_KEY);
}

/* Wallet storage */

export function createStoredWallet(
  adaWallet: AdaWallet,
  masterKey?: string
): void {
  _saveInStorage(storageKeys.WALLET_KEY, ({
    adaWallet,
    masterKey,
    lastReceiveAddressIndex: 0 // always start by showing one address
  }: LocalStorageWallet));
}

export function getAdaWallet(): ?AdaWallet {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored ? stored.adaWallet : null;
}

export function saveAdaWallet(adaWallet: AdaWallet): void {
  const stored: LocalStorageWallet = _getFromStorage(storageKeys.WALLET_KEY);
  stored.adaWallet = adaWallet;
  _saveInStorage(storageKeys.WALLET_KEY, stored);
}

export function getWalletMasterKey(): string {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored.masterKey;
}

export function saveWalletMasterKey(masterKey: string): void {
  const stored: LocalStorageWallet = _getFromStorage(storageKeys.WALLET_KEY);
  stored.masterKey = masterKey;
  _saveInStorage(storageKeys.WALLET_KEY, stored);
}

/* Last block number storage */

export function saveLastBlockNumber(blockNumber: number): void {
  _saveInStorage(storageKeys.LAST_BLOCK_NUMBER_KEY, blockNumber);
}

export function getLastBlockNumber(): number {
  const lastBlockNum = _getFromStorage(storageKeys.LAST_BLOCK_NUMBER_KEY);
  // Note: have to cast to number because an old version of Yoroi saved as a string
  return Number(lastBlockNum);
}

/* Last block number storage */

export function saveLastReceiveAddressIndex(index: number): void {
  const stored: LocalStorageWallet = _getFromStorage(storageKeys.WALLET_KEY);
  stored.lastReceiveAddressIndex = index;
  _saveInStorage(storageKeys.WALLET_KEY, stored);
}

export function getLastReceiveAddressIndex(): number {
  const stored = _getFromStorage(storageKeys.WALLET_KEY);
  return stored.lastReceiveAddressIndex;
}

/* Util functions */

function _saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

function _getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}
