// @flow
import bs58 from 'bs58';
import cbor from 'cbor';
import BigNumber from 'bignumber.js';
import type {
  AdaAddress,
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
import type { TransactionExportRow } from '../../export';
import { LOVELACES_PER_ADA } from '../../../config/numbersConfig';

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

type CheckSum = number
type Coin = number
type CborAddress = [cbor.Tagged, CheckSum]
type CborTxInput = [number, cbor.Tagged]
type CborTxOutput = [CborAddress, Coin]
type CborTxAttributes = {}
type CborTxBase = [Array<CborTxInput>, Array<CborTxOutput>, CborTxAttributes];
type CborTxWitnesses = Array<any>
type CborTxSigned = [CborTxBase, CborTxWitnesses];

export const toAdaTx = function (
  amount: BigNumber,
  tx: Transaction,
  inputs: Array<AdaTransactionInputOutput>,
  isOutgoing: boolean,
  outputs: Array<AdaTransactionInputOutput>
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
      ctmDate: new Date(tx.time),
      ctmDescription: undefined,
      ctmTitle: undefined,
      ctmUpdate: new Date(tx.last_update)
    },
    ctOutputs: outputs,
    ctCondition: _getTxCondition(tx.tx_state)
  };
};

/** Map database format to AdaTransaction format */
export function mapToAdaTxs(
  txs: Array<Transaction>,
  accountAddresses: Array<string>
): Array<AdaTransaction> {
  return txs.map(tx => {
    // all of these depend on the set of all addresses in the user's wallet
    // so we calculate it here instead
    const inputs = _mapInputOutput(tx.inputs_address, tx.inputs_amount);
    const outputs = _mapInputOutput(tx.outputs_address, tx.outputs_amount);
    const { isOutgoing, amount } = _spenderData(inputs, outputs, accountAddresses);

    return toAdaTx(amount, tx, inputs, isOutgoing, outputs);
  });
}

/** Map database format for historic transactions to AdaTransactionInputOutput format */
function _mapInputOutput(
  addresses: Array<string>,
  amounts: Array<string>
): Array<AdaTransactionInputOutput> {
  return addresses.map((address, index) => [address, { getCCoin: amounts[index] }]);
}

/** Calculate whether transaction is ingoing/outgoing and how was sent out */
function _spenderData(
  txInputs: Array<AdaTransactionInputOutput>,
  txOutputs: Array<AdaTransactionInputOutput>,
  addresses: Array<string>
): {
  isOutgoing: boolean,
  amount: BigNumber
} {
  // Utility func to sum & count up all inputs (or outputs) of a transaction that belong to user
  const sum = toSum => (
    toSum.reduce(
      ({ totalAmount, count }, [address, { getCCoin }]) => {
        // if it doesn't belong to the user, just skip
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
    )
  );

  const incoming = sum(txOutputs);
  const outgoing = sum(txInputs);

  const isOutgoing = outgoing.totalAmount.greaterThanOrEqualTo(
    incoming.totalAmount
  );

  // Note: this also counts redemption transactions as self transactions
  const isSelfTransaction =
    incoming.count === txInputs.length &&
    outgoing.count === txOutputs.length;

  let amount; // represents how much sender sent out
  if (isOutgoing || isSelfTransaction) amount = outgoing.totalAmount.minus(incoming.totalAmount);
  else amount = incoming.totalAmount.minus(outgoing.totalAmount);

  return {
    isOutgoing,
    amount
  };
}

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
    const [inputs, outputs, attributes]: CborTxBase =
      decodedTxToBase(cbor.decode(Buffer.from(rustTxBody)));
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

function decodedTxToBase(decodedTx: any): CborTxBase {
  if (Array.isArray(decodedTx)) {
    // eslint-disable-next-line default-case
    switch (decodedTx.length) {
      case 2: {
        const signed: CborTxSigned = decodedTx;
        return signed[0];
      }
      case 3: {
        const base: CborTxBase = decodedTx;
        return base;
      }
    }
  }
  throw new Error('Unexpected decoded tx structure! ' + JSON.stringify(decodedTx));
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

export function convertAdaTransactionsToExportRows(
  transactions: Array<AdaTransaction>
): Array<TransactionExportRow> {
  return transactions
    .filter(tx => tx.ctCondition === 'CPtxInBlocks')
    .map(tx => {
      const fullValue = new BigNumber(tx.ctAmount.getCCoin);
      const sumInputs: BigNumber = sumInputsOutputs(tx.ctInputs);
      const sumOutputs: BigNumber = sumInputsOutputs(tx.ctOutputs);
      const fee: BigNumber = tx.ctIsOutgoing ? sumInputs.sub(sumOutputs) : new BigNumber(0);
      const value: BigNumber = tx.ctIsOutgoing ? fullValue.sub(fee) : fullValue;
      return {
        date: tx.ctMeta.ctmDate,
        type: tx.ctIsOutgoing ? 'out' : 'in',
        amount: formatBigNumberToFloatString(value.dividedBy(LOVELACES_PER_ADA)),
        fee: formatBigNumberToFloatString(fee.dividedBy(LOVELACES_PER_ADA)),
      };
    });
}

/**
 * Ignore first string parts of inputs/outputs and just sum coin values.
 */
export function sumInputsOutputs(ios: Array<AdaTransactionInputOutput>): BigNumber {
  return ios
    .map(io => new BigNumber(io[1].getCCoin))
    .reduce((a: BigNumber, b: BigNumber) => a.add(b), new BigNumber(0));
}

/**
 * If specified number is integer - append `.0` to it.
 * Otherwise - just float representation.
 */
export function formatBigNumberToFloatString(x: BigNumber): string {
  return x.isInteger() ? x.toFixed(1) : x.toString();
}

/**
 * Note: returns -1 if no used addresses exist
 */
export function getLatestUsedIndex(addresses: Array<AdaAddress>): number {
  const usedAddresses = addresses.filter(address => address.cadIsUsed);
  if (usedAddresses.length === 0) {
    return -1;
  }

  return Math.max(
    ...usedAddresses
      .map(address => address.index)
  );
}
