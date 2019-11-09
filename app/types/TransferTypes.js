// @flow
import BigNumber from 'bignumber.js';
import { RustModule } from '../api/ada/lib/cardanoCrypto/rustLoader';

export const TransferStatus = Object.freeze({
  UNINITIALIZED: 0,
  GETTING_MNEMONICS: 1,
  GETTING_PAPER_MNEMONICS: 2,
  GETTING_MASTER_KEY: 3,
  RESTORING_ADDRESSES: 4,
  CHECKING_ADDRESSES: 5,
  GENERATING_TX: 6,
  READY_TO_TRANSFER: 7,
  ERROR: 7,
  SUCCESS: 8,
});
export type TransferStatusT = $Values<typeof TransferStatus>;

/** Contains all information necessary to send and display the Daedalus transfer transaction */
export type TransferTx = {
  recoveredBalance: BigNumber,
  fee: BigNumber,
  signedTx: RustModule.WalletV2.SignedTransaction,
  senders: Array<string>,
  receiver: string,
}
