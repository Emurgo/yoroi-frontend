// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';
import * as Tables from '../tables';
import type { TxMemoTableRow, TxMemoTableInsert } from '../tables';
import { addOrReplaceRow, } from '../../utils';

export class ModifyTxMemo {
  static ownTables = Object.freeze({
    [Tables.TxMemoSchema.name]: Tables.TxMemoSchema,
  });
  static depTables = Object.freeze({});

  static async upsertMemo(
    db: lf$Database,
    dbTx: lf$Transaction,
    memo: TxMemoTableInsert | TxMemoTableRow,
  ): Promise<$ReadOnly<TxMemoTableRow>> {
    return await addOrReplaceRow<{ ...TxMemoTableInsert, ... }, TxMemoTableRow>(
      db, dbTx,
      memo,
      ModifyTxMemo.ownTables[Tables.TxMemoSchema.name].name,
    );
  }

  static async deleteMemo(
    db: lf$Database,
    dbTx: lf$Transaction,
    request: {|
      walletId: string,
      txHash: string,
    |},
  ): Promise<void> {
    const table = db.getSchema().table(ModifyTxMemo.ownTables[Tables.TxMemoSchema.name].name);

    const { properties } = ModifyTxMemo.ownTables[Tables.TxMemoSchema.name];
    await dbTx.attach(
      db
        .delete()
        .from(table)
        .where(op.and(
          table[properties.TransactionHash].eq(request.txHash),
          table[properties.WalletId].eq(request.walletId),
        ))
    );
  }
}
