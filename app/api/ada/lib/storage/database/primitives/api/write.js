// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  AddressMappingInsert, AddressMappingRow,
  KeyDerivationInsert, KeyDerivationRow,
  BlockInsert, BlockRow,
  KeyInsert, KeyRow,
  AddressInsert, AddressRow,
  EncryptionMetaInsert, EncryptionMetaRow,
  DbTransaction,
  TransactionInsert, TransactionRow,
  CertificateInsert, CertificateRow,
  CertificateAddressInsert, CertificateAddressRow,
  DbBlock,
} from '../tables';
import type {
  CoreAddressT,
  TxStatusCodesType,
} from '../enums';
import {
  digetForHash,
} from './utils';
import {
  addNewRowToTable,
  removeFromTableBatch,
  addBatchToTable,
  addOrReplaceRow,
  getRowIn,
  StaleStateError,
} from '../../utils';

import {
  GetChildIfExists,
  GetBlock,
  GetEncryptionMeta,
  GetDerivationsByPath,
} from './read';
import type { InsertRequest } from '../../walletTypes/common/utils';

export class ModifyKey {
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
      ModifyKey.ownTables[Tables.KeySchema.name].name,
    );
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    request: $ReadOnlyArray<number>,
  ): Promise<void> {
    return await removeFromTableBatch(
      db, tx,
      ModifyKey.ownTables[Tables.KeySchema.name].name,
      ModifyKey.ownTables[Tables.KeySchema.name].properties.KeyId,
      request
    );
  }

  static async update(
    db: lf$Database,
    tx: lf$Transaction,
    request: KeyRow,
  ): Promise<$ReadOnly<KeyRow>> {
    return await addOrReplaceRow<KeyRow, KeyRow>(
      db, tx,
      request,
      ModifyKey.ownTables[Tables.KeySchema.name].name
    );
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

export class ModifyAddress {
  static ownTables = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
    [Tables.AddressMappingSchema.name]: Tables.AddressMappingSchema,
  });
  static depTables = Object.freeze({
    GetEncryptionMeta,
  });

  static async addForeignByHash(
    db: lf$Database,
    tx: lf$Transaction,
    address: Array<{|
      data: string,
      type: CoreAddressT,
    |}>,
  ): Promise<Array<$ReadOnly<AddressRow>>> {
    const { AddressSeed } = await ModifyAddress.depTables.GetEncryptionMeta.get(db, tx);
    const digests = address.map<number>(meta => digetForHash(meta.data, AddressSeed));

    const result = await addBatchToTable<AddressInsert, AddressRow>(
      db, tx,
      address.map((meta, i) => ({
        Digest: digests[i],
        Hash: meta.data,
        Type: meta.type,
      })),
      ModifyAddress.ownTables[Tables.AddressSchema.name].name,
    );

    return result;
  }

  static async addFromCanonicalByHash(
    db: lf$Database,
    tx: lf$Transaction,
    address: Array<{|
      keyDerivationId: number,
      data: string,
      type: CoreAddressT,
    |}>,
  ): Promise<Array<$ReadOnly<AddressRow>>> {
    const addressEntries = await ModifyAddress.addForeignByHash(
      db, tx,
      address.map(meta => ({ data: meta.data, type: meta.type }))
    );

    await addBatchToTable<AddressMappingInsert, AddressMappingRow>(
      db, tx,
      address.map((meta, i) => ({
        KeyDerivationId: meta.keyDerivationId,
        AddressId: addressEntries[i].AddressId,
      })),
      ModifyAddress.ownTables[Tables.AddressMappingSchema.name].name,
    );

    return addressEntries;
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    addressIds: $ReadOnlyArray<number>,
  ): Promise<void> {
    return await removeFromTableBatch(
      db, tx,
      ModifyAddress.ownTables[Tables.AddressSchema.name].name,
      ModifyAddress.ownTables[Tables.AddressSchema.name].properties.AddressId,
      addressIds
    );
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

export type AddDerivationRequest<Insert> = {|
  privateKeyInfo: KeyInsert | null,
  publicKeyInfo: KeyInsert | null,
  derivationInfo: {|
      private: number | null,
      public: number | null,
    |} => KeyDerivationInsert,
  levelInfo: InsertRequest => Promise<Insert>,
|};

export type DerivationQueryResult<Row> = {|
  KeyDerivation: $ReadOnly<KeyDerivationRow>,
  specificDerivationResult: $ReadOnly<Row>,
|};

export class AddDerivation {
  static ownTables = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    ModifyKey,
  });

  static async add<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddDerivationRequest<Insert>,
    lockedTables: Array<string>,
    levelSpecificTableName: string,
  ): Promise<DerivationQueryResult<Row>> {
    const privateKey = request.privateKeyInfo === null
      ? null
      : await AddDerivation.depTables.ModifyKey.add(
        db, tx,
        request.privateKeyInfo,
      );
    const publicKey = request.publicKeyInfo === null
      ? null
      : await AddDerivation.depTables.ModifyKey.add(
        db, tx,
        request.publicKeyInfo,
      );

    const KeyDerivation =
      await addNewRowToTable<KeyDerivationInsert, KeyDerivationRow>(
        db, tx,
        request.derivationInfo({
          private: privateKey ? privateKey.KeyId : null,
          public: publicKey ? publicKey.KeyId : null,
        }),
        AddDerivation.ownTables[Tables.KeyDerivationSchema.name].name,
      );

    const specificDerivationResult =
      await addNewRowToTable<Insert, Row>(
        db,
        tx,
        await request.levelInfo({
          db,
          tx,
          lockedTables,
          keyDerivationId: KeyDerivation.KeyDerivationId
        }),
        levelSpecificTableName,
      );

    return {
      KeyDerivation,
      specificDerivationResult,
    };
  }
}

