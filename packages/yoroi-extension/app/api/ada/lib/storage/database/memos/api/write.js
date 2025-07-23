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
import { GetEncryptionMeta } from '../../primitives/api/read';
import { digestForHash } from '../../primitives/api/utils';

export class ModifyTxMemo {
  static ownTables: {|
    TxMemo: typeof Tables.TxMemoSchema,
  |} = Object.freeze({
    [Tables.TxMemoSchema.name]: Tables.TxMemoSchema,
  });
  static depTables: {|GetEncryptionMeta: typeof GetEncryptionMeta|} = Object.freeze({
    GetEncryptionMeta
  });

  static async upsertMemo(
    db: lf$Database,
    dbTx: lf$Transaction,
    memo: TxMemoTableInsert | TxMemoTableRow,
  ): Promise<$ReadOnly<TxMemoTableRow>> {
    const { TransactionSeed } = await ModifyTxMemo.depTables.GetEncryptionMeta.get(db, dbTx);
    const digest = digestForHash(memo.TransactionHash, TransactionSeed);
    const memoWithDigest = {
      ...memo,
      Digest: digest,
    };
    return await addOrReplaceRow<{ ...TxMemoTableInsert, ... }, TxMemoTableRow>(
      db, dbTx,
      memoWithDigest,
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
    const { TransactionSeed } = await ModifyTxMemo.depTables.GetEncryptionMeta.get(db, dbTx);
    const digest = digestForHash(request.txHash, TransactionSeed);

    const table = db.getSchema().table(ModifyTxMemo.ownTables[Tables.TxMemoSchema.name].name);

    const { properties } = ModifyTxMemo.ownTables[Tables.TxMemoSchema.name];
    await dbTx.attach(
      db
        .delete()
        .from(table)
        .where(op.and(
          table[properties.Digest].eq(digest),
          table[properties.WalletId].eq(request.walletId),
        ))
    );
  }
}
