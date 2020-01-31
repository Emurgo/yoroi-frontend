// @flow
import BigNumber from 'bignumber.js';

export const TransferStatus = Object.freeze({
  UNINITIALIZED: 0,
  GETTING_MNEMONICS: 1,
  GETTING_PAPER_MNEMONICS: 2,
  GETTING_MASTER_KEY: 3,
  RESTORING_ADDRESSES: 4,
  CHECKING_ADDRESSES: 5,
  GENERATING_TX: 6,
  READY_TO_TRANSFER: 7,
  ERROR: 8,
  SUCCESS: 9,
  DISPLAY_CHECKSUM: 10,
  HARDWARE_DISCLAIMER: 11,
  GETTING_HARDWARE_MNEMONIC: 12,
});
export type TransferStatusT = $Values<typeof TransferStatus>;

/** Contains all information necessary to send and display the transfer transaction */
export type TransferTx = {|
  recoveredBalance: BigNumber,
  fee: BigNumber,
  id: string,
  encodedTx: Uint8Array,
  senders: Array<string>,
  receiver: string,
|}

export const TransferSource = Object.freeze({
  BYRON: 0,
  SHELLEY_UTXO: 1,
  SHELLEY_CHIMERIC_ACCOUNT: 2,
});
export type TransferSourceType = $Values<typeof TransferSource>;

export const TransferKind = Object.freeze({
  NORMAL: 0,
  PAPER: 1,
  TREZOR: 2,
  LEDGER: 3
});
export type TransferKindType = $Values<typeof TransferKind>;