export class GetOrAddDerivation {
  static ownTables = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    AddDerivation,
    GetChildIfExists,
  });

  /**
   * Note: We can't differentiate roots from different wallets (index&id are all null)
   * so for root we always add
   */
  static async getOrAdd<Insert, Row>(
    db: lf$Database,
    tx: lf$Transaction,
    parentDerivationId: number | null,
    childIndex: number | null,
    request: AddDerivationRequest<Insert>,
    lockedTables: Array<string>,
    levelSpecificTableName: string,
  ): Promise<DerivationQueryResult<Row>> {
    const childResult = parentDerivationId == null || childIndex == null
      ? undefined
      : await GetOrAddDerivation.depTables.GetChildIfExists.get(
        db, tx,
        parentDerivationId,
        childIndex,
      );
    if (childResult !== undefined) {
      const specificDerivationResult = (
        await getRowIn<Row>(
          db, tx,
          levelSpecificTableName,
          GetOrAddDerivation.ownTables[Tables.KeyDerivationSchema.name].properties.KeyDerivationId,
          ([childResult.KeyDerivationId]: Array<number>),
        )
      )[0];
      if (specificDerivationResult == null) {
        throw new StaleStateError('GetOrAddDerivation::getOrAdd no derivation found. Should not happen');
      }
      return {
        KeyDerivation: childResult,
        specificDerivationResult
      };
    }
    const addResult = await GetOrAddDerivation.depTables.AddDerivation.add<Insert, Row>(
      db, tx,
      request,
      lockedTables,
      levelSpecificTableName,
    );
    return addResult;
  }
}

export class ModifyTransaction {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
  });
  static depTables = Object.freeze({
    GetOrAddBlock,
  });

  static async addNew(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionInsert,
    |},
  ): Promise<{| ...WithNullableFields<DbBlock>, ...DbTransaction |}> {
    const block = request.block !== null
      ? await ModifyTransaction.depTables.GetOrAddBlock.getOrAdd(
        db, tx,
        request.block,
      )
      : null;

    const transaction = await addNewRowToTable<TransactionInsert, TransactionRow>(
      db, tx,
      request.transaction(block != null ? block.BlockId : null),
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );

    return {
      block,
      transaction,
    };
  }

  /**
   * Transaction may already exist in our DB and simlpy switching status
   * ex: Successful -> rollback
   *
   * tx inputs & outputs stay constant even if status changes (since txhash is same)
   * so we don't modify them.
   * Notably, we don't remove them so we can still show input+output for failed txs, etc.
   */
  static async updateExisting(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      block: null | BlockInsert,
      transaction: (blockId: null | number) => TransactionRow,
    |},
  ): Promise<{| ...WithNullableFields<DbBlock>, ...DbTransaction |}> {
    const block = request.block !== null
      ? await ModifyTransaction.depTables.GetOrAddBlock.getOrAdd(
        db, tx,
        request.block,
      )
      : null;

    // replace existing row so it gets updated status and updated block info
    const newTx = await addOrReplaceRow<TransactionRow, TransactionRow>(
      db, tx,
      request.transaction(block != null ? block.BlockId : null),
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );

    return {
      block,
      transaction: newTx,
    };
  }

  static async updateStatus(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      status: TxStatusCodesType,
      transaction: $ReadOnly<TransactionRow>,
    |},
  ): Promise<void> {
    await addOrReplaceRow<$ReadOnly<TransactionRow>, TransactionRow>(
      db, tx,
      {
        ...request.transaction,
        Status: request.status,
      },
      ModifyTransaction.ownTables[Tables.TransactionSchema.name].name,
    );
  }
}

