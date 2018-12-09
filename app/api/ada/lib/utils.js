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
import type {
  TxInputPtr,
  CryptoTransaction,
  SpendResponse,
  TxOutput,
  TxWitness
} from '../../../../flow/declarations/CardanoCrypto'

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map: any): Array<any> {
  return Object.values(map);
}

export function getAddressInHex(address: string): string {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
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

export function decodeRustTx(resp: SpendResponse): CryptoTransaction {
  if (!resp || !resp.cbor_encoded_tx) {
    throw new Error('Cannot decode inputs from undefined transaction!')
  }
  const [[[inputs, outputs], witnesses]] = cbor.decodeAllSync(Buffer.from(resp.cbor_encoded_tx));
  const decInputs: Array<TxInputPtr> = inputs.map(x => {
    [[buf, idx]] = cbor.decodeAllSync(x);
    return {
      id: buf.toString('hex'),
      index: idx
    };
  });
  const decOutputs: Array<TxOutput> = outputs.map(x => {
    [addr, value] = x;
    return {
      address: bs58.encode(cbor.encode(addr)),
      value: value
    };
  });
  const decWitnesses: Array<TxWitness> = witnesses.map(w => {
    if (w[0] === 0) {
      return {
        PkWitness: cbor.decodeAllSync(w[1].value)[0].map(x => x.toString('hex'))
      };
    }
  });
  return {
    tx: {
      tx: {
        inputs: decInputs,
        outputs: decOutputs
      },
      witnesses: decWitnesses
    }
  }
}