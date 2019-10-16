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
  addOrReplaceRow, addNewRowToTable,
} from '../../utils';
import type { KeyDerivationRow } from '../../primitives/tables';
import type { AddDerivationRequest } from '../../primitives/api/write';
import { AddDerivation } from '../../primitives/api/write';


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

export type PublicDeriverRequest<Insert> = {
  addLevelRequest: AddDerivationRequest<Insert>,
  levelSpecificTableName: string,
  addPublicDeriverRequest: {
    derivationId: number,
    lastSyncInfoId: number,
   } => PublicDeriverInsert,
};
export type AddPublicDeriverResponse<Row> = {
  publicDeriverResult: $ReadOnly<PublicDeriverRow>,
  levelResult: {
    KeyDerivation: $ReadOnly<KeyDerivationRow>,
    specificDerivationResult: $ReadOnly<Row>
  },
};

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
    request: {
      pubDeriverId: number,
      newName: string,
    },
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
