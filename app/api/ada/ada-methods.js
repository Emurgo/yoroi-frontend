// @flow

import BigNumber from 'bignumber.js';
import base58 from 'bs58';
import { HdWallet, Tx } from 'rust-cardano-crypto';
import CardanoNodeApi from '../CardanoNodeApi';
import { decodeTx } from '../../utils/cborCodec';
import { hashTransaction, signTransaction, derivePublic } from '../../utils/crypto/cryptoUtils';

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

import { getInfo, getTxInfo } from './lib/explorer-api';
import { syncStatus } from './lib/cardano-sl-api';

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

export type RestoreAdaWalletParams = {
  walletPassword: ?string,
  walletInitData: AdaWalletInitData
};

export type NewAdaPaymentParams = {
  sender: string,
  receiver: string,
  amount: string,
  password: ?string,
  // "groupingPolicy" - Spend everything from the address
  // "OptimizeForSize" for no grouping
  groupingPolicy: ?'OptimizeForSecurity' | 'OptimizeForSize',
};

export const isValidAdaAddress = ({
  /*ca, */ address
}: IsValidAdaAddressParams): Promise<boolean> => Promise.resolve(true);

export const isValidMnemonic = (phrase: string, numberOfWords: number = 12) =>
  isValidAdaMnemonic(phrase, numberOfWords);

