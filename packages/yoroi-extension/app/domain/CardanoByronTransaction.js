// @flow
import type { UserAnnotation } from '../api/ada/transactions/types';
import type { CardanoByronTxIO } from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type { DbBlock, NetworkRow } from '../api/ada/lib/storage/database/primitives/tables';
import type { DefaultTokenEntry } from '../api/common/lib/MultiToken';
import { action } from 'mobx';
import WalletTransaction, { toAddr } from './WalletTransaction';

export default class CardanoByronTransaction extends WalletTransaction {
  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...CardanoByronTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry,
  |}): CardanoByronTransaction {
    const { addressLookupMap, defaultToken, tx } = request;

    return new CardanoByronTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.joinAddCopy(tx.fee),
      fee: tx.fee,
      date: tx.block != null ? tx.block.BlockTime : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken }),
        to: toAddr({
          rows: tx.utxoOutputs,
          addressLookupMap,
          tokens: tx.tokens,
          defaultToken,
        }).map(a => ({ ...a, isForeign: false })),
      },
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
