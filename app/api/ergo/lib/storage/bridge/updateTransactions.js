// @flow

import { isEqual } from 'lodash';
import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../../../../ada/lib/storage/database/utils';
import type {
  BlockInsert, BlockRow,
  TransactionInsert, TransactionRow,
  NetworkRow,
  DbBlock,
  AddressRow,
  ErgoTransactionInsert,
} from '../../../../ada/lib/storage/database/primitives/tables';
import {
  TransactionType,
} from '../../../../ada/lib/storage/database/primitives/tables';
import type {
  TxStatusCodesType,
  CoreAddressT,
} from '../../../../ada/lib/storage/database/primitives/enums';
import {
  GetAddress,
  GetBlock,
  GetEncryptionMeta,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetTransaction,
  GetTxAndBlock,
  GetKeyDerivation,
} from '../../../../ada/lib/storage/database/primitives/api/read';
import {
  ModifyAddress,
  ModifyTransaction,
  FreeBlocks,
} from '../../../../ada/lib/storage/database/primitives/api/write';
import { ModifyErgoTx, } from  '../../../../ada/lib/storage/database/transactionModels/multipart/api/write';
import { digestForHash, } from '../../../../ada/lib/storage/database/primitives/api/utils';
import {
  MarkUtxo,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/write';
import {
  GetUtxoTxOutputsWithTx,
  GetUtxoInputs,
  AssociateTxWithUtxoIOs,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/read';
import {
  ErgoAssociateTxWithIOs,
} from '../../../../ada/lib/storage/database/transactionModels/multipart/api/read';
import type {
  UserAnnotation,
} from '../../../../ada/transactions/types';
import type {
  UtxoTransactionInputInsert, UtxoTransactionOutputInsert,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/tables';
import {
  TxStatusCodes,
} from '../../../../ada/lib/storage/database/primitives/enums';
import {
  asScanAddresses, asHasLevels,
} from '../../../../ada/lib/storage/models/PublicDeriver/traits';
import type { IHasLevels } from '../../../../ada/lib/storage/models/ConceptualWallet/interfaces';
import { ConceptualWallet } from '../../../../ada/lib/storage/models/ConceptualWallet/index';
import type {
  IPublicDeriver,
} from '../../../../ada/lib/storage/models/PublicDeriver/interfaces';
import {
  GetLastSyncForPublicDeriver,
  GetPublicDeriver,
  GetKeyForPublicDeriver,
} from '../../../../ada/lib/storage/database/walletTypes/core/api/read';
import { ModifyDisplayCutoff, } from '../../../../ada/lib/storage/database/walletTypes/bip44/api/write';
import { AddDerivationTree, } from '../../../../ada/lib/storage/database/walletTypes/common/api/write';
import { GetDerivationSpecific, } from '../../../../ada/lib/storage/database/walletTypes/common/api/read';
import {
  ModifyLastSyncInfo,
  DeleteAllTransactions,
} from '../../../../ada/lib/storage/database/walletTypes/core/api/write';
import type { LastSyncInfoRow, } from '../../../../ada/lib/storage/database/walletTypes/core/tables';
import type { ErgoTxIO } from '../../../../ada/lib/storage/database/transactionModels/multipart/tables';
import {
  rawGetAddressRowsForWallet,
} from  '../../../../ada/lib/storage/bridge/traitUtils';
import {
  rawGenHashToIdsFunc, rawGenFindOwnAddress,
} from '../../../../common/lib/storage/bridge/hashMapper';
import type {
  HashToIdsFunc, FindOwnAddressFunc,
} from '../../../../common/lib/storage/bridge/hashMapper';
import { ERGO_STABLE_SIZE } from '../../../../../config/numbersConfig';
import { RollbackApiError } from '../../../../common/errors';
import { getFromUserPerspective, } from '../../../../ada/transactions/utils';

import type {
  HistoryFunc, RemoteErgoTransaction, BestBlockFunc, RemoteTxState,
} from '../../state-fetch/types';
import type {
  FilterFunc,
} from '../../../../common/lib/state-fetch/currencySpecificTypes';

async function rawGetAllTxIds(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
  |},
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet>, |},
  derivationTables: Map<number, string>,
): Promise<{|
  txIds: Array<number>,
  addresses: {|
    utxoAddresses: Array<$ReadOnly<AddressRow>>,
  |}
|}> {
  const {
    utxoAddresses,
  } = await rawGetAddressRowsForWallet(
    dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    request,
    derivationTables,
  );

  const utxoAddressIds = utxoAddresses.map(row => row.AddressId);

  const txIds = Array.from(new Set([
    ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: utxoAddressIds },
    )),
  ]));
  return {
    txIds,
    addresses: {
      utxoAddresses,
    },
  };
}

