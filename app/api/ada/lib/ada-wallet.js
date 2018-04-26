import bip39 from 'bip39';
import { Buffer } from 'safe-buffer';
import base58 from 'bs58';
import { HdWallet, Payload, Blake2b, Tx } from 'cardano-crypto';
import { decodeTx } from '../../../utils/cborCodec';
import {
  hashTransaction,
  signTransaction,
  derivePublic,
  encryptWithPassword
} from '../../../utils/crypto/cryptoUtils';
import hexToUInt8Array from '../../../utils/hexToUInt8Array';

import type { AdaWallet } from '../types';
import type { AdaWalletParams } from '../ada-methods';

export const generateAdaMnemonic = () => bip39.generateMnemonic(128).split(' ');

export const isValidAdaMnemonic = (
  phrase: string,
  numberOfWords: number = 12
) =>
  phrase.split(' ').length === numberOfWords && bip39.validateMnemonic(phrase);

export function toWallet({ walletPassword, walletInitData }: AdaWalletParams): AdaWallet {
  const { cwAssurance, cwName, cwUnit } = walletInitData.cwInitMeta;
  return {
    cwAccountsNumber: 1,
    cwAmount: {
      getCCoin: 0
    },
    cwHasPassphrase: !!walletPassword,
    cwId: '1111111111111111',
    cwMeta: {
      cwAssurance,
      cwName,
      cwUnit
    },
    cwPassphraseLU: new Date()
  };
}

export function generateAccount(secretWords, password) {
  const DERIVATION_PATH = [0, 1];

  const entropy = bip39.mnemonicToEntropy(secretWords);
  const seed = Blake2b.blake2b_256(entropy);

  const prv = HdWallet.fromSeed(seed);
  const d1 = HdWallet.derivePrivate(prv, DERIVATION_PATH[0]);
  const d2 = HdWallet.derivePrivate(d1, DERIVATION_PATH[1]);
  const d2Pub = HdWallet.toPublic(d2);

  const xpub = HdWallet.toPublic(prv);
  const hdpKey = Payload.initialise(xpub);
  const derivationPath = Payload.encrypt_derivation_path(
    hdpKey,
    new Uint32Array(DERIVATION_PATH)
  );
  const address = HdWallet.publicKeyToAddress(d2Pub, derivationPath);
  const xprv = Buffer.from(d2).toString('hex');
  /*
    TODO: For this release is ok but, in order to not to forget about this,
    in future releases we need to keep track of the mnemonic.
    Actually, if we wanted to, we would only need to encrypt the mnemonic.
    xprv can be easily derived from mnemonic and derivation path so maybe we could avoid storing it.
  */
  return {
    address: base58.encode(address),
    xprv: password ? encryptWithPassword(password, xprv) : xprv
  };
}

// FIXME: Improve by calling the rust function
function calculateSTxSize(encodedTx, inputsNum) {
  const pkSize = 64;
  const sigSize = 64;

  const encodeTxSize = encodedTx.length;
  const encodedWitnessSize = 1 + inputsNum * (7 + (2 + pkSize) + (2 + sigSize));
  return 1 + encodeTxSize + encodedWitnessSize;
}

// Calculates the fee for and encoded signed tx
function feeForEncodedStx(encodedTx, inputsNum) {
  const txSize = calculateSTxSize(encodedTx, inputsNum);
  return Math.ceil(155381 + 43.946 * txSize);
}

// Returns the remaining amount of creating a tx with the passed inputs and outputs
function txRemainingAmount(inputsUTxO, outputs) {
  const sumOutputs = outputs.reduce((accum, output) => accum + output.coin, 0);
  const sumInputs = inputsUTxO.reduce(
    (accum, utxo) => accum + utxo[1].toaOut.coin,
    0
  );

  return sumInputs - sumOutputs;
}

/**
 * Parses a TxInUtxo in string format to an object
 *
 * @param txInUtxoString - i.e. TxInUtxo_0037c2b699d0c5eaf991062c82a1debb1a3a32a6e018bb9d995b679df8b9b9ac_0
 * @returns txInUtxo in an object format. i.e.
 *          { txHash: 0037c2b699d0c5eaf991062c82a1debb1a3a32a6e018bb9d995b679df8b9b9ac, txIndex: 0}
 */
