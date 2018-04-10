// @flow
// FIXME: Implement the API using Rust + LocalStorage
import bip39 from 'bip39';
import type {
  AdaWallet,
  AdaWallets,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse
} from './types';

import { toWallet } from './lib/ada-wallet';

const WALLET_KEY = 'WALLET'; // single wallet atm

export type NewAdaWalletParams = {
  password: ?string,
  walletInitData: AdaWalletInitData
};

export async function newAdaWallet({
  password, // Password is not used yet
  walletInitData
}: NewAdaWalletParams): Promise<AdaWallet> {
  const toSave = toWallet(walletInitData);
  saveWallet(WALLET_KEY, toSave);
  return Promise.resolve(toSave.wallet);
}

export const getAdaWallets = (): Promise<AdaWallets> => {
  const persistentWallet = getWallet(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve([]);
  return Promise.resolve([persistentWallet.wallet]);
};

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  bip39.generateMnemonic(128).split(' ');

export const restoreAdaWallet = ({
  walletPassword,
  walletInitData
}: RestoreAdaWalletParams): Promise<AdaWallet> => newAdaWallet();

type PersistentWallet = {
  wallet: AdaWallet,
  mnemonic: []
};

function saveWallet(walletId: string, wallet: PersistentWallet): void {
  localStorage.setItem(walletId, JSON.stringify(wallet));
}

function getWallet(walletId: string): ?PersistentWallet {
  const result = localStorage.getItem(walletId);
  if (result) return JSON.parse(result);
  return undefined;
}
