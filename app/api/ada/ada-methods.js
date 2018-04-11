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

import { getInfo } from './lib/explorer-api';

import { request } from './lib/request';

const WALLET_KEY = 'WALLET'; // single wallet atm
const ACCOUNT_KEY = 'ACCOUNT'; // single account atm
const TX_KEY = 'TXS'; // single txs list atm

export type NewAdaWalletParams = {
  password: ?string,
  walletInitData: AdaWalletInitData
};

export type IsValidAdaAddressParams = {
  /*ca: string,*/
  address: string
};

export type GetAdaWalletAccountsParams = {
  walletId: string
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

  const account = getFromStorage(ACCOUNT_KEY);
  return getInfo(account.address).then(response => {
    const updatedWallet = Object.assign({}, persistentWallet.wallet, {
      cwAmount: {
        getCCoin: response.caBalance.getCoin
      }
    });
    saveInStorage(WALLET_KEY, {
      mnemonic: persistentWallet.mnemonic,
      wallet: updatedWallet,
    });
    saveInStorage(TX_KEY, response.caTxList);
    return Promise.resolve([updatedWallet]);
  });
};

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  generateAdaMnemonic();

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

/**
 * Private method helpers
 */

function saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

function getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}