export async function rawGetTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet>,
    getTxAndBlock: (txIds: Array<number>) => Promise<$ReadOnlyArray<{|
      Block: null | $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}>>,
    skip?: number,
    limit?: number,
  |},
  derivationTables: Map<number, string>,
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<{|
  ...ErgoTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const {
    addresses,
    txIds,
  } = await rawGetAllTxIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );
  const blockMap = new Map<number, null | $ReadOnly<BlockRow>>();
  const txs = await request.getTxAndBlock(txIds);
  for (const tx of txs) {
    blockMap.set(tx.Transaction.TransactionId, tx.Block);
  }
  const txsWithIOs = await deps.ErgoAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    { txs: txs
      .map(txWithBlock => txWithBlock.Transaction)
      .filter(tx => tx.Type === TransactionType.Ergo)
    }
  );

  // we need to build a lookup map of AddressId => Hash
  // note: some inputs or outputs may not belong to us
  // so we can't build this map from previously calculated information
  const addressLookupMap = new Map<number, string>();
  {
    const allAddressIds = txsWithIOs.flatMap(txWithIO => [
      ...txWithIO.utxoInputs.map(input => input.AddressId),
      ...txWithIO.utxoOutputs.map(output => output.AddressId),
    ]);
    const addressRows = await GetAddress.getById(
      db, dbTx,
      // get rid of duplications (some tx can have multiple inputs of same address)
      Array.from(new Set(allAddressIds))
    );
    for (const row of addressRows) {
      addressLookupMap.set(row.AddressId, row.Hash);
    }
  }

  const result = txsWithIOs.map((tx: ErgoTxIO) => ({
    ...tx,
    block: blockMap.get(tx.transaction.TransactionId) || null,
    ...getFromUserPerspective({
      utxoInputs: tx.utxoInputs,
      utxoOutputs: tx.utxoOutputs,
      allOwnedAddressIds: new Set(
        Object.keys(addresses).flatMap(key => addresses[key]).map(addrRow => addrRow.AddressId)
      ),
    })
  }));

  return {
    addressLookupMap,
    txs: result,
  };
}

export async function getAllTransactions(
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
    skip?: number,
    limit?: number,
  |},
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<{|
  ...ErgoTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    ErgoAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));

  return await raii<PromisslessReturnType<typeof getAllTransactions>>(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(request.publicDeriver.getDb(), derivationTables),
    ],
    async dbTx => {
      return await rawGetTransactions(
        request.publicDeriver.getDb(), dbTx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetAddress: deps.GetAddress,
          ErgoAssociateTxWithIOs: deps.ErgoAssociateTxWithIOs,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
        },
        {
          ...request,
          getTxAndBlock: async (txIds) => await deps.GetTxAndBlock.byTime(
            request.publicDeriver.getDb(), dbTx,
            {
              txIds,
              skip: request.skip,
              limit: request.limit,
            }
          )
        },
        derivationTables,
      );
    }
  );
}

export async function getPendingTransactions(
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>, |},
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<{|
  ...ErgoTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    ErgoAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));

  return await raii<PromisslessReturnType<typeof getPendingTransactions>>(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(request.publicDeriver.getDb(), derivationTables),
    ],
    async dbTx => {
      return await rawGetTransactions(
        request.publicDeriver.getDb(), dbTx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetAddress: deps.GetAddress,
          ErgoAssociateTxWithIOs: deps.ErgoAssociateTxWithIOs,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
        },
        {
          ...request,
          getTxAndBlock: async (txIds) => await deps.GetTxAndBlock.withStatus(
            request.publicDeriver.getDb(), dbTx,
            {
              txIds,
              status: [TxStatusCodes.PENDING],
            }
          )
        },
        derivationTables,
      );
    }
  );
}

