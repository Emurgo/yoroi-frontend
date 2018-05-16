// @flow

import range from 'lodash.range';
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
} from './types';

import {
  toAdaWallet,
  toAdaAddress
} from './lib/crypto-to-cardano';

import {
  generateWalletSeed,
  isValidAdaMnemonic,
  generateAdaMnemonic,
  getCryptoWalletFromSeed
} from './lib/crypto-wallet';

import {
  getUTXOsForAddresses,
  sendTx,
  checkAddressesInUse
} from './lib/icarus-backend-api';

import {
  listToMap,
  mapToList
} from './lib/utils';

const WALLET_KEY = 'WALLET'; // single wallet atm
const WALLET_SEED_KEY = 'SEED';
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

// TODO: Implement it!
export function isValidAdaAddress(address: string): Promise<boolean> {
  return Promise.resolve(true);
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

  newAdaAddress(cryptoAccount, 'External');

  saveWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

export async function restoreAdaWallet({
  walletPassword,
  walletInitData
}: AdaWalletParams): Promise<AdaWallet> {

  const [adaWallet, seed] = createWallet({ walletPassword, walletInitData });
  const cryptoAccount = getSingleCryptoAccount(seed, walletPassword);

  let addressesToSave = [];
  let fromIndex = 0;
  while (fromIndex >= 0) {
    // TODO: Make offset configurable
    const [newIndex, addressesRecovered] =
      await discoverAddressesFrom(cryptoAccount, 'External', fromIndex, 20);
    fromIndex = newIndex;
    addressesToSave = addressesToSave.concat(addressesRecovered);
  }
  if (addressesToSave.length !== 0) {
    // TODO: Store all at once
    addressesToSave.forEach((hash, index) => {
      const adaAddress: AdaAddress =
        toAdaAddress(cryptoAccount.account, 'External', index, hash);
      saveAdaAddress(adaAddress);
    });
  } else {
    newAdaAddress(cryptoAccount, 'External');
  }

  saveWallet(adaWallet, seed);
  return Promise.resolve(adaWallet);
}

export const updateAdaWallet = async (): Promise<?AdaWallet> => {
  const persistentWallet = getFromStorage(WALLET_KEY);
  if (!persistentWallet) return Promise.resolve();
  const persistentAddresses: AdaAddresses = getAdaAddresses();
  const addresses = persistentAddresses.map(addr => addr.cadId);
  // Update wallet balance
  const updatedWallet = Object.assign({}, persistentWallet, {
    cwAmount: {
      getCCoin: await getBalance(addresses)
    }
  });
  saveInStorage(WALLET_KEY, updatedWallet);
  // Update Wallet Txs History
  const history = [];
  if (history.length > 0) {
    saveInStorage(
      TX_KEY,
      mapTransactions(history, addresses[0]) // FIXME: Manage multiple addresses 
    );
  }
  return updatedWallet;
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

export const getAdaTransactionFee = (
  receiver: string,
  amount: string
): Promise<AdaTransactionFee> => {
  const adaWallet = getFromStorage(WALLET_KEY);
  const password = adaWallet.cwHasPassphrase ? 'FakePassword' : undefined;
  return getAdaTransaction(receiver, amount, password)
    .then((result) => {
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
    .then(({ result: { cbor_encoded_tx } }) => {
      // TODO: Handle Js-Wasm-cardano errors 
      const signedTx = Buffer.from(cbor_encoded_tx).toString('base64');
      return sendTx(signedTx);
    });
};

/* Create and save the next address for the given account */
export function newAdaAddress(cryptoAccount, addressType): AdaAddress {
  const address: AdaAddress = createAdaAddress(cryptoAccount, addressType);
  saveAdaAddress(address);
  return address;
}

export function getAdaAddresses(): AdaAddresses {
  return mapToList(getAdaAddressesMap());
}

export function getWalletSeed() {
  return getFromStorage(WALLET_SEED_KEY);
}

/**
 * Temporary method helpers
 */

export function getSingleCryptoAccount(seed, walletPassword: ?string) {
  const cryptoWallet = getCryptoWalletFromSeed(seed, walletPassword);
  return createCryptoAccount(cryptoWallet);
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
  receiver,
  amount,
  password
) {
  const seed = getFromStorage(WALLET_SEED_KEY);
  const cryptoWallet = getCryptoWalletFromSeed(seed, password);
  const addressesMap = getAdaAddressesMap();
  const addresses = mapToList(addressesMap);
  const changeAddr = addresses[0].cadId;
  const outputs = [{ address: receiver, value: parseInt(amount, 10) }];
  return getUTXOsForAddresses(addresses.map(addr => addr.cadId))
    .then((senderUtxos) => {
      const inputs = mapUTXOsToInputs(senderUtxos, addressesMap);
      return Wallet.spend(
        cryptoWallet,
        inputs,
        outputs,
        changeAddr
      );
    });
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
function createCryptoAccount(cryptoWallet) {
  const accountIndex = 0; /* Because we only provide a SINGLE account */
  return Wallet.newAccount(cryptoWallet, accountIndex).result.Ok;
}

function createAdaAddress(cryptoAccount, addressType): AdaAddress {
  const addresses = getAdaAddresses();
  const addressIndex = addresses ? addresses.length : 0;
  const { result } = Wallet.generateAddresses(cryptoAccount, addressType, [addressIndex]);
  return toAdaAddress(cryptoAccount.account, addressType, addressIndex, result[0]);
}

function saveAdaAddress(address: AdaAddress): void {
  const addressesMap = getAdaAddressesMap();
  addressesMap[address.cadId] = address;
  saveInStorage(ADDRESSES_KEY, addressesMap);
}

/* Just return all existing addresses because we are using a SINGLE account */
function getAdaAddressesMap() {
  const addresses = getFromStorage(ADDRESSES_KEY);
  if (!addresses) return {};
  return addresses;
}

async function discoverAddressesFrom(cryptoAccount, addressType, fromIndex, offset) {
  const addressesIndex = range(fromIndex, fromIndex + offset);
  const addresses = Wallet.generateAddresses(cryptoAccount, addressType, addressesIndex).result;
  const addressesMap = listToMap(addresses);
  const usedAddresses = await checkAddressesInUse(addresses);
  const lastIndex = usedAddresses.reduce((maxIndex, address) => {
    const index = addressesMap[address];
    if (index && index > maxIndex) {
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
