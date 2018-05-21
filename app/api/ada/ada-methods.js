// @flow

import range from 'lodash.range';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { Wallet } from 'cardano-crypto';

import type {
  AdaWallet,
  AdaAddress,
  AdaAddresses,
  AdaWalletInitData,
  AdaWalletRecoveryPhraseResponse,
  AdaTransactions,
  AdaTransaction,
  AdaTransactionInputOutput,
  AdaTransactionFee,
  AddressType
} from './types';

import {
  toAdaWallet,
  toAdaAddress,
  getAddressTypeIndex
} from './lib/crypto-to-cardano';

import {
  generateWalletSeed,
  isValidAdaMnemonic,
  generateAdaMnemonic,
  getCryptoWalletFromSeed
} from './lib/crypto-wallet';

import {
  getTransactionsHistoryForAddresses,
  getUTXOsForAddresses,
  getUTXOsSumsForAddresses,
  sendTx,
  checkAddressesInUse
} from './lib/icarus-backend-api';

import {
  mapToList,
  getAddressInHex
} from './lib/utils';

const WALLET_KEY = 'WALLET'; // single wallet atm
const WALLET_SEED_KEY = 'SEED';
const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */
const ADDRESSES_KEY = 'ADDRESSES'; // we store a single Map<Address, AdaAddress>
const TX_KEY = 'TXS'; // single txs list atm

export type AdaWalletParams = {
  walletPassword: ?string,
  walletInitData: AdaWalletInitData
};

export type GetAdaHistoryByWalletParams = {
  ca: string,
  walletId: string,
  skip: number,
  limit: number
};

export function isValidAdaAddress(address: String): Promise<boolean> {
  return Promise.resolve(!Wallet.checkAddress(getAddressInHex(address)).failed);
}

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  isValidAdaMnemonic(phrase, numberOfWords);