export async function rawGetForeignAddresses(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetTransaction: Class<GetTransaction>,
  |},
  derivationTables: Map<number, string>,
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  |},
): Promise<Array<number>> {
  const relatedIds = await rawGetAllTxIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const fullTxs = await deps.GetTransaction.fromIds(
    db, dbTx,
    { ids: relatedIds.txIds }
  );

  const txsWithIOs = await deps.ErgoAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    { txs: fullTxs.filter(tx => tx.Type === TransactionType.Ergo) }
  );

  const allAddressIds = txsWithIOs.flatMap(txWithIO => [
    ...txWithIO.utxoInputs.map(input => input.AddressId),
    ...txWithIO.utxoOutputs.map(output => output.AddressId),
  ]);

  const ourIds = new Set(
    Object.keys(relatedIds.addresses)
      .flatMap(key => relatedIds.addresses[key])
      .map(addrRow => addrRow.AddressId)
  );
  // recall: we store addresses that don't belong to our wallet in the DB
  // if they're in a tx that belongs to us
  const unownedAddresses = allAddressIds.filter(address => !ourIds.has(address));

  // get rid of duplications (some tx can have multiple inputs of same address)
  return Array.from(new Set(unownedAddresses));
}
export async function getForeignAddresses(
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>, |},
): Promise<Array<{|
  address: string,
  type: CoreAddressT,
|}>> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    ErgoAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    GetTransaction,
  });
  const db = request.publicDeriver.getDb();
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii<PromisslessReturnType<typeof getForeignAddresses>>(
    db,
    [
      // need a lock on all tables to delete
      ...db.getSchema().tables(),
      ...depTables,
      ...mapToTables(db, derivationTables),
    ],
    async dbTx => {
      const addressIds = await rawGetForeignAddresses(
        db, dbTx,
        deps,
        request.publicDeriver.getParent().getDerivationTables(),
        { publicDeriver: request.publicDeriver },
      );
      const addressRows = await GetAddress.getById(
        db, dbTx,
        addressIds
      );
      const result = [];
      const seenAddresses = new Set<string>();

      // remove duplicates
      for (const row of addressRows) {
        if (seenAddresses.has(row.Hash)) {
          continue;
        }
        seenAddresses.add(row.Hash);
        result.push({
          address: row.Hash,
          type: row.Type,
        });
      }
      return result;
    }
  );
}

export async function rawRemoveAllTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    DeleteAllTransactions: Class<DeleteAllTransactions>,
    GetTransaction: Class<GetTransaction>,
    ModifyAddress: Class<ModifyAddress>,
    FreeBlocks: Class<FreeBlocks>,
  |},
  derivationTables: Map<number, string>,
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>,
  |},
): ReturnType<typeof rawGetAllTxIds> {
  const unownedAddresses = await rawGetForeignAddresses(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      ErgoAssociateTxWithIOs: deps.ErgoAssociateTxWithIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetTransaction: deps.GetTransaction,
    },
    derivationTables,
    request,
  );
  const relatedIds = await rawGetAllTxIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  // 1) remove txs themselves
  await deps.DeleteAllTransactions.delete(
    db, dbTx,
    {
      publicDeriverId: request.publicDeriver.getPublicDeriverId(),
      txIds: relatedIds.txIds,
    }
  );

  // 2) remove addresses who only existed as metadata for txs that were removed
  await deps.ModifyAddress.remove(
    db, dbTx,
    unownedAddresses
  );

  // 3) remove blocks no longer needed
  await deps.FreeBlocks.free(db, dbTx);

  return relatedIds;
}

export async function removeAllTransactions(
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>, |},
): ReturnType<typeof rawGetAllTxIds> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    ErgoAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
    GetTransaction,
    FreeBlocks,
  });
  const db = request.publicDeriver.getDb();
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii<PromisslessReturnType<typeof removeAllTransactions>>(
    db,
    [
      // need a lock on all tables to delete
      ...db.getSchema().tables(),
      ...depTables,
      ...mapToTables(db, derivationTables),
    ],
    async dbTx => rawRemoveAllTransactions(
      db, dbTx,
      deps,
      request.publicDeriver.getParent().getDerivationTables(),
      { publicDeriver: request.publicDeriver },
    )
  );
}

