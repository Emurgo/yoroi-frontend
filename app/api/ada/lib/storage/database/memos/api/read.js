// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import * as Tables from '../tables';
import type { TxMemoTableRow } from '../tables';
import { getAll, } from '../../utils';

export class GetTxMemo {
  static ownTables: {|
    TxMemo: typeof Tables.TxMemoSchema,
  |} = Object.freeze({
    [Tables.TxMemoSchema.name]: Tables.TxMemoSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async getAllMemos(
    db: lf$Database,
    dbTx: lf$Transaction,
  ): Promise<$ReadOnlyArray<TxMemoTableRow>> {
    return await getAll<TxMemoTableRow>(
      db, dbTx,
      GetTxMemo.ownTables[Tables.TxMemoSchema.name].name,
    );
  }
}
