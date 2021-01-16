// @flow

import type {
  Box,
  Tx,
  SignedTx,
  Value
} from './types';
import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
//import { ErgoTxSignRequest } from '../../../app/api/ergo/lib/transactions/ErgoTxSignRequest';
//import { networks } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type {
  IGetAllUtxosResponse,
  IPublicDeriver
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
  IGetSigningKey
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import { ConceptualWallet } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/index';
import type { IHasLevels } from '../../../app/api/ada/lib/storage/models/ConceptualWallet/interfaces';
import BigNumber from 'bignumber.js';
import { BIP32PrivateKey, } from '../../../app/api/common/lib/crypto/keys/keyRepository';
import { generateKeys } from '../../../app/api/ergo/lib/transactions/utxoTransaction';
// UtxoTxOutput.UtxoTransactionOutput.TransactionId/OutputIndex?

export async function connectorGetBalance(wallet: PublicDeriver<>, tokenId: string): Promise<BigNumber> {
  if (tokenId === 'ERG') {  
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      return canGetBalance.getBalance();
    }
    throw Error('asGetBalance failed in connectorGetBalance');
  } else {
    // TODO: handle filtering by currency
    return Promise.resolve(new BigNumber(5));
  }
}

function formatUtxoToBox(utxo): Box {
    const tx = utxo.output.Transaction;
    const box = utxo.output.UtxoTransactionOutput;
    if (
      box.ErgoCreationHeight == null ||
      box.ErgoBoxId == null ||
      box.ErgoTree == null
    ) {
      throw new Error('missing Ergo fields for Ergo UTXO');
    }
    return {
      boxId: box.ErgoBoxId,
      value: parseInt(box.Amount, 10),
      ergoTree: box.ErgoTree,
      assets: [],
      additionalRegisters: {},
      creationHeight: box.ErgoCreationHeight,
      transactionId: tx.Hash,
      index: box.OutputIndex
    }
}

export async function connectorGetUtxos(wallet: PublicDeriver<>, valueExpected: ?number): Promise<Box[]> {
  const canGetAllUtxos = await asGetAllUtxos(wallet);
  if (canGetAllUtxos != null) {
    let utxos = await canGetAllUtxos.getAllUtxos();
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
  throw Error('asGetAllUtxos failed');
}



export async function connectorSignTx(wallet: IPublicDeriver<ConceptualWallet & IHasLevels> & IGetSigningKey, password: string, utxos: any/* IGetAllUtxosResponse*/, tx: Tx, indices: Array<number>): Promise<SignedTx> {
  console.log('loading rustmodule');
  await RustModule.load();
  console.log(RustModule);
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
  // const config = getErgoBaseConfig(networks.ErgoMainnet)
  //   .reduce((acc, next) => Object.assign(acc, next), {});
  // const signReq = new ErgoTxSignRequest({
  //   senderUtxos: utxosToSign,
  //   unsignedTx: wasmTx,
  //   changeAddr: [], // change addrs not used for signing?
  //   networkSettingSnapshot: {
  //     FeeAddress: config.FeeAddress,
  //     ChainNetworkId: (Number.parseInt(config.ChainNetworkId, 10)),
  //   }
  // });
  //let allTxBoxes = ;
  const x = utxosToSign.map(formatUtxoToBox);
  console.log(`x = ${JSON.stringify(x)}`);
  let txBoxesToSign = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(x);
  console.log(`$$ txBoxesToSign = ${txBoxesToSign.len()}`);
  // for (let i = 0; i < allTxBoxes.length(); i += 1) {
  //   txBoxesToSign.add(wasm.ErgoBox.from_json(allTxBoxes[i])));
  // }
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

// TODO: generic data sign