export async function updateTransactions(
  db: lf$Database,
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
): Promise<void> {
  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  const derivationTables = withLevels == null
    ? new Map<number, string>()
    : withLevels.getParent().getDerivationTables();
  let lastSyncInfo = undefined;
  try {
    const updateDepTables = Object.freeze({
      GetLastSyncForPublicDeriver,
      ModifyLastSyncInfo,
      GetKeyForPublicDeriver,
      GetAddress,
      GetPathWithSpecific,
      GetUtxoTxOutputsWithTx,
      ModifyAddress,
      GetPublicDeriver,
      AddDerivationTree,
      MarkUtxo,
      ModifyDisplayCutoff,
      GetDerivationsByPath,
      GetEncryptionMeta,
      GetTransaction,
      GetUtxoInputs,
      GetTxAndBlock,
      GetDerivationSpecific,
      ModifyTransaction,
      ModifyErgoTx,
      ErgoAssociateTxWithIOs,
      AssociateTxWithUtxoIOs,
      GetKeyDerivation,
    });
    const updateTables = Object
      .keys(updateDepTables)
      .map(key => updateDepTables[key])
      .flatMap(table => getAllSchemaTables(db, table));

    await raii(
      db,
      [
        ...updateTables,
        ...mapToTables(db, derivationTables),
      ],
      async dbTx => {
        lastSyncInfo = await updateDepTables.GetLastSyncForPublicDeriver.forId(
          db, dbTx,
          publicDeriver.getPublicDeriverId()
        );
        const {
          // need this hack to remove a single element from the list
          GetLastSyncForPublicDeriver, // eslint-disable-line no-unused-vars, no-shadow
          ...remainingDeps
        } = updateDepTables;
        await rawUpdateTransactions(
          db, dbTx,
          remainingDeps,
          publicDeriver,
          lastSyncInfo,
          checkAddressesInUse,
          getTransactionsHistoryForAddresses,
          getBestBlock,
          derivationTables,
        );
      }
    );
  } catch (e) {
    if (!(e instanceof RollbackApiError)) {
      throw e;
    }
    // means we failed before even querying endpoint
    if (lastSyncInfo === undefined) {
      throw e;
    }
    const rollbackDepTables = Object.freeze({
      GetPathWithSpecific,
      GetAddress,
      GetTxAndBlock,
      GetLastSyncForPublicDeriver,
      ModifyLastSyncInfo,
      GetBlock,
      ModifyTransaction,
      MarkUtxo,
      GetTransaction,
      GetUtxoInputs,
      GetEncryptionMeta,
      GetDerivationSpecific,
      ErgoAssociateTxWithIOs,
      AssociateTxWithUtxoIOs,
    });
    const rollbackTables = Object
      .keys(rollbackDepTables)
      .map(key => rollbackDepTables[key])
      .flatMap(table => getAllSchemaTables(db, table));
    await raii(
      db,
      [
        ...rollbackTables,
        ...mapToTables(db, derivationTables),
      ],
      async dbTx => {
        const newLastSyncInfo = await rollbackDepTables.GetLastSyncForPublicDeriver.forId(
          db, dbTx,
          publicDeriver.getPublicDeriverId()
        );
        // it's possible there was a sync after when we unlocked tables
        // after failing to sync transactions
        // but before we locked them to process a rollback
        // in that case, just abort the rollback
        if (!isEqual(newLastSyncInfo, lastSyncInfo)) {
          return;
        }
        await rollback(
          db, dbTx,
          rollbackDepTables,
          {
            publicDeriver,
            lastSyncInfo: newLastSyncInfo,
          },
          derivationTables
        );
      }
    );
  }
}

async function rollback(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver>,
    ModifyLastSyncInfo: Class<ModifyLastSyncInfo>,
    GetBlock: Class<GetBlock>,
    MarkUtxo: Class<MarkUtxo>,
    GetTransaction: Class<GetTransaction>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    ModifyTransaction: Class<ModifyTransaction>,
  |},
  request: {|
    publicDeriver: IPublicDeriver<>,
    lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  |},
  derivationTables: Map<number, string>,
): Promise<void> {
  const { TransactionSeed, } = await deps.GetEncryptionMeta.get(db, dbTx);

  // if we've never successfully synced from the server, no need to rollback
  const lastSyncHeight = request.lastSyncInfo.Height;
  if (lastSyncHeight === 0) {
    return;
  }

  // 1) Get all transactions
  const {
    utxoAddresses,
  } = await rawGetAddressRowsForWallet(
    dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );
  const utxoAddressIds = utxoAddresses.map(address => address.AddressId);
  const txIds = Array.from(new Set([
    ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: utxoAddressIds },
    )),
  ]));

  // 2) get best tx in block
  const bestInStorage = await deps.GetTxAndBlock.firstSuccessTxBefore(
    db, dbTx,
    {
      txIds,
      height: Number.MAX_SAFE_INTEGER,
    }
  );
  if (bestInStorage == null) {
    // if we have no txs stored, no need to rollback
    return;
  }

  // 3) Get latest k transactions

  const txsToRevert = await deps.GetTxAndBlock.gteHeight(
    db, dbTx,
    { txIds, height: bestInStorage.Block.Height - ERGO_STABLE_SIZE }
  );

  // 4) mark rollback transactions as failed
  // Note: theoretically we should mark rolled back transactions as pending
  // however, this is problematic for us because Yoroi doesn't allow multiple pending transactions
  // so instead, we mark them as failed

  for (const tx of txsToRevert) {
    // we keep both the block in the tx in history
    // because we need this information to show the fail tx information to the user
    await deps.ModifyTransaction.updateStatus(
      db, dbTx,
      {
        status: TxStatusCodes.ROLLBACK_FAIL,
        transaction: tx.Transaction,
      }
    );
  }

  // 5) set all UTXO from these transactions as unspent

  await markAllInputs(
    db, dbTx,
    {
      MarkUtxo: deps.MarkUtxo,
      GetUtxoInputs: deps.GetUtxoInputs,
      GetTransaction: deps.GetTransaction,
    }, {
      inputTxIds: txsToRevert.map(tx => tx.Transaction.TransactionId),
      allTxIds: txIds,
      isUnspent: true,
      TransactionSeed,
    }
  );

  // 6) marked pending transactions as failed
  const pendingTxs = await deps.GetTransaction.withStatus(
    db, dbTx,
    {
      txIds,
      status: [TxStatusCodes.PENDING]
    }
  );
  for (const pendingTx of pendingTxs) {
    // TODO: would be faster if this was batched
    await deps.ModifyTransaction.updateStatus(
      db, dbTx,
      {
        transaction: pendingTx,
        status: TxStatusCodes.ROLLBACK_FAIL,
      }
    );
  }

  // 7) Rollback LastSyncTable
  const bestStillIncluded = await deps.GetTxAndBlock.firstSuccessTxBefore(
    db, dbTx,
    { txIds, height: bestInStorage.Block.Height - ERGO_STABLE_SIZE }
  );
  await deps.ModifyLastSyncInfo.overrideLastSyncInfo(
    db, dbTx,
    {
      LastSyncInfoId: request.lastSyncInfo.LastSyncInfoId,
      Time: new Date(Date.now()),
      SlotNum: bestStillIncluded === undefined ? null : bestStillIncluded.Block.SlotNum,
      Height: bestStillIncluded === undefined ? 0 : bestStillIncluded.Block.Height,
      BlockHash: bestStillIncluded === undefined ? null : bestStillIncluded.Block.Hash,
    }
  );

  // note: we don't modify the display cutoff since it may confuse the user to suddenly shrink it
}

