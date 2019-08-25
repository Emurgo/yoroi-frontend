// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  LastSyncInfoInsert, LastSyncInfoRow,
  HwWalletMetaInsert, HwWalletMetaRow,
} from '../tables';

import {
  addOrReplaceRow, addNewRowToTable,
} from '../../utils';

export class ModifyLastSyncInfo {
  static ownTables = Object.freeze({
    [Tables.LastSyncInfoSchema.name]: Tables.LastSyncInfoSchema,
  });
  static depTables = Object.freeze({});

  static async overrideLastSyncInfo(
    db: lf$Database,
    tx: lf$Transaction,
    insert: LastSyncInfoRow,
  ): Promise<$ReadOnly<LastSyncInfoRow>> {
    return await addOrReplaceRow<LastSyncInfoRow, LastSyncInfoRow>(
      db, tx,
      insert,
      ModifyLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].name,
    );
  }

  static async create(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnly<LastSyncInfoRow>> {
    return await addNewRowToTable<LastSyncInfoInsert, LastSyncInfoRow>(
      db, tx,
      {
        BlockHash: null,
        SlotNum: null,
        Height: 0,
        Time: null,
      },
      ModifyLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].name,
    );
  }
}

export class ModifyHwWalletMeta {
  static ownTables = Object.freeze({
    [Tables.HwWalletMetaSchema.name]: Tables.HwWalletMetaSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    insert: HwWalletMetaInsert,
  ): Promise<void | $ReadOnly<HwWalletMetaRow>> {
    return await addNewRowToTable<HwWalletMetaInsert, HwWalletMetaRow>(
      db, tx,
      insert,
      ModifyHwWalletMeta.ownTables[Tables.HwWalletMetaSchema.name].name,
    );
  }
}
