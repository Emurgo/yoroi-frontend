// @flow

import type {
  Address,
  Box,
  Tx,
  TxId,
  SignedTx,
  Value
} from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
//import { ErgoTxSignRequest } from '../../../app/api/ergo/lib/transactions/ErgoTxSignRequest';
//import { networks } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type {
  IGetAllUtxosResponse,
  IPublicDeriver,
  IGetSigningKey
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  asHasLevels,
  asGetSigningKey,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import BigNumber from 'bignumber.js';
import { BIP32PrivateKey, } from '../../../app/api/common/lib/crypto/keys/keyRepository';
import { generateKeys } from '../../../app/api/ergo/lib/transactions/utxoTransaction';
//import type { NetworkRow } from '../../../ada/lib/storage/database/primitives/tables'

import {
  InvalidWitnessError,
  SendTransactionApiError
} from '../../../app/api/common/errors';

import axios from 'axios';
import {
  Logger,
  stringifyError
} from '../../../app/utils/logging';

import type { UtxoTxOutput } from '../../../app/api/ada/lib/storage/database/transactionModels/utxo/api/read';

export async function connectorGetBalance(wallet: PublicDeriver<>, tokenId: string): Promise<BigNumber> {
  if (tokenId === 'ERG') {
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      const balance = await canGetBalance.getBalance();
      return Promise.resolve(balance.getDefault()); 
    }
    throw Error('asGetBalance failed in connectorGetBalance');
  } else {
    // TODO: handle filtering by currency
    return Promise.resolve(new BigNumber(5));
  }
}

function formatUtxoToBox(utxo: { output: UtxoTxOutput, ... }): Box {
    const tx = utxo.output.Transaction;
    const box = utxo.output.UtxoTransactionOutput;
    const tokens = utxo.output.tokens;
    // This doesn't seem right - is there a better way to access this?
    // Or a function that does this for us?
    console.log(`utxo = ${JSON.stringify(utxo)}`);
    // TODO: process other tokens too
    const token = tokens.find(token => token.TokenList.ListId === box.TokenListId);
    if (
      box.ErgoCreationHeight == null ||
      box.ErgoBoxId == null ||
      box.ErgoTree == null
    ) {
      throw new Error('missing Ergo fields for Ergo UTXO');
    }
    return {
      boxId: box.ErgoBoxId,
      ergoTree: box.ErgoTree,
      assets: [],
      additionalRegisters: {},
      creationHeight: box.ErgoCreationHeight,
      transactionId: tx.Hash,
      index: box.OutputIndex,
      value: parseInt(token.TokenList.Amount, 10)
    };
}

export async function connectorGetUtxos(wallet: PublicDeriver<>, valueExpected: ?number): Promise<Box[]> {
  const withUtxos = asGetAllUtxos(wallet);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  let utxos = await withUtxos.getAllUtxos();
  // TODO: more intelligently choose values?
  if (valueExpected != null) {
    // TODO: use bigint/whatever yoroi uses for values
    let valueAcc = 0;
    const utxosToUse = [];
    for (let i = 0; i < utxos.length && valueAcc < valueExpected; i += 1) {
      const val = parseInt(utxos[i].output.UtxoTransactionOutput.Amount, 10);
      console.log(`get_utxos[1]: at ${valueAcc} of ${valueExpected} requested - trying to add ${val}`);
      valueAcc += val;
      utxosToUse.push(utxos[i]);
      console.log(`get_utxos[2]: at ${valueAcc} of ${valueExpected} requested`);
    }
    utxos = utxosToUse;
  }
  const utxosFormatted = utxos.map(formatUtxoToBox);
  return Promise.resolve(utxosFormatted);
}

export async function connectorSignTx(publicDeriver: IPublicDeriver<ConceptualWallet>, password: string, utxos: any/* IGetAllUtxosResponse*/, tx: Tx, indices: Array<number>): Promise</* SignedTx */any> {
  const withLevels = asHasLevels(publicDeriver);
  if (withLevels == null) {
    throw new Error('wallet doesn\'t support levels');
  }
  const wallet = asGetSigningKey(withLevels);
  if (wallet == null) {
    throw new Error('wallet doesn\'t support signing');
  }
  await RustModule.load();
  let wasmTx;
  try {
    wasmTx = RustModule.SigmaRust.UnsignedTransaction.from_json(JSON.stringify(tx));
  } catch (e) {
    console.log(`tx parse error: ${e}`);
    throw e;
  }
  console.log(`tx: ${JSON.stringify(tx)}`);
  let boxIdsToSign = [];
  for (const index of indices) {
    const input = tx.inputs[index];
    boxIdsToSign.push(input.boxId);
  }
  console.log(`boxIdsToSign = ${JSON.stringify(boxIdsToSign)}`);
  //console.log(`106: ${JSON.stringify(utxos)}`);
  // TODO: utxo.output.ErgoBoxId if we got it from IGetAllUtxosResponse, but utxo.boxId from where we are getting it
  const utxosToSign = utxos.filter(utxo => boxIdsToSign.includes(utxo.output.UtxoTransactionOutput.ErgoBoxId));
  console.log(`utxos: ${JSON.stringify(utxos)}`);

  // const canGetSigningKey = await asGetSigningKey(wallet);
  // if (canGetSigningKey == null) {
  //   return Error('could not get signing key');
  // }
  const signingKey = await wallet.getSigningKey();
  const normalizedKey = await wallet.normalizeKey({
    ...signingKey,
    password,
  });
  const finalSigningKey = BIP32PrivateKey.fromBuffer(
    Buffer.from(normalizedKey.prvKeyHex, 'hex')
  );
  const wasmKeys = generateKeys({
    senderUtxos: utxosToSign,
    keyLevel: wallet.getParent().getPublicDeriverLevel(),
    signingKey: finalSigningKey,
  });
  const x = utxosToSign.map(formatUtxoToBox);
  console.log(`x = ${JSON.stringify(x)}`);
  let txBoxesToSign = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(x);
  console.log(`$$ txBoxesToSign = ${txBoxesToSign.len()}`);
  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(wasmKeys)
    .sign_transaction(
      RustModule.SigmaRust.ErgoStateContext.dummy(), // TODO? Not implemented in sigma-rust
      wasmTx,
      txBoxesToSign,
      RustModule.SigmaRust.ErgoBoxes.from_boxes_json([]), // TODO: not supported by sigma-rust
    );
  return signedTx.to_json();
}

export async function connectorSendTx(wallet: IPublicDeriver</* ConceptualWallet */>, tx: SignedTx): Promise<TxId> {  
  console.log(`tring to send: ${JSON.stringify(tx)}`);
  console.log('hi');
  const network = wallet.getParent().getNetworkInfo();
  const backend = network.Backend.BackendService;
  if (backend == null) {
    throw new Error('connectorSendTx: missing backend url');
  }
  return axios(
    `${backend}/api/txs/signed`,
    {
      method: 'post',
      timeout: 2 * 20000,//CONFIG.app.walletRefreshInterval,
      data: tx,
      // headers: {
      //   'yoroi-version': this.getLastLaunchVersion(),
      //   'yoroi-locale': this.getCurrentLocale()
      // }
    }
  ).then(response => {
    console.log(`tx send success: ${response.data.id}`);
    return Promise.resolve(response.data.id);
  })
    .catch((error) => {
      if (error.request.response.includes('Invalid witness')) {
        throw new InvalidWitnessError();
      }
      throw new SendTransactionApiError();
    });
}

// TODO: generic data sign
