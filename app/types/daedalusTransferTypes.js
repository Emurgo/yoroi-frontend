// @flow
import BigNumber from 'bignumber.js';

export type TransferStatus =
    'uninitialized'
  | 'gettingMnemonics'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'readyToTransfer'
  | 'error'

export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  cborEncodedTx: Array<number>,
  senders: Array<string>,
  receiver: string
}