function parseTxInUtxo(txInUtxoString) {
  const prefixSize = 8;
  const txHashSize = 64;
  const start = prefixSize + 1;
  const end = start + txHashSize;

  const txHash = txInUtxoString.slice(start, end);
  const txIndex = Number(txInUtxoString.slice(prefixSize + 1 + txHashSize + 1));
  return {
    txHash,
    txIndex
  };
}

/**
 * Given a set of UTxO to use as inputs and some outputs, creates a tx
 *
 * @param inputsUTxO - utxo to be used as input of the tx
 * @param outputs - outputs of the tx
 * @returns an encoded tx
 */
function createTx(inputsUTxO, outputs) {
  const emptyTx = Tx.create();

  const txWithInputs = inputsUTxO.reduce((partialTx, utxo) => {
    const txIn = parseTxInUtxo(utxo[0]);
    const input = Tx.newTxIn(hexToUInt8Array(txIn.txHash), txIn.txIndex);
    return Tx.addInput(partialTx, input);
  }, emptyTx);

  const txWithOutputs = outputs.reduce((partialTx, output) => {
    const input = Tx.newTxOut(base58.decode(output.address), output.coin);
    return Tx.addOutput(partialTx, input);
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
function feeAndChangeForTx(senderAddress, inputsUTxO, outputs, txWithoutChange) {
  const remainingAmount = txRemainingAmount(inputsUTxO, outputs);

  // Obtain tx with fake change (change size is fixed)
  // FIXME: For fake change it is assumed that no there will be no fee
  //        This possibly increases the fee of the tx
  const fakeChange = Tx.newTxOut(base58.decode(senderAddress), remainingAmount);
  const txWithChange = Tx.addOutput(txWithoutChange, fakeChange);

  const txFeeStxWithChange = feeForEncodedStx(txWithChange, inputsUTxO.length);
  const txFeeStxWithoutChange = feeForEncodedStx(txWithoutChange, inputsUTxO.length);

  if (
    txFeeStxWithoutChange <= remainingAmount &&
    remainingAmount <= txFeeStxWithChange
  ) {
    return [txFeeStxWithoutChange, 0];
  } else if (remainingAmount > txFeeStxWithChange) {
    return [txFeeStxWithChange, remainingAmount - txFeeStxWithChange];
  }
  throw new Error('not enough money');
}

export function calculateTxFee(
  sender,
  senderUtxos,
  outputs
) {
  // FIXME: All utxos corresponding to the sender are selected as the inputs of the tx
  //        This possibly increases the tx fee
  const txWithoutChange = createTx(senderUtxos, outputs);

  const feeAndChange = feeAndChangeForTx(sender, senderUtxos, outputs, txWithoutChange);
  return feeAndChange[0];
}

export function buildSignedRequest(
  sender,
  senderUtxos,
  outputs,
  xprv
) {
  // FIXME: All utxos corresponding to the sender are selected as the inputs of the tx
  //        This possibly increases the tx fee
  const txWithoutChange = createTx(senderUtxos, outputs);

  const feeAndChange = feeAndChangeForTx(sender, senderUtxos, outputs, txWithoutChange);
  const change = feeAndChange[1];

  let tempEncodedTx;
  if (change !== 0) {
    const changeOut = Tx.newTxOut(base58.decode(sender), change);
    tempEncodedTx = Tx.addOutput(txWithoutChange, changeOut);
  } else {
    tempEncodedTx = txWithoutChange;
  }
  const encodedTx = btoa(String.fromCharCode.apply(null, tempEncodedTx));

  const txHash = Buffer.from(
    hashTransaction(Buffer.from(encodedTx, 'base64'))
  ).toString('hex');
  const signTag = '01';
  const protocolMagic = '1A25C00FA9';
  const tag = `${signTag}${protocolMagic}5820`;
  const toSign = Buffer.from(`${tag}${txHash}`, 'hex');
  // We currently sign with a single private key for this PoC
  const xprvArray = hexToUInt8Array(xprv);
  const txWitness = senderUtxos.map(() => {
    const pub = derivePublic(xprvArray);
    const key = Buffer.from(pub).toString('base64');
    const sig = Buffer.from(signTransaction(xprvArray, toSign)).toString('hex');

    return {
      tag: 'PkWitness',
      key,
      sig
    };
  });

  return {
    encodedTx,
    txWitness
  };
}
