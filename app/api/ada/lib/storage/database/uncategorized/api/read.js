// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  AddressRow,
  BlockRow,
  ConceptualWalletRow,
  EncryptionMetaRow,
  KeyRow,
} from '../tables';
import * as Tables from '../tables';
import { getRowFromKey, getRowIn, } from '../../utils';
import { Bip44WrapperSchema, } from '../../bip44/tables';

export class GetConceptualWallet {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<ConceptualWalletRow> | void> {
    const walletSchema = GetConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name];
    return await getRowFromKey<ConceptualWalletRow>(
      db, tx,
      key,
      walletSchema.name,
      walletSchema.properties.ConceptualWalletId,
    );
  }
}

export class GetKey {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<KeyRow> | void> {
    return await getRowFromKey<KeyRow>(
      db, tx,
      key,
      GetKey.ownTables[Tables.KeySchema.name].name,
      GetKey.ownTables[Tables.KeySchema.name].properties.KeyId,
    );
  }
}

export class GetWalletByType {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema,
    [Bip44WrapperSchema.name]: Bip44WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async get<T>(
    db: lf$Database,
    tx: lf$Transaction,
    type: $Values<typeof Tables.WalletType>,
  ): Promise<$ReadOnlyArray<T & {
    ConceptualWallet: $ReadOnly<ConceptualWalletRow>,
  }>> {
    const walletSchema = GetWalletByType.ownTables[Tables.ConceptualWalletSchema.name];
    const conceptualWalletTable = db.getSchema().table(
      walletSchema.name
    );
    const keyRowName = walletSchema.properties.ConceptualWalletId;

    let tableName;
    if (type === Tables.WalletType.Bip44) {
      tableName = GetWalletByType.ownTables[Bip44WrapperSchema.name].name;
    } else {
      throw new Error('WalletType::get unexpected type');
    }
    const typeTable = db.getSchema().table(tableName);
    return await tx.attach(db
      .select()
      .from(conceptualWalletTable)
      .innerJoin(
        typeTable,
        typeTable[keyRowName].eq(conceptualWalletTable[keyRowName]),
      ));
  }
}

export class GetBlock {
  static ownTables = Object.freeze({
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables = Object.freeze({});

  static async byIds(
    db: lf$Database,
    tx: lf$Transaction,
    blockId: Array<number>,
  ): Promise<$ReadOnly<BlockRow> | void> {
    return await getRowIn<BlockRow>(
      db, tx,
      GetBlock.ownTables[Tables.BlockSchema.name].name,
      GetBlock.ownTables[Tables.BlockSchema.name].properties.BlockId,
      blockId,
    );
  }

  static async byDigests(
    db: lf$Database,
    tx: lf$Transaction,
    digests: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<BlockRow>>> {
    return await getRowIn<BlockRow>(
      db, tx,
      GetBlock.ownTables[Tables.BlockSchema.name].name,
      GetBlock.ownTables[Tables.BlockSchema.name].properties.Digest,
      digests,
    );
  }
}

export class GetAddress {
  static ownTables = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
  });
  static depTables = Object.freeze({});

  static async getById(
    db: lf$Database,
    tx: lf$Transaction,
    ids: Array<number>,
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
    return await getRowIn<AddressRow>(
      db, tx,
      GetAddress.ownTables[Tables.AddressSchema.name].name,
      GetAddress.ownTables[Tables.AddressSchema.name].properties.AddressId,
      ids
    );
  }
}

export class GetEncryptionMeta {
  static ownTables = Object.freeze({
    [Tables.EncryptionMetaSchema.name]: Tables.EncryptionMetaSchema,
  });
  static depTables = Object.freeze({});

  static async exists(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<boolean> {
    const row = await getRowFromKey<EncryptionMetaRow>(
      db, tx,
      0,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].properties.EncryptionMetaId,
    );
    return row !== undefined;
  }

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnly<EncryptionMetaRow>> {
    const row = await getRowFromKey<EncryptionMetaRow>(
      db, tx,
      0,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
      GetEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].properties.EncryptionMetaId,
    );
    if (row === undefined) {
      throw new Error('GetEncryptionMeta::get no encryption meta found');
    }
    return row;
  }
}