/* Create and save a wallet with your seed, and a SINGLE account with one address */
export async function newAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {

  const [adaWallet, seed] = createWallet({ walletPassword, walletInitData });
  const cryptoAccount = getSingleCryptoAccount(seed, walletPassword);

  newAdaAddress(cryptoAccount, [], 'External');

  saveWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

export async function restoreAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {

  const [adaWallet, seed] = createWallet({ walletPassword, walletInitData });
  const cryptoAccount = getSingleCryptoAccount(seed, walletPassword);

  // TODO: Receive offset from params or use a constant config value
  const externalAddressesToSave = await
    discoverAllAddressesFrom(cryptoAccount, 'External', 0, 20);
  const internalAddressesToSave = await
    discoverAllAddressesFrom(cryptoAccount, 'Internal', 0, 20);

  if (externalAddressesToSave.length !== 0 || internalAddressesToSave.length !== 0) {
    // TODO: Store all at once
    saveAsAdaAddresses(cryptoAccount, externalAddressesToSave, 'External');
    saveAsAdaAddresses(cryptoAccount, internalAddressesToSave, 'Internal');
  } else {
    newAdaAddress(cryptoAccount, [], 'External');
  }

  saveWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

export const updateAdaWallet = async (): Promise<?AdaWallet> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve();
  const persistentAddresses: AdaAddresses = mapToList(getAdaAddressesMap());
  const addresses = persistentAddresses.map(addr => addr.cadId);
  // Update wallet balance
  const updatedWallet = Object.assign({}, persistentWallet, {
    cwAmount: {
      getCCoin: await getBalance(addresses)
    }
  });
  saveInStorage(WALLET_KEY, updatedWallet);
  const availableHistory = getAdaTxsHistory();
  await updateAdaTxsHistory(availableHistory, addresses);
  return updatedWallet;
};

const updateAdaTxsHistory = async (availableHistory, addresses) => {
  const mostRecentTx = availableHistory.shift();
  const dateFrom = mostRecentTx ? moment(mostRecentTx.ctMeta.ctmDate) : moment(new Date(0));
  const history = await getTransactionsHistoryForAddresses(addresses, dateFrom);
  if (history.length > 0) {
    const transactions = mapTransactions(history, addresses).concat(availableHistory);
    if (history.length === 20) { // FIXME: This should be a configurable variable
      await updateAdaTxsHistory(transactions, addresses);
    } else {
      saveInStorage(TX_KEY, transactions);
    }
  }
};

export const getAdaAccountRecoveryPhrase = (): AdaWalletRecoveryPhraseResponse =>
  generateAdaMnemonic();

export const getAdaTxsHistoryByWallet = ({
  walletId,
  skip,
  limit
}: GetAdaHistoryByWalletParams): Promise<AdaTransactions> => {
  const transactions = getAdaTxsHistory();
  return Promise.resolve([transactions, transactions.length]);
};

export const getAdaTransactionFee = (
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> => {
  const adaWallet = getFromStorage(WALLET_KEY);
  const password = adaWallet.cwHasPassphrase ? 'FakePassword' : undefined;
  return getAdaTransaction(receiver, amount, password)
    .then((response) => {
      const result = response[0];
      // TODO: Improve Js-Wasm-cardano error handling 
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

export const newAdaTransaction = (
  receiver: string,
  amount: string,
  password: ?string
): Promise<AdaTransaction> => {
  return getAdaTransaction(receiver, amount, password)
    .then(([{ result: { cbor_encoded_tx } }, changeAdaAddr]) => {
      // TODO: Handle Js-Wasm-cardano errors 
      const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
      return Promise.all([changeAdaAddr, sendTx(signedTx)]);
    })
    .then(([backendResponse, changeAdaAddr]) => {
      // Only if the tx was send, we should track the change Address.
      saveAdaAddress(changeAdaAddr);
      return backendResponse;
    });
};

/* Create and save the next address for the given account */
export function newAdaAddress(
  cryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddress {
  const address: AdaAddress = createAdaAddress(cryptoAccount, addresses, addressType);
  saveAdaAddress(address);
  return address;
}

export function filterAdaAddressesByType(
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddresses {
  return addresses.filter((address: AdaAddress) =>
      address.change === getAddressTypeIndex(addressType));
}

export function getWalletSeed() {
  return getFromStorage(WALLET_SEED_KEY);
}

/**
 * Temporary method helpers
 */

/* Just return all existing addresses because we are using a SINGLE account */
export function getAdaAddressesMap() {
  const addresses = getFromStorage(ADDRESSES_KEY);
  if (!addresses) return {};
  return addresses;
}

export function getSingleCryptoAccount(seed, walletPassword: ?string) {
  const cryptoWallet = getCryptoWalletFromSeed(seed, walletPassword);
  return getCryptoAccount(cryptoWallet, ACCOUNT_INDEX);
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

function getAdaTransaction(
  receiver: string,
  amount: string,
  password: ?string
) {
  const seed = getFromStorage(WALLET_SEED_KEY);
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  const cryptoAccount = getCryptoAccount(cryptoWallet, ACCOUNT_INDEX);
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAdaAddr = createAdaAddress(cryptoAccount, addresses, 'Internal');
  const changeAddr = changeAdaAddr.cadId;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses(addresses.map(addr => addr.cadId))
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos, addressesMap);
      return [
        Wallet.spend(
          cryptoWallet,
          inputs,
          outputs,
          changeAddr),
        changeAdaAddr
      ];
    });
}

function mapTransactions(
  transactions: [],
  accountAddresses,
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const inputs = mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = spenderData(inputs, outputs, accountAddresses);
    const isPending = tx.block_num === null;
    return {
      ctAmount: {
        getCCoin: amount
      },
      ctConfirmations: tx.best_block_num - tx.block_num,
      ctId: tx.hash,
      ctInputs: inputs,
      ctIsOutgoing: isOutgoing,
      ctMeta: {
        ctmDate: tx.time,
        ctmDescription: undefined,
        ctmTitle: undefined
      },
      ctOutputs: outputs,
      ctCondition: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
    };
  });
}

function mapInputOutput(addresses, amounts): AdaTransactionInputOutput {
  return addresses.map((address, index) => [address, { getCCoin: amounts[index] }]);
}

function spenderData(txInputs, txOutputs, addresses) {
  const sum = toSum =>
    toSum.reduce(
      ({ totalAmount, count }, [address, { getCCoin }]) => {
        if (addresses.indexOf(address) < 0) return { totalAmount, count };
        return {
          totalAmount: totalAmount.plus(new BigNumber(getCCoin)),
          count: count + 1
        };
      },
      {
        totalAmount: new BigNumber(0),
        count: 0
      }
    );

  const incoming = sum(txOutputs);
  const outgoing = sum(txInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  const isLocal =
    incoming.count === txInputs.length &&
    outgoing.count === txOutputs.length;

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
  const utxoSum = await getUTXOsSumsForAddresses(addresses);
  return utxoSum.sum ? new BigNumber(utxoSum.sum) : new BigNumber(0);
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

function createWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams) {
  const adaWallet = toAdaWallet({ walletPassword, walletInitData });
  const mnemonic = walletInitData.cwBackupPhrase.bpToList;
  const seed = generateWalletSeed(mnemonic, walletPassword);
  return [adaWallet, seed];
}

function saveWallet(adaWallet, seed): void {
  saveInStorage(WALLET_KEY, adaWallet);
  saveInStorage(WALLET_SEED_KEY, seed);
}

/* TODO: crypto account should be stored in the localstorage
   in order to avoid insert password each time the user creates a new address
   (implement method: saveCryptoAccount)
*/
function getCryptoAccount(cryptoWallet, accountIndex: number) {
  return Wallet.newAccount(cryptoWallet, accountIndex).result.Ok;
}

function createAdaAddress(
  cryptoAccount,
  addresses: AdaAddresses,
  addressType: AddressType
): AdaAddress {
  const filteredAddresses = filterAdaAddressesByType(addresses, addressType);
  const addressIndex = filteredAddresses.length;
  const result = Wallet.generateAddresses(cryptoAccount, addressType, [addressIndex]);
  return toAdaAddress(cryptoAccount.account, addressType, addressIndex, result.result[0]);
}

function saveAdaAddress(address: AdaAddress): void {
  const addressesMap = getAdaAddressesMap();
  addressesMap[address.cadId] = address;
  saveInStorage(ADDRESSES_KEY, addressesMap);
}

function saveAsAdaAddresses(
  cryptoAccount,
  addresses: Array<string>,
  addressType: AddressType
): void {
  addresses.forEach((hash, index) => {
    const adaAddress: AdaAddress =
      toAdaAddress(cryptoAccount.account, addressType, index, hash);
    saveAdaAddress(adaAddress);
  });
}

function getAdaTxsHistory() {
  return getFromStorage(TX_KEY) || [];
}

async function discoverAllAddressesFrom(
  cryptoAccount,
  addressType: AddressType,
  initialIndex: number,
  offset: number
) {
  let addressesDiscovered = [];
  let fromIndex = initialIndex;
  while (fromIndex >= 0) {
    const [newIndex, addressesRecovered] =
      await discoverAddressesFrom(cryptoAccount, addressType, fromIndex, offset);
    fromIndex = newIndex;
    addressesDiscovered = addressesDiscovered.concat(addressesRecovered);
  }
  return addressesDiscovered;
}

async function discoverAddressesFrom(
  cryptoAccount,
  addressType: AddressType,
  fromIndex: number,
  offset: number
) {
  const addressesIndex = range(fromIndex, fromIndex + offset);
  const addresses = Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex).result;
  const addressIndexesMap = toAddressIndexesMap(addresses);
  const usedAddresses = await checkAddressesInUse(addresses);
  const lastIndex = usedAddresses.reduce((maxIndex, address) => {
    const index = addressIndexesMap[address];
    if (index > maxIndex) {
      return index;
    }
    return maxIndex;
  }, -1);
  if (lastIndex >= 0) {
    const nextIndex = lastIndex + 1;
    return Promise.resolve([nextIndex, addresses.slice(0, nextIndex - fromIndex)]);
  }
  return Promise.resolve([lastIndex, []]);
}

function toAddressIndexesMap(addresses: Array<string>) {
  const map = {};
  addresses.forEach((address, index) => {
    map[address] = index;
  });
  return map;
}
