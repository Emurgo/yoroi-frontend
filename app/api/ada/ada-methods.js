// @flow
// FIXME: Implement the API using Rust + LocalStorage
import type {
  AdaWallet,
  AdaWallets,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse,
  AdaAccounts,
  RestoreAdaWalletParams
} from './types';

import {
  toWallet,
  generateAccount,
  isValidAdaMnemonic,
  generateAdaMnemonic
} from './lib/ada-wallet';

const WALLET_KEY = 'WALLET'; // single wallet atm
const ACCOUNT_KEY = 'ACCOUNT'; // single account atm

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
}: IsValidAdaAddressParams): Promise<boolean> => Promise.resolve(true);

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  isValidAdaMnemonic(phrase, numberOfWords);

export async function newAdaWallet({
  password, // Password is not used yet
  walletInitData
}: NewAdaWalletParams): Promise<AdaWallet> {
  const toSave = toWallet(walletInitData);
  saveInStorage(WALLET_KEY, toSave);
  const account = generateAccount(toSave.mnemonic);
  saveInStorage(ACCOUNT_KEY, account);
  return Promise.resolve(toSave.wallet);
}

export const restoreAdaWallet = ({
  walletPassword,
  walletInitData
}: RestoreAdaWalletParams): Promise<AdaWallet> =>
  newAdaWallet({ walletPassword, walletInitData });

export const getAdaWallets = (): Promise<AdaWallets> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve([]);
  return Promise.resolve([persistentWallet.wallet]);
};

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  generateAdaMnemonic();

export type GetAdaWalletAccountsParams = {
  walletId: string
};

export const getAdaWalletAccounts = ({
  walletId
}: GetAdaWalletAccountsParams): Promise<AdaAccounts> => {
  const account = getFromStorage(ACCOUNT_KEY);
  if (!account) return Promise.resolve([]);
  const adaAccount = {
    caAddresses: [
      {
        cadAmount: {
          getCCoin: 0
        }, // FIXME: Fetch data from the server
        cadId: account.address,
        cadIsUsed: false
      }
    ],
    caAmount: {
      getCCoin: 0
    },
    caId: 'caId',
    caMeta: {
      caName: 'caName'
    }
  };
  return Promise.resolve([adaAccount]);
};

function saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

function getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}
