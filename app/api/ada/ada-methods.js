// @flow

import BigNumber from 'bignumber.js';

import type {
  AdaWallet,
  AdaWallets,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse,
  AdaAccounts,
  AdaTransactions,
  AdaTransaction,
  AdaTransactionInputOutput
} from './types';

import {
  toWallet,
  generateAccount,
  isValidAdaMnemonic,
  generateAdaMnemonic
} from './lib/ada-wallet';

import { getInfo } from './lib/explorer-api';
import { debug } from 'util';

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

export type GetAdaHistoryByWalletParams = {
  ca: string,
  walletId: string,
  skip: number,
  limit: number
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

export const getAdaWallets = async (): Promise<AdaWallets> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve([]);

  const account = getFromStorage(ACCOUNT_KEY);
  const accountResponse = await getInfo(account.address);

  const updatedWallet = Object.assign({}, persistentWallet.wallet, {
    cwAmount: {
      getCCoin: accountResponse.caBalance.getCoin
    }
  });
  saveInStorage(WALLET_KEY, {
    mnemonic: persistentWallet.mnemonic,
    wallet: updatedWallet
  });

  if (accountResponse.caTxList.length > 0) {
    saveInStorage(
      TX_KEY,
      mapTransactions(accountResponse.caTxList, account.address)
    );
  }

  return Promise.resolve([updatedWallet]);
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

export const getAdaHistoryByWallet = ({
  walletId,
  skip,
  limit
}: GetAdaHistoryByWalletParams): Promise<AdaTransactions> => {
  const transactions = getFromStorage(TX_KEY);
  if (!transactions) return Promise.resolve([[], 0]);

  return Promise.resolve([transactions, transactions.length]);
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

function mapTransactions(
  transactions: [],
  accountAddress
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const { isOutgoing, amount } = spenderData(tx, accountAddress);
    return {
      ctAmount: {
        getCCoin: amount
      },
      ctConfirmations: 0,
      ctId: tx.ctbId,
      ctInputs: tx.ctbInputs.map(mapInputOutput),
      ctIsOutgoing: isOutgoing,
      ctMeta: {
        ctmDate: tx.ctbTimeIssued,
        ctmDescription: undefined,
        ctmTitle: undefined
      },
      ctOutputs: tx.ctbOutputs.map(mapInputOutput),
      ctCondition: 'CPtxApplying' // FIXME: What's this?
    };
  });
}

function mapInputOutput(txInput): AdaTransactionInputOutput {
  return [
    txInput[0],
    {
      getCCoin: txInput[1].getCoin
    }
  ];
}

function spenderData(tx, address) {
  const sum = toSum =>
    toSum.reduce(
      ({ totalAmount, count }, val) => {
        if (val[0] !== address) return { totalAmount, count };
        return {
          totalAmount: totalAmount.plus(new BigNumber(val[1].getCoin)),
          count: count + 1
        };
      },
      {
        totalAmount: new BigNumber(0),
        count: 0
      }
    );

  const incoming = sum(tx.ctbOutputs);
  const outgoing = sum(tx.ctbInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(incoming.totalAmount);

  const isLocal =
    incoming.length === tx.ctbInputs.length &&
    outgoing.length === tx.ctbOutputs.length;

  let amount;
  if (isLocal) amount = outgoing.totalAmount;
  else if (isOutgoing) amount = outgoing.totalAmount - incoming.totalAmount;
  else amount = incoming.totalAmount - outgoing.totalAmount;

  return {
    isOutgoing,
    amount
  };
}
