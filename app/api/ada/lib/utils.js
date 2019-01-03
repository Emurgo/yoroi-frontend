// @flow
import bs58 from 'bs58';
import cbor from 'cbor';
import BigNumber from 'bignumber.js';
import type {
  AdaTransactionInputOutput,
  Transaction,
  AdaTransaction,
  AdaTransactionCondition
} from '../adaTypes';
import {
  stringifyError
} from '../../../utils/logging';
// eslint-disable-next-line
import { Blake2b } from 'rust-cardano-crypto';

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map: any): Array<any> {
  return Object.values(map);
}

export function getAddressInHex(address: string): string {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
}

export type DecodedAddress = {
  root: string,
  attr: any,
  type: number,
  checksum: number
}

export const toAdaTx = function (
  amount: BigNumber,
  tx: Transaction,
  inputs: Array<AdaTransactionInputOutput>,
  isOutgoing: boolean,
  outputs: Array<AdaTransactionInputOutput>,
  time: string
): AdaTransaction {
  return {
    ctAmount: {
      getCCoin: amount.toString()
    },
    ctBlockNumber: Number(tx.block_num || ''),
    ctId: tx.hash,
    ctInputs: inputs,
    ctIsOutgoing: isOutgoing,
    ctMeta: {
      ctmDate: new Date(time),
      ctmDescription: undefined,
      ctmTitle: undefined,
      ctmUpdate: new Date(tx.last_update)
    },
    ctOutputs: outputs,
    ctCondition: _getTxCondition(tx.tx_state)
  };
};

/** Convert TxState from icarus-importer to AdaTransactionCondition */
const _getTxCondition = (state: string): AdaTransactionCondition => {
  if (state === 'Successful') return 'CPtxInBlocks';
  if (state === 'Pending') return 'CPtxApplying';
  return 'CPtxWontApply';
};

export class CborIndefiniteLengthArray {
  elements: Array<any>;
  constructor(elements: Array<any>) {
    this.elements = elements;
  }
  encodeCBOR(encoder: cbor.Encoder) {
    return encoder.push(
      Buffer.concat([
        Buffer.from([0x9f]), // indefinite array prefix
        ...this.elements.map((e) => cbor.encode(e)),
        Buffer.from([0xff]), // end of array
      ])
    );
  }
}

export function rustRawTxToId(rustTxBody: RustRawTxBody): string {
  if (!rustTxBody) {
    throw new Error('Cannot decode inputs from undefined transaction!');
  }
  try {
    const [inputs, outputs, attributes] = decodedTxToAux(cbor.decode(Buffer.from(rustTxBody)));
    const enc = cbor.encode([
      new CborIndefiniteLengthArray(inputs),
      new CborIndefiniteLengthArray(outputs),
      attributes
    ]);
    // eslint-disable-next-line
    return Buffer.from(Blake2b.blake2b_256(enc)).toString('hex');
  } catch (e) {
    throw new Error('Failed to convert raw transaction to ID! ' + stringifyError(e));
  }
}

function decodedTxToAux(decodedTx) {
  switch (decodedTx.length) {
    case 2: return decodedTx[0]; // signed
    case 3: return decodedTx; // unsigned
    default: throw new Error('Unexpected decoded tx structure! ' + JSON.stringify(decodedTx));
  }
}

export function decodeRustTx(rustTxBody: RustRawTxBody): CryptoTransaction {
  if (!rustTxBody) {
    throw new Error('Cannot decode inputs from undefined transaction!');
  }
  try {
    const [[inputs, outputs], witnesses] = cbor.decode(Buffer.from(rustTxBody));
    const decInputs: Array<TxInputPtr> = inputs.map(x => {
      const [buf, idx] = cbor.decode(x[1].value);
      return {
        id: buf.toString('hex'),
        index: idx
      };
    });
    const decOutputs: Array<TxOutput> = outputs.map(x => {
      const [addr, val] = x;
      return {
        address: bs58.encode(cbor.encode(addr)),
        value: val
      };
    });
    const decWitnesses: Array<TxWitness> = witnesses.map(w => {
      if (w[0] === 0) {
        return {
          PkWitness: cbor.decode(w[1].value).map(x => x.toString('hex'))
        };
      }
      throw Error('Unexpected witness type: ' + w);
    });
    return {
      tx: {
        tx: {
          inputs: decInputs,
          outputs: decOutputs
        },
        witnesses: decWitnesses
      }
    };
  } catch (e) {
    throw new Error('Failed to decode a rust tx! Cause: ' + stringifyError(e));
  }
}
