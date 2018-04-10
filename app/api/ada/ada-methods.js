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

export type IsValidAdaAddressParams = {
  /*ca: string,*/
  address: string
};

export const isValidAdaAddress = ({
  /*ca, */ address
}: IsValidAdaAddressParams): Promise<boolean> => {
  // FIXME: Do this method
  //const encodedAddress = encodeURIComponent(address);
  /*return request({
    hostname: 'localhost',
    method: 'GET',
    path: `/api/addresses/${encodedAddress}`,
    port: 8090,
    ca,
  });*/
  return Promise.resolve(true);
};

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  phrase.split(' ').length === numberOfWords &&
  bip39.validateMnemonic(phrase);

export async function newAdaWallet({
  password, // Password is not used yet
  walletInitData
}: NewAdaWalletParams): Promise<AdaWallet> {
  const toSave = toWallet(walletInitData);
  saveWallet(WALLET_KEY, toSave);
  return Promise.resolve(toSave.wallet);
}

export const restoreAdaWallet = (
  { walletPassword, walletInitData }: RestoreAdaWalletParams
): Promise<AdaWallet> => (
  newAdaWallet({walletPassword, walletInitData})
);

export const getAdaWallets = (): Promise<AdaWallets> => {
  const persistentWallet = getWallet(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve([]);
  return Promise.resolve([persistentWallet.wallet]);
};

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  bip39.generateMnemonic(128).split(' ');

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
