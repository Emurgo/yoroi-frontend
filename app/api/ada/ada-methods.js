// @flow

import BigNumber from 'bignumber.js';

import type {
  AdaWallet,
  AdaWallets,
  AdaAddress,
  AdaAddresses,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse,
  AdaTransactions,
  AdaTransaction,
  AdaTransactionInputOutput,
  AdaTransactionFee,
  AdaTxFeeParams
} from './types';

import {
  toWallet,
  generateWalletSeed,
  isValidAdaMnemonic,
  generateAdaMnemonic,
} from './lib/ada-wallet';

import { Wallet } from 'cardano-crypto';

import {
  getCryptoWalletFromSeed
} from './lib/ada-wallet';

import {
  getTransactionsHistoryForAddresses,
  getUTXOsForAddresses,
  sendTx
} from './lib/icarus-backend-api';

const WALLET_KEY = 'WALLET'; // single wallet atm
const WALLET_SEED_KEY = 'SEED'; 
const ADDRESSES_KEY = 'ADDRESSES';
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

export type NewAdaTransactionParams = {
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

/* Create and save a wallet with your seed, and a SINGLE account with one address */
export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {

  const wallet = toWallet({ walletPassword, walletInitData });
  saveInStorage(WALLET_KEY, wallet);

  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const seed = generateWalletSeed(mnemonic, walletPassword);
  saveInStorage(WALLET_SEED_KEY, seed);

  const cryptoWallet = getCryptoWalletFromSeed(seed, walletPassword);
  newAdaAccount(cryptoWallet);

  return Promise.resolve(wallet);
}

export const restoreAdaWallet = ({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> =>
  newAdaWallet({ walletPassword, walletInitData });

export const updateAdaWallets = async (): Promise<AdaWallets> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  const persistentAddresses: AdaAddresses = getAdaAddresses();
  if (!persistentWallet) return Promise.resolve([]);
  const addresses = persistentAddresses.map(addr => addr.cadId);
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

export const getAdaHistoryByWallet = ({
  walletId,
  skip,
  limit
}: GetAdaHistoryByWalletParams): Promise<AdaTransactions> => {
  const transactions = getFromStorage(TX_KEY);
  if (!transactions) return Promise.resolve([[], 0]);

  return Promise.resolve([transactions, transactions.length]);
};

export const getAdaTransactionFee = ({
  sender,
  receiver,
  amount,
  groupingPolicy
}: AdaTxFeeParams): Promise<AdaTransactionFee> => {
  const senders = getAdaAddresses();
  const seed = getFromStorage(WALLET_SEED_KEY);
  const walletFromStorage = getFromStorage(WALLET_KEY);
  const password = walletFromStorage.cwHasPassphrase ? 'FakePassword' : undefined;
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  // FIXME: ChangeAddr should be an 'internal' address
  const changeAddr = senders[0].cadId;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses(senders.map(addr => addr.cadId))
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos, getFromStorage(ADDRESSES_KEY));
      const result = Wallet.spend(
        cryptoWallet,
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
      return {
        getCCoin: result.result.fee
      };
    });
};

export const newAdaTransaction = ({
  sender,
  receiver,
  amount,
  groupingPolicy,
  password
}: NewAdaTransactionParams): Promise<AdaTransaction> => {
  const senders = getAdaAddresses();
  const seed = getFromStorage(WALLET_SEED_KEY);
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  // FIXME: ChangeAddr should be an 'internal' address
  const changeAddr = senders[0].cadId;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses(senders.map(addr => addr.cadId))
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos, getFromStorage(ADDRESSES_KEY));
      const { result: { cbor_encoded_tx } } = Wallet.spend(
        cryptoWallet,
        inputs,
        outputs,
        changeAddr
      );
      const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
      return sendTx(signedTx);
    });
};

/* Create a SINGLE account with one address */
export function newAdaAccount(cryptoWallet) {
  const account = createAdaAccount(cryptoWallet);
  // TODO: account should be stored in the localstorage in order to avoid insert password each time.
  // saveAdaAccount(account);
  newAdaAddress(account);
  return account;
}

/* Create and save the next address for the given account */
export function newAdaAddress(account): AdaAddress {
  const address: AdaAddress = createAdaAddress(account, 'External');
  saveAdaAddress(address);
  return address;
}

/* Just return all existing addresses because we are using a SINGLE account */
export function getAdaAddresses(): AdaAddresses {
  const addresses = getFromStorage(ADDRESSES_KEY);
  return Object.values(addresses ? addresses : {});
}

/**
 * Temporally method helpers
 */

export function getSingleAccount(password: ?string) {
  const seed = getFromStorage(WALLET_SEED_KEY);
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  return createAdaAccount(cryptoWallet);
}

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

function mapUTXOsToInputs(utxos, adaAddressesMap) {
  return utxos.map((utxo) => {
    return {
      ptr: {
        index: utxo.tx_index,
        id: utxo.tx_hash
      },
      value: {
        address: utxo.receiver,
        // FIXME: Currently js-wasm-module support Js Number, but amounts could be BigNumber's.
        value: Number(utxo.amount)
      },
      addressing: {
        account: adaAddressesMap[utxo.receiver].account,
        change: adaAddressesMap[utxo.receiver].change,
        index: adaAddressesMap[utxo.receiver].index
      }
    };
  });
}

function createAdaAccount(wallet) {
  const accountIndex = 0; /* Because we only provide a SINGLE account */
  return Wallet.newAccount(wallet, accountIndex).result.Ok;
}

// TODO: Implement it
// We should track the last account index created
// function saveAdaAccount(account)

function createAdaAddress(account, addressType): AdaAddress {
  const addresses = getAdaAddresses();
  const addressIndex = addresses ? addresses.length : 0;
  const { result } = Wallet.generateAddresses(account, addressType, [addressIndex]);
  const address: AdaAddress = {
    cadAmount: {
      getCCoin: 0
    },
    cadId: result[0],
    cadIsUsed: false,
    account: 0,
    change: 0, // TODO: Should be configurable
    index: addressIndex
  };
  return address;
}

function saveAdaAddress(address: AdaAddress) {
  let addresses = getFromStorage(ADDRESSES_KEY);
  if (!addresses) {
    addresses = {};
  }
  addresses[address.cadId] = address;
  saveInStorage(ADDRESSES_KEY, addresses);
}
