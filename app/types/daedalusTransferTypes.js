// @flow
import BigNumber from 'bignumber.js';

export type TransferStatus =
    'uninitialized'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'readyToTransfer'

export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  cborEncodedTx: Array<number>,
  senders: Array<string>,
  receiver: string
}
