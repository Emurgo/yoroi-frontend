// @flow
import bs58 from 'bs58';
import BigNumber from 'bignumber.js';

export const unixTimestampToDate = (timestamp: number) => new Date(timestamp * 1000);

export const localeDateToUnixTimestamp =
  (localeDate: string) => new Date(localeDate).getTime();

export function mapToList(map: any): Array<any> {
  return Object.values(map);
}

export function getAddressInHex(address: string): string {
  const bytes = bs58.decode(address);
  return bytes.toString('hex');
}

export function saveInStorage(key: string, toSave: any): void {
  localStorage.setItem(key, JSON.stringify(toSave));
}

export function getFromStorage(key: string): any {
  const result = localStorage.getItem(key);
  if (result) return JSON.parse(result);
  return undefined;
}

export const toAdaTx = function (
  amount: BigNumber,
  tx,
  inputs: Array<string>,
  isOutgoing: boolean,
  outputs: Array<string>,
  time: string
) {
  const isPending = !tx.block_num;
  return {
    ctAmount: {
      getCCoin: amount.toString()
    },
    ctBlockNumber: tx.block_num || '',
    ctId: tx.hash,
    ctInputs: {
      newInputs: inputs
    },
    ctIsOutgoing: isOutgoing,
    ctMeta: {
      ctmDate: time,
      ctmDescription: undefined,
      ctmTitle: undefined
    },
    ctmDate: new Date(time),
    ctOutputs: {
      newOutputs: outputs
    },
    ctCondition: isPending ? 'CPtxApplying' : 'CPtxInBlocks'
  };
};