async function rawUpdateTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    ModifyLastSyncInfo: Class<ModifyLastSyncInfo>,
    GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    ModifyAddress: Class<ModifyAddress>,
    GetPublicDeriver: Class<GetPublicDeriver>,
    AddDerivationTree: Class<AddDerivationTree>,
    MarkUtxo: Class<MarkUtxo>,
    ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
    GetDerivationsByPath: Class<GetDerivationsByPath>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyErgoTx: Class<ModifyErgoTx>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetKeyDerivation: Class<GetKeyDerivation>,
  |},
  publicDeriver: IPublicDeriver<>,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
  derivationTables: Map<number, string>,
): Promise<void> {
  const network = publicDeriver.getParent().getNetworkInfo();

  // 1) Check if backend is synced (avoid rollbacks if backend has to resync from block 1)

  const bestBlock = await getBestBlock({
    network,
  });
  if (lastSyncInfo.Height !== 0) {
    const lastSeen = lastSyncInfo.Height;
    const inRemote = bestBlock.height;
    // if we're K slots ahead of remote
    if (lastSeen - inRemote > ERGO_STABLE_SIZE) {
      return;
    }
  }

  if (bestBlock.hash != null) {
    const untilBlock = bestBlock.hash;

    // 2) sync our address set with remote to make sure txs are identified as ours
    const canScan = asScanAddresses(publicDeriver);
    if (canScan != null) {
      await canScan.rawScanAddresses(
        dbTx,
        {
          GetKeyForPublicDeriver: deps.GetKeyForPublicDeriver,
          GetAddress: deps.GetAddress,
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx,
          ModifyAddress: deps.ModifyAddress,
          GetPublicDeriver: deps.GetPublicDeriver,
          AddDerivationTree: deps.AddDerivationTree,
          ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
          GetDerivationsByPath: deps.GetDerivationsByPath,
          GetDerivationSpecific: deps.GetDerivationSpecific,
          GetKeyDerivation: deps.GetKeyDerivation,
        },
        // TODO: race condition because we don't pass in best block here
        { checkAddressesInUse },
        derivationTables,
      );
    }

    // 3) get new txs from fetcher

    // important: get addresses for our wallet AFTER scanning for new addresses
    const { txIds, addresses } = await rawGetAllTxIds(
      db, dbTx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
        AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      },
      { publicDeriver },
      derivationTables,
    );
    const bestInStorage = await deps.GetTxAndBlock.firstSuccessTxBefore(
      db, dbTx,
      {
        txIds,
        height: Number.MAX_SAFE_INTEGER,
      }
    );

    const requestKind = bestInStorage == null
      ? undefined
      : {
        after: {
          block: bestInStorage.Block.Hash,
          tx: bestInStorage.Transaction.Hash,
        }
      };
    const txsFromNetwork = await getTransactionsHistoryForAddresses({
      ...requestKind,
      network,
      addresses: [
        ...addresses.utxoAddresses.map(address => address.Hash)
      ],
      untilBlock,
    });

    const ourIds = new Set(
      Object.keys(addresses)
        .flatMap(key => addresses[key])
        .map(addrRow => addrRow.AddressId)
    );
    // 4) save data to local DB
    // WARNING: this can also modify the address set
    // ex: a new group address is found
    await updateTransactionBatch(
      db,
      dbTx,
      {
        MarkUtxo: deps.MarkUtxo,
        ErgoAssociateTxWithIOs: deps.ErgoAssociateTxWithIOs,
        GetEncryptionMeta: deps.GetEncryptionMeta,
        GetTransaction: deps.GetTransaction,
        GetUtxoInputs: deps.GetUtxoInputs,
        ModifyTransaction: deps.ModifyTransaction,
        ModifyErgoTx: deps.ModifyErgoTx,
      },
      {
        network: publicDeriver.getParent().getNetworkInfo(),
        txIds,
        txsFromNetwork,
        hashToIds: rawGenHashToIdsFunc(
          ourIds,
          publicDeriver.getParent().getNetworkInfo()
        ),
        findOwnAddress: rawGenFindOwnAddress(
          ourIds
        ),
        derivationTables,
      }
    );
  }

  // 5) update last sync
  await deps.ModifyLastSyncInfo.overrideLastSyncInfo(
    db, dbTx,
    {
      LastSyncInfoId: lastSyncInfo.LastSyncInfoId,
      Time: new Date(Date.now()),
      SlotNum: bestBlock.slot,
      BlockHash: bestBlock.hash,
      Height: bestBlock.height,
    }
  );
}

