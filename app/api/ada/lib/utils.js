// @flow
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';

import type { AdaTransactionInputOutput, Transaction } from '../adaTypes';

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
  inputs: AdaTransactionInputOutput,
  isOutgoing: boolean,
  outputs: AdaTransactionInputOutput,
  time: string
) {
  const isPending = !tx.block_num;
  return {
    ctAmount: {
      getCCoin: amount.toString()
    },
    ctBlockNumber: tx.block_num || '',
    ctId: tx.hash,
    ctInputs: inputs,
    ctIsOutgoing: isOutgoing,
    ctMeta: {
      ctmDate: time,
      ctmDescription: undefined,
      ctmTitle: undefined
    },
    ctmDate: new Date(time),
    ctOutputs: outputs,
    ctCondition: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
  };
};
