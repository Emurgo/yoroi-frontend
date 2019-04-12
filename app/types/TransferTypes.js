// @flow
import BigNumber from 'bignumber.js';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';

export type TransferStatus =
    'uninitialized'
  | 'gettingMnemonics'
  | 'gettingPaperMnemonics'
  | 'gettingMasterKey'
  | 'restoringAddresses'
  | 'checkingAddresses'
  | 'generatingTx'
  | 'readyToTransfer'
  | 'error'

/** Contains all information necessary to send and display the Daedalus transfer transaction */
export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  signedTx: RustModule.Wallet.SignedTransaction,
  senders: Array<string>,
  receiver: string,
}