/**
 * Pre-req: must not be any gaps within the transactions
 * Pre-req: each TX has unique hash
 */
export async function updateTransactionBatch(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    MarkUtxo: Class<MarkUtxo>,
    ErgoAssociateTxWithIOs: Class<ErgoAssociateTxWithIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyErgoTx: Class<ModifyErgoTx>,
  |},
  request: {|
    network: $ReadOnly<NetworkRow>,
    txIds: Array<number>,
    txsFromNetwork: Array<RemoteErgoTransaction>,
    hashToIds: HashToIdsFunc,
    findOwnAddress: FindOwnAddressFunc,
    derivationTables: Map<number, string>,
  |}
): Promise<Array<{|
  ...ErgoTxIO,
  ...DbBlock,
|}>> {
  const { TransactionSeed, BlockSeed } = await deps.GetEncryptionMeta.get(db, dbTx);

  const matchesInDb = new Map<string, ErgoTxIO>();
  {
    const digestsForNew = request.txsFromNetwork.map(tx => digestForHash(tx.hash, TransactionSeed));
    const matchByDigest = await deps.GetTransaction.byDigest(db, dbTx, {
      digests: digestsForNew,
      txIds: request.txIds,
    });
    const txs: Array<$ReadOnly<TransactionRow>> = Array.from(matchByDigest.values());
    const txsWithIOs = await deps.ErgoAssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      { txs: txs.filter(tx => tx.Type === TransactionType.Ergo) }
    );
    for (const tx of txsWithIOs) {
      matchesInDb.set(tx.transaction.Hash, tx);
    }
  }

  const unseenNewTxs: Array<RemoteErgoTransaction> = [];
  const txsAddedToBlock: Array<{|
    ...ErgoTxIO,
    ...DbBlock,
  |}> = [];
  const modifiedTxIds = new Set<number>();
  for (const txFromNetwork of request.txsFromNetwork) {
    const matchInDb = matchesInDb.get(txFromNetwork.hash);
    if (matchInDb == null) {
      unseenNewTxs.push(txFromNetwork);
      continue;
    }

    /**
     * 1) process txs that got updated
     *
     * Existing tx may have status changed (ex: pending => successful)
     * OR may still be in same status (pending => pending)
     *
     * NOTE: no tx that is "success" should be modified
     * since this should be caught by a rollback instead
     * We may however see a "success" tx that is exactly the same as already stored
     * ex: two calls to this function on same backend result
     */
    const modifiedTxForDb = networkTxHeaderToDb(
      txFromNetwork,
      TransactionSeed,
      BlockSeed
    );
    modifiedTxIds.add(matchInDb.transaction.TransactionId);
    const result = await deps.ModifyTransaction.updateExisting(
      db,
      dbTx,
      {
        block: modifiedTxForDb.block,
        transaction: (blockId) => ({
          ...modifiedTxForDb.transaction(blockId),
          TransactionId: matchInDb.transaction.TransactionId,
        })
      },
    );

    // sanity check: although we should only see non-success => success
    // it's possible we see the same success tx twice
    if (matchInDb.transaction.BlockId !== null) {
      continue;
    }
    if (result.block !== null) {
      txsAddedToBlock.push({
        ...(matchInDb: ErgoTxIO),
        // override with updated
        block: result.block,
        transaction: result.transaction,
      });
    }
  }

  // 2) Add new transactions
  const { ergoTxs, } = await networkTxToDbTx(
    db,
    dbTx,
    request.network,
    request.derivationTables,
    unseenNewTxs,
    request.hashToIds,
    request.findOwnAddress,
    TransactionSeed,
    BlockSeed,
  );
  const newsTxsIdSet = new Set();
  for (const newTx of ergoTxs) {
    const result = await deps.ModifyErgoTx.addTxWithIOs(
      db,
      dbTx,
      newTx,
    );
    newsTxsIdSet.add(result.transaction.TransactionId);
    if (result.block !== null) {
      txsAddedToBlock.push({
        txType: result.txType,
        block: result.block,
        transaction: result.transaction,
        utxoInputs: result.utxoInputs,
        utxoOutputs: result.utxoOutputs,
      });
    }
  }

  // 3) Update UTXO set

  const newTxIds = txsAddedToBlock.map(tx =>  tx.transaction.TransactionId);
  await markAllInputs(
    db, dbTx,
    {
      MarkUtxo: deps.MarkUtxo,
      GetUtxoInputs: deps.GetUtxoInputs,
      GetTransaction: deps.GetTransaction,
    },
    {
      inputTxIds: newTxIds,
      allTxIds: [
        ...request.txIds,
        ...newTxIds,
      ],
      isUnspent: false,
      TransactionSeed,
    }
  );

  // 4) Mark any pending tx that is not found by remote as failed

  const pendingTxs = await deps.GetTransaction.withStatus(
    db, dbTx,
    {
      // note: we purposely don't include the txids of transactions we just added
      txIds: request.txIds,
      status: [TxStatusCodes.PENDING]
    }
  );
  // CAREFUL: this means you can't set a tx as pending locally (such as when you send a tx)
  // since it will may right away marked as failed by this code
  // this is because we don't keep track of the local time a pending TX was created
  for (const pendingTx of pendingTxs) {

    if (
      // this pending tx both didn't already exist and we did not just add it
      !modifiedTxIds.has(pendingTx.TransactionId) &&
      !newsTxsIdSet.has(pendingTx.TransactionId)
    ) {
      // TODO: would be faster if this was batched
      await deps.ModifyTransaction.updateStatus(
        db, dbTx,
        {
          transaction: pendingTx,
          status: TxStatusCodes.NOT_IN_REMOTE
        }
      );
    }
  }

  return txsAddedToBlock;
}

