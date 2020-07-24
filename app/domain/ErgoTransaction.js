// @flow
import BigNumber from 'bignumber.js';
import type {
  UserAnnotation,
} from '../api/ada/transactions/types';
import type {
  ErgoTxIO,
} from '../api/ada/lib/storage/database/transactionModels/multipart/tables';
import type {
  DbBlock,
} from '../api/ada/lib/storage/database/primitives/tables';
import type { ApiOptionType } from '../api/common/utils';
import { getApiMeta } from '../api/common/utils';
import WalletTransaction, { toAddr } from './WalletTransaction';

export default class ErgoTransaction extends WalletTransaction {

  static fromAnnotatedTx(request: {|
    tx: {|
      ...ErgoTxIO,
      ...WithNullableFields<DbBlock>,
      ...UserAnnotation,
    |},
    addressLookupMap: Map<number, string>,
    api: ApiOptionType,
  |}): ErgoTransaction {
    const apiMeta = getApiMeta(request.api)?.meta;
    if (apiMeta == null) throw new Error(`${nameof(ErgoTransaction)} no API selected`);
    const amountPerUnit = new BigNumber(10).pow(apiMeta.decimalPlaces);

    const { addressLookupMap, tx } = request;

    return new ErgoTransaction({
      txid: tx.transaction.Hash,
      block: tx.block,
      type: tx.type,
      amount: tx.amount.dividedBy(amountPerUnit).plus(tx.fee.dividedBy(amountPerUnit)),
      fee: tx.fee.dividedBy(amountPerUnit),
      date: tx.block != null
        ? tx.block.BlockTime
        : new Date(tx.transaction.LastUpdateTime),
      addresses: {
        from: toAddr({ rows: tx.utxoInputs, amountPerUnit, addressLookupMap }),
        to: toAddr({ rows: tx.utxoOutputs, amountPerUnit, addressLookupMap }),
      },
      state: tx.transaction.Status,
      errorMsg: tx.transaction.ErrorMessage,
    });
  }
}
