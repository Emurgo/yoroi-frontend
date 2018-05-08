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
  generateAdaMnemonic,
} from './lib/ada-wallet';

import { Wallet } from 'cardano-crypto';

import {
  getWalletFromAccount
} from './lib/ada-wallet';

import type { AdaTxFeeParams } from './adaTxFee';

import {
  getTransactionsHistoryForAddresses,
  getUTXOsForAddresses,
  sendTx
} from './lib/icarus-backend-api';

const WALLET_KEY = 'WALLET'; // single wallet atm
const ACCOUNT_KEY = 'ACCOUNT'; // single account atm
const TX_KEY = 'TXS'; // single txs list atm

export type AdaWalletParams = {
  walletPassword: ?string,
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

export type NewAdaPaymentParams = {
  sender: string,
  receiver: string,
  amount: string,
  password: ?string,
  // "groupingPolicy" - Spend everything from the address
  // "OptimizeForSize" for no grouping
  groupingPolicy: ?'OptimizeForSecurity' | 'OptimizeForSize'
};

export const isValidAdaAddress = ({
  /*ca, */ address
}: IsValidAdaAddressParams): Promise<boolean> => Promise.resolve(true);

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  isValidAdaMnemonic(phrase, numberOfWords);

export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {
  const wallet = toWallet({ walletPassword, walletInitData });
  saveInStorage(WALLET_KEY, wallet);
  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const account = generateAccount(mnemonic, walletPassword);
  saveInStorage(ACCOUNT_KEY, account);
  return Promise.resolve(wallet);
}

export const restoreAdaWallet = ({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> =>
  newAdaWallet({ walletPassword, walletInitData });

export const getAdaWallets = async (): Promise<AdaWallets> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve([]);
  const account = getFromStorage(ACCOUNT_KEY);
  // TODO: Manage multiple addresses from the storage
  const addresses = [account.address];
  // Update wallet balance
  const updatedWallet = Object.assign({}, persistentWallet, {
    cwAmount: {
      getCCoin: await getBalance(addresses)
    }
  });
  saveInStorage(WALLET_KEY, updatedWallet);
  // Update Wallet Txs History
  const history = await getTransactionsHistoryForAddresses(addresses);
  if (history.length > 0) {
    saveInStorage(
      TX_KEY,
      mapTransactions(history, addresses[0]) // FIXME: Manage multiple addresses 
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
    caId: account.address,
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

export const getPaymentFee = ({
  sender,
  receiver,
  amount,
  groupingPolicy
}: AdaTxFeeParams): Promise<Number> => {
  const account = getFromStorage(ACCOUNT_KEY);
  // FIXME: If user didn't set a password, we shouldn't pass any password.
  const password = 'FakePassword';
  const wallet = getWalletFromAccount(account, password);
  const changeAddr = sender;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses([sender]) // TODO: Get multiple sender addresses
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos);
      const result = Wallet.spend(
        wallet,
        inputs,
        outputs,
        changeAddr
      );
      // TODO: Improve Rust error handling
      if (result.failed) {
        if (result.msg === 'FeeCalculationError(NotEnoughInput)') {
          throw new Error('not enough money');
        }
      }
      return result.result.fee;
    });
};

export const newAdaPayment = ({
  sender,
  receiver,
  amount,
  groupingPolicy,
  password
}: NewAdaPaymentParams): Promise<AdaTransaction> => {
  const account = getFromStorage(ACCOUNT_KEY);
  const wallet = getWalletFromAccount(account, password);
  const changeAddr = sender;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses([sender]) // TODO: Get multiple sender addresses
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos);
      const { result: { cbor_encoded_tx } } = Wallet.spend(
        wallet,
        inputs,
        outputs,
        changeAddr
      );
      const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
      return sendTx(signedTx);
    });
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

// FIXME: Transform data given the new endpoints
function mapTransactions(
  transactions: [],
  accountAddress,
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const { isOutgoing, amount } = spenderData(tx, accountAddress);
    const isPending = tx.ctsBlockHeight == null;
    return {
      ctAmount: {
        getCCoin: amount
      },
      ctConfirmations: tx.latestBlockNumber,
      ctId: tx.ctsId,
      ctInputs: tx.ctsInputs.map(mapInputOutput),
      ctIsOutgoing: isOutgoing,
      ctMeta: {
        ctmDate: tx.ctsTxTimeIssued,
        ctmDescription: undefined,
        ctmTitle: undefined
      },
      ctOutputs: tx.ctsOutputs.map(mapInputOutput),
      ctCondition: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
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

  const incoming = sum(tx.ctsOutputs);
  const outgoing = sum(tx.ctsInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  const isLocal =
    incoming.length === tx.ctsInputs.length &&
    outgoing.length === tx.ctsOutputs.length;

  let amount;
  if (isLocal) amount = outgoing.totalAmount;
  else if (isOutgoing) amount = outgoing.totalAmount - incoming.totalAmount;
  else amount = incoming.totalAmount - outgoing.totalAmount;

  return {
    isOutgoing,
    amount
  };
}

async function getBalance(addresses) {
  const utxos = await getUTXOsForAddresses(addresses);
  return utxos.reduce((acc, utxo) => acc.plus(new BigNumber(utxo.amount)), new BigNumber(0));
}

function mapUTXOsToInputs(utxos) {
  // FIXME: Manage addressing for HD wallet.
  // Hardcoded addressing, used only for simple wallets
  const masterAddressing = {
    addressing: {
      account: 0,
      change: 0,
      index: 0
    }
  };
  return utxos.map((utxo) => {
    const utxoAsInput = {
      ptr: {
        index: utxo.tx_index,
        id: utxo.tx_hash
      },
      value: {
        address: utxo.receiver,
        // FIXME: Currently js-wasm-module support Js Number, but amounts could be BigNumber's.
        value: Number(utxo.amount)
      }
    };
    return Object.assign(utxoAsInput, masterAddressing);
  });
}
