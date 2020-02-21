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
  PublicDeriverInsert, PublicDeriverRow,
} from '../tables';

import {
  addOrReplaceRow, addNewRowToTable, removeFromTableBatch,
  StaleStateError,
} from '../../../utils';
import { GetLastSyncForPublicDeriver, GetPublicDeriver, } from './read';
import type { KeyDerivationRow } from '../../../primitives/tables';
import { TransactionSchema } from '../../../primitives/tables';
import type { AddDerivationRequest } from '../../../primitives/api/write';
import { AddDerivation, RemoveKeyDerivationTree } from '../../../primitives/api/write';


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

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    ids: $ReadOnlyArray<number>,
  ): Promise<void> {
    await removeFromTableBatch(
      db, tx,
      ModifyLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].name,
      ModifyLastSyncInfo.ownTables[Tables.LastSyncInfoSchema.name].properties.LastSyncInfoId,
      ids,
    );
  }
}


export class DeleteAllTransactions {
  static ownTables = Object.freeze({
    [TransactionSchema.name]: TransactionSchema,
  });
  static depTables = Object.freeze({
    ModifyLastSyncInfo,
    GetLastSyncForPublicDeriver,
  });

  static async delete(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      publicDeriverId: number,
      txIds: Array<number>,
    |},
  ): Promise<void> {
    // 1) delete all transactions from the wallet
    // note: this should cascade delete all related information
    await removeFromTableBatch(
      db, tx,
      DeleteAllTransactions.ownTables[TransactionSchema.name].name,
      DeleteAllTransactions.ownTables[TransactionSchema.name].properties.TransactionId,
      request.txIds,
    );

    // 2) reset the last sync time
    const lastSyncInfo = await DeleteAllTransactions.depTables.GetLastSyncForPublicDeriver.forId(
      db, tx,
      request.publicDeriverId
    );
    DeleteAllTransactions.depTables.ModifyLastSyncInfo.overrideLastSyncInfo(
      db, tx,
      {
        LastSyncInfoId: lastSyncInfo.LastSyncInfoId,
        BlockHash: null,
        SlotNum: null,
        Height: 0,
        Time: null,
      }
    );
  }
}


export type PublicDeriverRequest<Insert> = {|
  addLevelRequest: AddDerivationRequest<Insert>,
  levelSpecificTableName: string,
  derivationTables: Map<number, string>,
  addPublicDeriverRequest: {|
    derivationId: number,
    lastSyncInfoId: number,
  |} => PublicDeriverInsert,
|};
export type AddPublicDeriverResponse<Row> = {|
  publicDeriverResult: $ReadOnly<PublicDeriverRow>,
  levelResult: {|
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    specificDerivationResult: $ReadOnly<Row>,
  |},
|};

export class AddPublicDeriver {
  static ownTables = Object.freeze({
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
    ModifyLastSyncInfo,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: PublicDeriverRequest<Insert>,
  ): Promise<AddPublicDeriverResponse<Row>> {
    const levelResult = await AddPublicDeriver.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request.addLevelRequest,
      Array.from(request.derivationTables.values()),
      request.levelSpecificTableName,
    );
    const lastSyncInfo = await ModifyLastSyncInfo.create(db, tx);
    const publicDeriverResult = await addNewRowToTable<PublicDeriverInsert, PublicDeriverRow>(
      db, tx,
      request.addPublicDeriverRequest({
        derivationId: levelResult.KeyDerivation.KeyDerivationId,
        lastSyncInfoId: lastSyncInfo.LastSyncInfoId,
      }),
      AddPublicDeriver.ownTables[Tables.PublicDeriverSchema.name].name,
    );
    return {
      publicDeriverResult,
      levelResult,
    };
  }
}

export class ModifyPublicDeriver {
  static ownTables = Object.freeze({
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async rename(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      pubDeriverId: number,
      newName: string,
    |},
  ): Promise<void> {
    const publicDeriverTable = db.getSchema().table(
      ModifyPublicDeriver.ownTables[Tables.PublicDeriverSchema.name].name
    );
    const updateQuery = db
      .update(publicDeriverTable)
      .set(
        publicDeriverTable[Tables.PublicDeriverSchema.properties.Name],
        request.newName
      )
      .where(op.and(
        publicDeriverTable[Tables.PublicDeriverSchema.properties.PublicDeriverId].eq(
          request.pubDeriverId
        ),
      ));

    await tx.attach(updateQuery);
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

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    ids: $ReadOnlyArray<number>,
  ): Promise<void> {
    const table = ModifyConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name];
    await removeFromTableBatch(
      db, tx,
      table.name,
      table.properties.ConceptualWalletId,
      ids,
    );
  }

  static async rename(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      walletId: number,
      newName: string,
    |},
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

export class RemovePublicDeriver {
  static ownTables = Object.freeze({
    [Tables.PublicDeriverSchema.name]: Tables.PublicDeriverSchema,
  });
  static depTables = Object.freeze({
    GetPublicDeriver,
    RemoveKeyDerivationTree,
    ModifyLastSyncInfo,
  });

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      publicDeriverId: number,
    |},
  ): Promise<void> {
    const publicDeriverRow = await RemovePublicDeriver.depTables.GetPublicDeriver.get(
      db, tx, request.publicDeriverId
    );
    if (publicDeriverRow == null) {
      throw new StaleStateError(`${nameof(RemovePublicDeriver)}::${nameof(RemovePublicDeriver.remove)}`);
    }

    // 1) delete public deriver row
    await removeFromTableBatch(
      db, tx,
      RemovePublicDeriver.ownTables[Tables.PublicDeriverSchema.name].name,
      RemovePublicDeriver.ownTables[Tables.PublicDeriverSchema.name].properties.PublicDeriverId,
      ([request.publicDeriverId]: Array<number>),
    );

    await RemovePublicDeriver.depTables.RemoveKeyDerivationTree.remove(
      db, tx,
      { rootKeyId: publicDeriverRow.KeyDerivationId, }
    );

    // 3) remove last sync info
    await RemovePublicDeriver.depTables.ModifyLastSyncInfo.remove(
      db, tx,
      [publicDeriverRow.LastSyncInfoId]
    );
  }
}
