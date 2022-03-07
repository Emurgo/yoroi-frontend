// @flow
import { action } from 'mobx';
import type {
  UserAnnotation,
} from '../api/ada/transactions/types';
import type {
  ErgoTxIO,
} from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
  NetworkRow,
} from '../api/ada/lib/storage/database/primitives/tables';
import WalletTransaction, { toAddr } from './WalletTransaction';
import type {
  DefaultTokenEntry,
} from '../api/common/lib/MultiToken';
import type { WalletTransactionCtorData } from './WalletTransaction';

export default class ErgoTransaction extends WalletTransaction {

  @action
  static fromData(data: WalletTransactionCtorData): ErgoTransaction {
    return new ErgoTransaction(data);
  }

  @action
  static fromAnnotatedTx(request: {|
    tx: {|
      ...ErgoTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    network: $ReadOnly<NetworkRow>,
    defaultToken: DefaultTokenEntry
  |}): ErgoTransaction {
    const { addressLookupMap, defaultToken, tx } = request;

    return new ErgoTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.joinAddCopy(tx.fee),
      fee: tx.fee,
      date: tx.block != null
        ? tx.block.BlockTime
        : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, addressLookupMap, tokens: tx.tokens, defaultToken, }),
        to: toAddr({ rows: tx.utxoOutputs, addressLookupMap, tokens: tx.tokens, defaultToken, }),
      },
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