export async function newAdaWallet({
  password, 
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
    const txRequests = accountResponse.caTxList.map(({ ctbId }) =>
      getTxInfo(ctbId)
    );
    const [syncStatusResponse, ...txsResponse] = await Promise.all(
      [syncStatus()].concat(txRequests)
    );

    const latestBlockNumber =
      syncStatusResponse._spNetworkCD.getChainDifficulty.getBlockCount;

    saveInStorage(
      TX_KEY,
      mapTransactions(txsResponse, account.address, latestBlockNumber)
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

export const newAdaPayment = (
  { ca, sender, receiver, amount, groupingPolicy, password }: NewAdaPaymentParams
): Promise<AdaTransaction> => {
  let xprv = {} //FIXME: Obtain private key
  // Get UTXOs for source address.
  return CardanoNodeApi.transactions.getUTXOsOfAddress(sender)
    .then(utxoResponse => buildSignedRequest(sender, receiver, parseInt(amount), utxoResponse, xprv))
    .flatMap(toSend => CardanoNodeApi.transactions.sendTx(toSend))
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

function mapTransactions(
  transactions: [],
  accountAddress,
  latestBlockNumber
): Array<AdaTransaction> {
  return transactions.map(tx => {
    const { isOutgoing, amount } = spenderData(tx, accountAddress);
    return {
      ctAmount: {
        getCCoin: amount
      },
      ctConfirmations: latestBlockNumber - tx.ctsBlockHeight,
      ctId: tx.ctsId,
      ctInputs: tx.ctsInputs.map(mapInputOutput),
      ctIsOutgoing: isOutgoing,
      ctMeta: {
        ctmDate: tx.ctsTxTimeIssued,
        ctmDescription: undefined,
        ctmTitle: undefined
      },
      ctOutputs: tx.ctsOutputs.map(mapInputOutput),
      ctCondition: 'CPtxInBlocks' // FIXME: What's this?
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

// FIXME: Improve by calling the rust function
const calculateSTxSize = function (encodedTx, inputsNum) {
  let pkSize = 64, sigSize = 64;

  let encodeTxSize = encodedTx.length;
  let encodedWitnessSize = 1 + inputsNum * (7 + (2 + pkSize) + (2 + sigSize));
  return 1 + encodeTxSize + encodedWitnessSize;
}

// Calculates the fee for and encoded signed tx
const feeForEncodedStx = function (encodedTx, inputsNum) {
  const txSize = calculateSTxSize(encodedTx, inputsNum);
  return 155381 + 43.946 * txSize;
}

// Returns the remaining amount of creating a tx with the passed inputs and outputs
const txRemainingAmount = function (inputsUTxO, outputs) {
  const sumOutputs = outputs.reduce( (accum, output) => accum + output.coin, 0);
  const sumInputs = inputsUTxO.reduce( (accum, utxo) => accum + utxo[1].toaOut.coin , 0);

  return sumInputs - sumOutputs;
}

/**
 * Parses a TxInUtxo in string format to an object
 * 
 * @param txInUtxoString - i.e. TxInUtxo_0037c2b699d0c5eaf991062c82a1debb1a3a32a6e018bb9d995b679df8b9b9ac_0
 * @returns txInUtxo in an object format. i.e.
 *          { txHash: 0037c2b699d0c5eaf991062c82a1debb1a3a32a6e018bb9d995b679df8b9b9ac, txIndex: 0}
 */
const parseTxInUtxo = function (txInUtxoString) {
  const prefixSize = 8;
  const txHashSize = 64;

  let txIn = {};

  txIn.txHash = txInUtxoString.slice(prefixSize + 1, prefixSize + 1 + txHashSize);
  txIn.txIndex = Number(txInUtxoString.slice(prefixSize + 1 + txHashSize + 1));
  return txIn;
}

// Convert from hex string to UInt8Array
function toByteArray(input) {
  let hexString = input.slice(0, input.length);
  let result = [];
  while (hexString.length >= 2) {
    result.push(parseInt(hexString.substring(0, 2), 16));
    hexString = hexString.substring(2, hexString.length);
  }
  return result;
}

/**
 * Given a set of UTxO to use as inputs and some outputs, creates a tx
 * 
 * @param inputsUTxO - utxo to be used as input of the tx
 * @param outputs - outputs of the tx
 * @returns an encoded tx
 */
const createTx = function (inputsUTxO, outputs) {
  const emptyTx = Tx.create();

  const txWithInputs = inputsUTxO.reduce( (partialTx, utxo) => {
    const txIn = parseTxInUtxo(utxo[0]);
    const input = Tx.newTxIn(toByteArray(txIn.txHash), txIn.txIndex);
    return Tx.addInput(partialTx, input)
  }, emptyTx);

  const txWithOutputs = outputs.reduce( (partialTx, output) => {
    const input = Tx.newTxOut(base58.decode(output.address), output.coin);
    return Tx.addOutput(partialTx, input)
  }, txWithInputs);

  return txWithOutputs;
}

/**
 * Calculates the fee for a tx.
 * Checks whether the tx should have a change or not depending on it's fee
 * 
 * @param senderAddress - sender of the tx
 * @param remainingAmount - difference between the inputs and outputs of the tx
 * @param txWithoutChange - encoded tx that doesn't still have the change
 * @returns (txFee, shouldHaveChange)
 * @throws if there's not enough balance in the sender account
 */
const feeForTx = function (senderAddress, remainingAmount, txWithoutChange, inputsNum) {
  const fakeSignerXPrv = HdWallet.fromSeed("patakbardaqskovoroda228pva1488kk");

  // Obtain tx with fake change (change size is fixed)
  // FIXME: For fake change it is assumed that no there will be no fee
  //        This possibly increases the fee of the tx
  const fakeChange = Tx.newTxOut(base58.decode(senderAddress), remainingAmount);
  const txWithChange = Tx.addOutput(txWithoutChange, fakeChange);

  const txFeeStxWithChange = feeForEncodedStx(txWithChange, inputsNum);
  const txFeeStxWithoutChange = feeForEncodedStx(txWithoutChange, inputsNum);

  if(txFeeStxWithoutChange <= remainingAmount && remainingAmount <= txFeeStxWithChange)
    return [txFeeStxWithoutChange, false];
  else if (remainingAmount > txFeeStxWithChange)
    return [txFeeStxWithChange, true];
  else
    throw new Error('Not enough balance on sender');
}

const receiverIsValid = function (decodedTx, receiver, amount) {
  const receivers = decodedTx.txOutputs.filter((output) => {
    return output.address === receiver &&
      output.coin === amount;
  });
  return receivers.length === 1;
};

const senderIsValid = function (decodedTx, sender) {
  const senders = decodedTx.txOutputs.filter((output) => {
    return output.address === sender;
  });
  return senders.length > 0;
};

const validateSimpleTx = function (decodedTx, sender, receiver, amount) {
  return receiverIsValid(decodedTx, receiver, amount) &&
    senderIsValid(decodedTx, sender);
};

const buildSignedRequest = function (sender, receiver, amount, utxosResponse, xprv) {
  // FIXME: All utxos corresponding to the sender are selected as the inputs of the tx
  //        This possibly increases the tx fee
  const utxosInputs = utxosResponse.Right
  const outputs = [ { address: receiver, coin: amount } ];

  const txWithoutChange = createTx(utxosInputs, outputs);

  const remainingAmount = txRemainingAmount(utxosInputs, outputs);
  const feeResponse = feeForTx(sender, remainingAmount, txWithoutChange, utxosInputs.length);
  const fee = feeResponse[0], withChange = feeResponse[1];

  var encodedTx;

  if (withChange) {
    const changeOut = Tx.newTxOut(base58.decode(sender), remainingAmount - fee);
    const tempEncodedTx = Tx.addOutput(txWithoutChange, changeOut);
    const decoder = new TextDecoder('utf8');
    encodedTx = btoa(String.fromCharCode.apply(null, tempEncodedTx));
  } else {
    encodedTx = txWithoutChange;
  }

  // FIXME: Remove this check?
  const decodedTx = decodeTx(encodedTx);
  if (!decodedTx || (decodedTx && !validateSimpleTx(decodedTx, sender, receiver, amount))) {
    throw new Error('Invalid Tx');
  }

  const txHash = Buffer.from(hashTransaction(Buffer.from(encodedTx, 'base64'))).toString('hex');
  const signTag = '01';
  const protocolMagic = '1A25C00FA9';
  const tag = `${signTag}${protocolMagic}5820`;
  const toSign = Buffer.from(`${tag}${txHash}`, 'hex');
  // We currently sign with a single private key for this PoC
  const txWitness = utxosInputs.map(() => {
    const pub = derivePublic(xprv);
    const key = Buffer.from(pub).toString('base64');
    const sig = Buffer.from(signTransaction(xprv, toSign)).toString('hex');

    return {
      tag: 'PkWitness',
      key,
      sig,
    };
  });

  const toSend = {
    encodedTx,
    txWitness
  };
}