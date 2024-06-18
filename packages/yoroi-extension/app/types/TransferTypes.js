// @flow
import {
  MultiToken,
} from '../api/common/lib/MultiToken';

export const TransferStatus = Object.freeze({
  UNINITIALIZED: 0,
  GETTING_PAPER_MNEMONICS: 2,
  RESTORING_ADDRESSES: 4,
  CHECKING_ADDRESSES: 5,
  GENERATING_TX: 6,
  READY_TO_TRANSFER: 7,
  ERROR: 8,
  SUCCESS: 9,
  DISPLAY_CHECKSUM: 10,
});
export type TransferStatusT = $Values<typeof TransferStatus>;

/** Contains all information necessary to send and display the transfer transaction */
// TODO: should probably delete this entire and just use ISignRequest for everything
export type TransferTx = {|
  +recoveredBalance: MultiToken, // TODO: remove
  +fee: MultiToken,
  +senders: Array<string>,
  +receivers: Array<string>,
  +id?: string,
  +encodedTx?: Uint8Array,
  +withdrawals?: Array<{|
    +address: string,
    +amount: MultiToken,
  |}>,
  deregistrations?: Array<{|
    +rewardAddress: string,
    +refund: MultiToken,
  |}>,
|}
