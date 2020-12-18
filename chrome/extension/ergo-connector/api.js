// @flow

import type {
  Box,
  Tx,
  SignedTx,
  Value
} from './types';
//import { RustModule } from '../../../app/api/ada/lib/cardanoCrypto/rustLoader';
//import { ErgoTxSignRequest } from '../../../app/api/ergo/lib/transactions/ErgoTxSignRequest';
//import { networks } from '../../../app/api/ada/lib/storage/database/prepackaged/networks';
import type {
  IGetAllUtxosResponse
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/interfaces';
import {
  PublicDeriver,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/index';
import {
  asGetAllUtxos,
  asGetBalance,
} from '../../../app/api/ada/lib/storage/models/PublicDeriver/traits';
import BigNumber from 'bignumber.js';
//import { generateKeys } from '../../../app/api/ergo/lib/transactions/utxoTransaction';
// UtxoTxOutput.UtxoTransactionOutput.TransactionId/OutputIndex?

export async function connectorGetBalance(wallet: PublicDeriver<>, tokenId: string): Promise<BigNumber> {
  if (tokenId === 'ERG') {  
    const canGetBalance = asGetBalance(wallet);
    if (canGetBalance != null) {
      return canGetBalance.getBalance();
    }
  } else {
    // TODO: handle filtering by currency
    return Promise.resolve(new BigNumber(5));
  }
}

export async function connectorGetUtxos(wallet: PublicDeriver<>, valueExpected: ?number): Promise<Array<Box>> {
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
    const utxosFormatted = utxos.map(utxo => {
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
        value: box.Amount,
        ergoTree: box.ErgoTree,
        assets: [],
        additionalRegisters: {},
        creationHeight: box.ErgoCreationHeight,
        transactionId: tx.TransactionId,
        index: box.OutputIndex
      }
    });
    return Promise.resolve(utxosFormatted);
  }
  throw Error("asGetAllUtxos failed");
}

export async function connectorSignTx(password: string, utxos: any/* IGetAllUtxosResponse*/, tx: Tx, indeces: Array<number>): Promise<SignedTx> {
  // mocked out
  return Promise.resolve({
    id: tx.id,
    inputs: tx.inputs.map(input => {
      return {
        boxId: input.boxId,
        spendingProof: {
          proofBytes: '0x267272632abddfb172',
          extension: {}
        },
        extension: {}
      }
    }),
    dataInputs: tx.dataInputs,
    outputs: tx.outputCandidates.map(box => {
      return {
        ...box,
        transactionId: tx.id,
        index: 0
      }
    }),
    size: 0
  });
}

// TODO: generic data sign