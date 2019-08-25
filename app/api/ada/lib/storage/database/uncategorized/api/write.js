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
  BlockInsert, BlockRow,
  KeyInsert, KeyRow,
  ConceptualWalletInsert, ConceptualWalletRow,
  AddressInsert, AddressRow,
  EncryptionMetaInsert, EncryptionMetaRow,
} from '../tables';
import {
  digetForHash,
} from './utils';
import {
  addNewRowToTable,
  addOrReplaceRow,
  getRowIn,
} from '../../utils';

import {
  GetBlock,
  GetEncryptionMeta,
} from './read';

export class AddKey {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: KeyInsert,
  ): Promise<$ReadOnly<KeyRow>> {
    return await addNewRowToTable<KeyInsert, KeyRow>(
      db, tx,
      request,
      AddKey.ownTables[Tables.KeySchema.name].name,
    );
  }
}

export class UpdateGet {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables = Object.freeze({});

  static async update(
    db: lf$Database,
    tx: lf$Transaction,
    request: KeyRow,
  ): Promise<$ReadOnly<KeyRow>> {
    return await addOrReplaceRow<KeyRow, KeyRow>(
      db, tx,
      request,
      UpdateGet.ownTables[Tables.KeySchema.name].name
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

export class GetOrAddBlock {
  static ownTables = Object.freeze({
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables = Object.freeze({
    GetBlock,
  });

  static async getOrAdd(
    db: lf$Database,
    tx: lf$Transaction,
    insert: BlockInsert,
  ): Promise<$ReadOnly<BlockRow>> {
    const blockRows = await GetOrAddBlock.depTables.GetBlock.byDigests(
      db, tx,
      [insert.Digest]
    );
    for (const row of blockRows) {
      if (row.Hash === insert.Hash) {
        return row;
      }
    }

    return await addNewRowToTable<BlockInsert, BlockRow>(
      db, tx,
      insert,
      GetOrAddBlock.ownTables[Tables.BlockSchema.name].name,
    );
  }
}

export class GetOrAddAddress {
  static ownTables = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
  });
  static depTables = Object.freeze({
    GetEncryptionMeta,
  });

  static async addByHash(
    db: lf$Database,
    tx: lf$Transaction,
    addressHash: Array<string>,
  ): Promise<Array<$ReadOnly<AddressRow>>> {
    const { AddressSeed } = await GetEncryptionMeta.get(db, tx);
    const digests = addressHash.map<number>(hash => digetForHash(hash, AddressSeed));

    const result = [];
    for (let i = 0; i < addressHash.length; i++) {
      const newRow = await addNewRowToTable<AddressInsert, AddressRow>(
        db, tx,
        {
          Digest: digests[i],
          Hash: addressHash[i],
        },
        GetOrAddAddress.ownTables[Tables.AddressSchema.name].name,
      );
      result.push(newRow);
    }

    return result;
  }

  static async getByHash(
    db: lf$Database,
    tx: lf$Transaction,
    addressHash: Array<string>,
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
    const { AddressSeed } = await GetEncryptionMeta.get(db, tx);
    const digests = addressHash.map<number>(hash => digetForHash(hash, AddressSeed));

    const addressRows = await getRowIn<AddressRow>(
      db, tx,
      GetOrAddAddress.ownTables[Tables.AddressSchema.name].name,
      GetOrAddAddress.ownTables[Tables.AddressSchema.name].properties.Digest,
      digests
    );

    return addressRows;
  }
}

export class ModifyEncryptionMeta {
  static ownTables = Object.freeze({
    [Tables.EncryptionMetaSchema.name]: Tables.EncryptionMetaSchema,
  });
  static depTables = Object.freeze({});

  static async setInitial(
    db: lf$Database,
    tx: lf$Transaction,
    initialData: EncryptionMetaInsert,
  ): Promise<$ReadOnly<EncryptionMetaRow>> {
    return await addNewRowToTable<EncryptionMetaInsert, EncryptionMetaRow>(
      db, tx,
      initialData,
      ModifyEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
    );
  }
}