export type AddCertificateRequest = {|
  certificate: CertificateInsert,
  relatedAddresses: number => $ReadOnlyArray<CertificateAddressInsert>,
|};
export class ModifyCertificate {
  static ownTables = Object.freeze({
    [Tables.CertificateSchema.name]: Tables.CertificateSchema,
    [Tables.CertificateAddressSchema.name]: Tables.CertificateAddressSchema,
  });
  static depTables = Object.freeze({
  });

  static async addNew(
    db: lf$Database,
    tx: lf$Transaction,
    request: AddCertificateRequest,
  ): Promise<{|
    certificate: $ReadOnly<CertificateRow>,
    relatedAddresses: $ReadOnlyArray<$ReadOnly<CertificateAddressRow>>,
  |}> {
    const certificate = await addNewRowToTable<CertificateInsert, CertificateRow>(
      db, tx,
      request.certificate,
      ModifyCertificate.ownTables[Tables.CertificateSchema.name].name,
    );

    const relatedAddresses = await addBatchToTable<CertificateAddressInsert, CertificateAddressRow>(
      db, tx,
      request.relatedAddresses(certificate.CertificateId),
      ModifyCertificate.ownTables[Tables.CertificateAddressSchema.name].name,
    );

    return {
      certificate,
      relatedAddresses,
    };
  }
}

export class RemoveKeyDerivationTree {
  static ownTables = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetDerivationsByPath,
    ModifyKey,
  });

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    request: {|
      rootKeyId: number,
    |},
  ): Promise<void> {
    // 2) delete primary key derivation
    // cascade doesn't work for many-to-many so we instead use deferrable and delete manually
    const allDerivations = await RemoveKeyDerivationTree.depTables.GetDerivationsByPath.allFromRoot(
      db, tx,
      request.rootKeyId,
    );
    await removeFromTableBatch(
      db, tx,
      RemoveKeyDerivationTree.ownTables[Tables.KeyDerivationSchema.name].name,
      RemoveKeyDerivationTree.ownTables[Tables.KeyDerivationSchema.name].properties.KeyDerivationId,
      allDerivations.map(row => row.KeyDerivationId),
    );

    const relatedKeys: Array<number> = allDerivations.reduce(
      (keys, deriver) => {
        if (deriver.PrivateKeyId != null) keys.push(deriver.PrivateKeyId);
        if (deriver.PublicKeyId != null) keys.push(deriver.PublicKeyId);
        return keys;
      },
      []
    );

    /**
     * Note: we don't iterate up through the parent to delete up to ROOT level
     * we can't delete them here
     * because there isn't a way to guarantee these keys aren't used by some other table
     * so the entity managing the keys has to ensure things are cleaned up
     */

    await RemoveKeyDerivationTree.depTables.ModifyKey.remove(
      db, tx,
      relatedKeys
    );
  }
}

export class FreeBlocks {
  static ownTables = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables = Object.freeze({
  });

  /**
   * Warning: unfortunately this logic has to be updated
   * whenever a new table is added to the DB that changes when a block can be freed
   */
  static async free(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<void> {
    const txTableMeta = FreeBlocks.ownTables[Tables.TransactionSchema.name];
    const blockTableMeta = FreeBlocks.ownTables[Tables.BlockSchema.name];
    const txTable = db.getSchema().table(txTableMeta.name);
    const blockTable = db.getSchema().table(blockTableMeta.name);
    const query = db
      .select()
      .from(blockTable)
      .leftOuterJoin(
        txTable,
        txTable[txTableMeta.properties.BlockId].eq(
          blockTable[blockTableMeta.properties.BlockId]
        )
      );
    const result: $ReadOnlyArray<{|
      Transaction: WithNullableFields<$ReadOnly<TransactionRow>>,
      Block: $ReadOnly<BlockRow>,
    |}> = await tx.attach(query);
    const freeableBlocks = result.reduce(
      (acc, pair) => {
        if (pair.Transaction.TransactionId == null) {
          acc.push(pair.Block);
        }
        return acc;
      },
      []
    );
    await removeFromTableBatch(
      db, tx,
      blockTableMeta.name,
      blockTableMeta.properties.BlockId,
      freeableBlocks.map(row => row.BlockId)
    );
  }
}
