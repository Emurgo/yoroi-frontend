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
  NetworkRow,
  TokenRow, TokenUpsert, TokenUpsertWithDigest,
  TokenListInsert, TokenListRow,
} from '../tables';
import type {
  CoreAddressT,
  TxStatusCodesType,
} from '../enums';
import {
  digestForHash,
} from './utils';
import {
  addNewRowToTable,
  removeFromTableBatch,
  addBatchToTable,
  addOrReplaceRows,
  addOrReplaceRow,
  getRowIn,
  StaleStateError,
} from '../../utils';

import {
  GetChildIfExists,
  GetBlock,
  GetEncryptionMeta,
  GetDerivationsByPath,
  GetToken,
  GetAddress,
} from './read';
import type { InsertRequest } from '../../walletTypes/common/utils.types';

export class ModifyKey {
  static ownTables: {|
    Key: typeof Tables.KeySchema,
  |} = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema,
  });
  static depTables: {||} = Object.freeze({});

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
  static ownTables: {|
    Block: typeof Tables.BlockSchema
  |} = Object.freeze({
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables: {|GetBlock: typeof GetBlock|} = Object.freeze({
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
  static ownTables: {|
    Address: typeof Tables.AddressSchema,
    AddressMapping: typeof Tables.AddressMappingSchema,
  |} = Object.freeze({
    [Tables.AddressSchema.name]: Tables.AddressSchema,
    [Tables.AddressMappingSchema.name]: Tables.AddressMappingSchema,
  });
  static depTables: {|
    GetEncryptionMeta: typeof GetEncryptionMeta,
    GetAddress: typeof GetAddress,
  |} = Object.freeze({
    GetEncryptionMeta,
    GetAddress,
  });

  static async markAsUsed(
    db: lf$Database,
    tx: lf$Transaction,
    keyDerivationIds: Array<number>,
  ): Promise<void> {
    const addrMap = await ModifyAddress.depTables.GetAddress.fromCanonical(
      db, tx, keyDerivationIds, undefined
    );
    addOrReplaceRows(
      db,
      tx,
      [...addrMap.values()].flat().map(a => ({ ...a, IsUsed: true })),
      ModifyAddress.ownTables[Tables.AddressSchema.name].name,
    );
  }

  static async addForeignByHash(
    db: lf$Database,
    tx: lf$Transaction,
    address: Array<{|
      data: string,
      type: CoreAddressT,
    |}>,
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
    const { AddressSeed } = await ModifyAddress.depTables.GetEncryptionMeta.get(db, tx);
    const digests = address.map<number>(meta => digestForHash(meta.data, AddressSeed));

    const result = await addBatchToTable<AddressInsert, AddressRow>(
      db, tx,
      address.map((meta, i) => ({
        Digest: digests[i],
        Hash: meta.data,
        Type: meta.type,
        IsUsed: false,
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
  ): Promise<$ReadOnlyArray<$ReadOnly<AddressRow>>> {
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
  static ownTables: {|
    EncryptionMeta: typeof Tables.EncryptionMetaSchema,
  |} = Object.freeze({
    [Tables.EncryptionMetaSchema.name]: Tables.EncryptionMetaSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    initialData: EncryptionMetaInsert,
  ): Promise<$ReadOnly<EncryptionMetaRow>> {
    return (await addOrReplaceRows<EncryptionMetaInsert, EncryptionMetaRow>(
      db, tx,
      [initialData],
      ModifyEncryptionMeta.ownTables[Tables.EncryptionMetaSchema.name].name,
    ))[0];
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
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {|ModifyKey: typeof ModifyKey|} = Object.freeze({
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
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {|
    AddDerivation: typeof AddDerivation,
    GetChildIfExists: typeof GetChildIfExists,
  |} = Object.freeze({
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
  static ownTables: {|
    Transaction: typeof Tables.TransactionSchema,
  |} = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
  });
  static depTables: {|GetOrAddBlock: typeof GetOrAddBlock|} = Object.freeze({
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
        ...(request.transaction: $ReadOnly<TransactionRow>),
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
  static ownTables: {|
    Certificate: typeof Tables.CertificateSchema,
    CertificateAddress: typeof Tables.CertificateAddressSchema,
  |} = Object.freeze({
    [Tables.CertificateSchema.name]: Tables.CertificateSchema,
    [Tables.CertificateAddressSchema.name]: Tables.CertificateAddressSchema,
  });
  static depTables: {||} = Object.freeze({
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
  static ownTables: {|
    KeyDerivation: typeof Tables.KeyDerivationSchema,
  |} = Object.freeze({
    [Tables.KeyDerivationSchema.name]: Tables.KeyDerivationSchema,
  });
  static depTables: {|
    GetDerivationsByPath: typeof GetDerivationsByPath,
    ModifyKey: typeof ModifyKey,
  |} = Object.freeze({
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
  static ownTables: {|
    Block: typeof Tables.BlockSchema,
    Transaction: typeof Tables.TransactionSchema,
  |} = Object.freeze({
    [Tables.TransactionSchema.name]: Tables.TransactionSchema,
    [Tables.BlockSchema.name]: Tables.BlockSchema,
  });
  static depTables: {||} = Object.freeze({
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

export class ModifyNetworks {
  static ownTables: {|
    Network: typeof Tables.NetworkSchema,
  |} = Object.freeze({
    [Tables.NetworkSchema.name]: Tables.NetworkSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    rows: $ReadOnlyArray<NetworkRow>,
  ): Promise<$ReadOnlyArray<NetworkRow>> {
    const result = await addOrReplaceRows<NetworkRow, NetworkRow>(
      db, tx,
      rows,
      ModifyNetworks.ownTables[Tables.NetworkSchema.name].name,
    );

    return result;
  }
}

export class ModifyToken {
  static ownTables: {|
    Token: typeof Tables.TokenSchema,
  |} = Object.freeze({
    [Tables.TokenSchema.name]: Tables.TokenSchema,
  });
  static depTables: {|
    GetEncryptionMeta: typeof GetEncryptionMeta,
    GetToken: typeof GetToken,
  |} = Object.freeze({
    GetEncryptionMeta,
    GetToken,
  });

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    rows: $ReadOnlyArray<TokenUpsert>,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenRow>>> {
    // de-duplicate function argument
    const deduplicatedRows: Array<$ReadOnly<TokenUpsertWithDigest>> = [];
    {
      const { TokenSeed } = await ModifyToken.depTables.GetEncryptionMeta.get(db, tx);
      const rowsWithDigest = rows.map(row => ({
        Digest: digestForHash(row.Identifier, TokenSeed),
        ...row,
      }));

      // keep track of which rows we've seen before
      const lookupMap = new Map<number, Map<number, boolean>>();
      for (const row of rowsWithDigest) {
        const entry = lookupMap.get(row.Digest) ?? new Map();
        if (entry.get(row.NetworkId) == null) {
          deduplicatedRows.push(row);
        }
        entry.set(row.NetworkId, true);
        lookupMap.set(row.Digest, entry);
      }
    }

    const knownTokens: Array<$ReadOnly<TokenRow>> = [];
    const toAdd: Array<$ReadOnly<TokenUpsertWithDigest>> = [];

    // filter out rows that are already in the DB
    const lookupMap = new Map<number, Map<number, $ReadOnly<TokenRow>>>();
    {
      const existingTokens = await ModifyToken.depTables.GetToken.fromDigest(
        db, tx,
        deduplicatedRows.map(row => row.Digest)
      );
      for (const token of existingTokens) {
        const entry = lookupMap.get(token.Digest) ?? new Map();
        entry.set(token.NetworkId, token);
        lookupMap.set(token.Digest, entry);
      }
    }

    // figure out what we need to query, and what we already know
    {
      for (const row of deduplicatedRows) {
        const item = lookupMap.get(row.Digest)?.get(row.NetworkId);
        if (item == null) {
          toAdd.push(row);
        } else if (JSON.stringify(item.Metadata) !== JSON.stringify(row.Metadata)
        || item.IsNFT !== row.IsNFT) {
          // we want to update the row if the metadata or IsNFT flag was updated
          // because of that, if TokenId is not present in row, we have to add it,
          // otherwise the record will be re-inserted instead of updated, leaving us with
          // duplicated rows
          if (row.TokenId !== undefined) {
            toAdd.push(row);
          } else {
            toAdd.push({
              ...row,
              TokenId: item.TokenId
            });
          }
        } else {
          knownTokens.push(item);
        }
      }
    }

    const newlyAdded = await addOrReplaceRows<TokenUpsertWithDigest, TokenRow>(
      db, tx,
      toAdd,
      ModifyToken.ownTables[Tables.TokenSchema.name].name,
    );

    return [
      ...knownTokens,
      ...newlyAdded,
    ];
  }
}

export class ModifyTokenList {
  static ownTables: {|
    TokenList: typeof Tables.TokenListSchema,
  |} = Object.freeze({
    [Tables.TokenListSchema.name]: Tables.TokenListSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    rows: $ReadOnlyArray<TokenListInsert>,
  ): Promise<$ReadOnlyArray<$ReadOnly<TokenListRow>>> {
    const result = await addOrReplaceRows<TokenListInsert, TokenListRow>(
      db, tx,
      rows,
      ModifyTokenList.ownTables[Tables.TokenListSchema.name].name,
    );

    return [...result].sort((a, b) => a.TokenListItemId - b.TokenListItemId);
  }

  static async remove(
    db: lf$Database,
    tx: lf$Transaction,
    listIds: $ReadOnlyArray<number>,
  ): Promise<void> {
    return await removeFromTableBatch(
      db, tx,
      ModifyTokenList.ownTables[Tables.TokenListSchema.name].name,
      ModifyTokenList.ownTables[Tables.TokenListSchema.name].properties.ListId,
      listIds
    );
  }
}
