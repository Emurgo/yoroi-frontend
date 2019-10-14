// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import {
  op,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  ConceptualWalletInsert, ConceptualWalletRow,
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

export class ModifyConceptualWallet {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: ConceptualWalletInsert,
  ): Promise<ConceptualWalletRow> {
    return await addNewRowToTable<ConceptualWalletInsert, ConceptualWalletRow>(
      db, tx,
      request,
      ModifyConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name].name,
    );
  }

  static async rename(
    db: lf$Database,
    tx: lf$Transaction,
    request: {
      walletId: number,
      newName: string,
    },
  ): Promise<void> {
    const conceptualWalletTable = db.getSchema().table(
      ModifyConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name].name
    );
    const updateQuery = db
      .update(conceptualWalletTable)
      .set(
        conceptualWalletTable[Tables.ConceptualWalletSchema.properties.Name],
        request.newName
      )
      .where(op.and(
        conceptualWalletTable[Tables.ConceptualWalletSchema.properties.ConceptualWalletId].eq(
          request.walletId
        ),
      ));

    await tx.attach(updateQuery);
  }
}