function genErgoIOGen(
  remoteTx: RemoteErgoTransaction,
  getIdOrThrow: string => number,
): (number => {|
  utxoInputs: Array<UtxoTransactionInputInsert>,
  utxoOutputs: Array<UtxoTransactionOutputInsert>,
|}) {
  return (txRowId) => {
    const utxoInputs = [];
    const utxoOutputs = [];
    for (let i = 0; i < remoteTx.inputs.length; i++) {
      const input = remoteTx.inputs[i];
      utxoInputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(input.address),
        ParentTxHash: input.outputTransactionId,
        IndexInParentTx: input.outputIndex,
        IndexInOwnTx: i,
        Amount: input.value.toString(),
      });
    }
    for (let i = 0; i < remoteTx.outputs.length; i++) {
      const output = remoteTx.outputs[i];
      utxoOutputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(output.address),
        OutputIndex: i,
        Amount: output.value.toString(),
        /**
          * we assume unspent for now but it will be updated after if necessary
          * Note: if this output doesn't belong to you, it will be true forever
          * This is slightly misleading, but using null would require null-checks everywhere
          */
        IsUnspent: true,
        ErgoBoxId: output.id,
        ErgoCreationHeight: output.creationHeight,
        ErgoTree: output.ergoTree,
      });
    }

    return {
      utxoInputs,
      utxoOutputs,
    };
  };
}

