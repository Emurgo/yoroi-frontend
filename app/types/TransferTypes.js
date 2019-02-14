// @flow
import BigNumber from 'bignumber.js';

export type TransferStatus =
    'uninitialized'
  | 'gettingMnemonics'
  | 'gettingPaperMnemonics'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'readyToTransfer'
  | 'error'

/** Contains all information necessary to send and display the Daedalus transfer transaction */
export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  cborEncodedTx: Array<number>,
  senders: Array<string>,
  receiver: string,
}