async function networkTxToDbTx(
  db: lf$Database,
  dbTx: lf$Transaction,
  network: $ReadOnly<NetworkRow>,
  derivationTables: Map<number, string>,
  newTxs: Array<RemoteErgoTransaction>,
  hashToIds: HashToIdsFunc,
  findOwnAddress: FindOwnAddressFunc,
  TransactionSeed: number,
  BlockSeed: number,
): Promise<{|
  ergoTxs: Array<{|
    block: null | BlockInsert,
    transaction: (blockId: null | number) => TransactionInsert,
    ioGen: ReturnType<typeof genErgoIOGen>,
  |}>,
|}> {
  const allAddresses = Array.from(new Set(
    newTxs.flatMap(tx => [
      ...tx.inputs.map(input => input.address),
      ...tx.outputs.map(output => output.address),
    ]),
  ));
  const idMapping = await hashToIds({
    db,
    tx: dbTx,
    lockedTables: Array.from(derivationTables.values()),
    hashes: allAddresses
  });

  const getIdOrThrow = (hash: string): number => {
    // recall: we know all non-group ids should already be present
    // because we synced our address list with the remote
    // before we queries for the transaction history
    // For group addresses, they are added dynamically so it's okay
    const id = idMapping.get(hash);
    if (id === undefined) {
      throw new Error(`${nameof(networkTxToDbTx)} should never happen id === undefined`);
    }
    return id;
  };

  const ergoTxs = [];

  for (const networkTx of newTxs) {
    const { block, transaction } = networkTxHeaderToDb(
      networkTx,
      TransactionSeed,
      BlockSeed,
    );

    ergoTxs.push({
      block,
      transaction,
      ioGen: genErgoIOGen(networkTx, getIdOrThrow),
    });
  }

  return {
    ergoTxs,
  };
}

async function markAllInputs(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    MarkUtxo: Class<MarkUtxo>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetTransaction: Class<GetTransaction>,
  |},
  request: {
    inputTxIds: Array<number>,
    allTxIds: Array<number>,
    isUnspent: boolean,
    TransactionSeed: number,
    ...
  },
): Promise<void> {
  const inputs = await deps.GetUtxoInputs.fromTxIds(
    db, dbTx,
    { ids: request.inputTxIds },
  );
  const digests = inputs.map(input => digestForHash(input.ParentTxHash, request.TransactionSeed));
  const txMap = await deps.GetTransaction.byDigest(
    db, dbTx,
    {
      digests,
      txIds: request.allTxIds,
    },
  );
  // note: we don't need to mark our own outputs as unspent. Only inputs we depended upon
  // this is because there are two cases
  // 1) Our outputs are already marked as "unspent" so nothing is required
  // 2) Our outputs were spent but the tx that spent it also got rolled back & marked us as unspent
  for (const input of inputs) {
    // get parent
    const parentTx = txMap.get(input.ParentTxHash);
    if (parentTx === undefined) {
      // this input doesn't belong to you, so just continue
      continue;
    }
    // note: this does nothing if the transaction output is not a UTXO output
    await deps.MarkUtxo.markAs(
      db, dbTx,
      {
        txId: parentTx.TransactionId,
        outputIndex: input.IndexInParentTx,
        isUnspent: request.isUnspent,
      }
    );
  }
}

export function statusStringToCode(
  state: RemoteTxState,
): TxStatusCodesType {
  if (state === 'Successful') {
    return TxStatusCodes.IN_BLOCK;
  }
  if (state === 'Pending') {
    return TxStatusCodes.PENDING;
  }
  if (state === 'Failed') {
    return TxStatusCodes.FAIL_RESPONSE;
  }
  throw new Error(`${nameof(statusStringToCode)} unexpected status ` + state);
}

export function networkTxHeaderToDb(
  tx: RemoteErgoTransaction,
  TransactionSeed: number,
  BlockSeed: number,
): {
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
  ...
} {
  const block =
    tx.block_hash != null &&
    tx.time != null &&
    tx.block_num != null
      ? {
        Hash: tx.block_hash,
        BlockTime: new Date(tx.time),
        Height: tx.block_num,
        SlotNum: 0, // TODO
        Digest: digestForHash(tx.hash, BlockSeed),
      }
      : null;
  const digest = digestForHash(tx.hash, TransactionSeed);

  const baseTx = {
    Hash: tx.hash,
    Digest: digest,
    Ordinal: tx.tx_ordinal,
    LastUpdateTime: block == null
      ? new Date().getTime()
      : new Date(tx.time).getTime(),
    Status: statusStringToCode(tx.tx_state),
    ErrorMessage: null, // TODO: add error message from backend if present
  };

  return {
    block,
    transaction: (blockId) => ({
      Type: TransactionType.Ergo,
      Extra: null,
      BlockId: blockId,
      ...baseTx,
    }: ErgoTransactionInsert),
  };
}
