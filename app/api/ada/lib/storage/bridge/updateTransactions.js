// @flow

import { isEqual } from 'lodash';
import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import type { BlockInsert, BlockRow, } from '../database/primitives/tables';
import {
  GetAddress,
  GetBlock,
  GetEncryptionMeta,
  GetPathWithSpecific,
  GetDerivationsByPath,
} from '../database/primitives/api/read';
import { GetOrAddAddress, } from '../database/primitives/api/write';
import { digetForHash, } from '../database/primitives/api/utils';
import {
  ModifyTransaction, MarkUtxo,
} from '../database/transactions/api/write';
import {
  AssociateTxWithUtxoIOs, GetUtxoTxOutputsWithTx, GetTransaction,
  GetTxAndBlock,
  GetUtxoInputs,
} from '../database/transactions/api/read';
import type {
  RemoteTxState,
  RemoteTransaction,
  UtxoAnnotatedTransaction,
} from '../../../adaTypes';
import type {
  HashToIdsFunc,
  ToAbsoluteSlotNumberFunc,
} from '../models/utils';
import type {
  TransactionInsert,
  TxStatusCodesType,
  UtxoTransactionInputInsert, UtxoTransactionOutputInsert,
  DbTxIO, DbTxInChain,
  TransactionRow,
} from '../database/transactions/tables';
import { TxStatusCodes, } from '../database/transactions/tables';
import {
  ScanAddressesInstance,
} from '../models/PublicDeriver';
import type { IPublicDeriver, IGetAllAddresses, } from '../models/PublicDeriver/interfaces';
import {
  GetLastSyncForPublicDeriver,
  GetPublicDeriver,
  GetKeyForPublicDeriver,
} from '../database/wallet/api/read';
import { AddTree, ModifyDisplayCutoff, } from '../database/bip44/api/write';
import { GetDerivationSpecific, } from '../database/bip44/api/read';
import { ModifyLastSyncInfo, } from '../database/wallet/api/write';
import type { LastSyncInfoRow, } from '../database/wallet/tables';
import { genToAbsoluteSlotNumber, rawGenHashToIdsFunc, } from  '../models/utils';
import { STABLE_SIZE } from '../../../../../config/numbersConfig';
import { RollbackApiError } from '../../../errors';
import { getFromUserPerspective, } from '../../utils';

import type {
  FilterFunc, HistoryFunc, BestBlockFunc,
} from '../../state-fetch/types';

export async function rawGetUtxoTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  depTables: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {
    addressFetch: IGetAllAddresses,
    getTxAndBlock: (txIds: Array<number>) => Promise<$ReadOnlyArray<{
      Block: null | $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>
    }>>,
    skip?: number,
    limit?: number,
  },
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<UtxoAnnotatedTransaction>,
|}> {
  const addresses = await request.addressFetch.rawGetAllAddresses(
    dbTx,
    {
      GetPathWithSpecific: depTables.GetPathWithSpecific,
      GetAddress: depTables.GetAddress,
      GetDerivationSpecific: depTables.GetDerivationSpecific,
    },
    undefined,
  );
  const addressIds = addresses.map(address => address.addr.AddressId);
  const txIds = await depTables.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
    db, dbTx,
    { addressIds }
  );

  const blockMap = new Map<number, null | $ReadOnly<BlockRow>>();
  const txs = await request.getTxAndBlock(txIds);
  for (const tx of txs) {
    blockMap.set(tx.Transaction.TransactionId, tx.Block);
  }
  const txsWithIOs = await depTables.AssociateTxWithUtxoIOs.mergeTxWithIO(
    db, dbTx,
    { txs: txs.map(txWithBlock => txWithBlock.Transaction) }
  );

  // we need to build a lookup map of AddressId => Hash
  // note: some inputs or outputs may not belong to us
  // so we can't build this map from previously calculated information
  const addressLookupMap = new Map<number, string>();
  {
    const allAddressIds = txsWithIOs.flatMap(txWithIO => [
      ...txWithIO.utxoInputs.map(input => input.AddressId),
      ...txWithIO.utxoOutputs.map(output => output.AddressId)
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

  const result = txsWithIOs.map(tx => ({
    ...tx,
    block: blockMap.get(tx.transaction.TransactionId),
    ...getFromUserPerspective({
      txInputs: tx.utxoInputs,
      txOutputs: tx.utxoOutputs,
      allOwnedAddressIds: new Set(addressIds),
    })
  }));

  return {
    addressLookupMap,
    txs: result,
  };
}

export async function getAllUtxoTransactions(
  db: lf$Database,
  request: {
    addressFetch: IGetAllAddresses,
    skip?: number,
    limit?: number,
  },
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<UtxoAnnotatedTransaction>,
|}> {
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii(
    db,
    depTables,
    async dbTx => {
      return await rawGetUtxoTransactions(
        db, dbTx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetAddress: deps.GetAddress,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
        },
        {
          ...request,
          getTxAndBlock: async (txIds) => await deps.GetTxAndBlock.byTime(
            db, dbTx,
            {
              txIds,
              skip: request.skip,
              limit: request.limit,
            }
          )
        },
      );
    }
  );
}

export async function getPendingUtxoTransactions(
  db: lf$Database,
  request: {
    addressFetch: IGetAllAddresses,
  },
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<UtxoAnnotatedTransaction>,
|}> {
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii(
    db,
    depTables,
    async dbTx => {
      return await rawGetUtxoTransactions(
        db, dbTx,
        {
          GetPathWithSpecific: deps.GetPathWithSpecific,
          GetAddress: deps.GetAddress,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
        },
        {
          ...request,
          getTxAndBlock: async (txIds) => await deps.GetTxAndBlock.withStatus(
            db, dbTx,
            {
              txIds,
              status: [TxStatusCodes.PENDING],
            }
          )
        },
      );
    }
  );
}

export async function updateTransactions(
  db: lf$Database,
  publicDeriver: IPublicDeriver & IGetAllAddresses,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
) {
  let lastSyncInfo = undefined;
  try {
    const updateDepTables = Object.freeze({
      GetLastSyncForPublicDeriver,
      ModifyLastSyncInfo,
      GetKeyForPublicDeriver,
      GetAddress,
      GetPathWithSpecific,
      GetUtxoTxOutputsWithTx,
      GetOrAddAddress,
      GetPublicDeriver,
      AddTree,
      ModifyTransaction,
      MarkUtxo,
      AssociateTxWithUtxoIOs,
      ModifyDisplayCutoff,
      GetDerivationsByPath,
      GetEncryptionMeta,
      GetTransaction,
      GetUtxoInputs,
      GetTxAndBlock,
      GetDerivationSpecific,
    });
    const updateTables = Object
      .keys(updateDepTables)
      .map(key => updateDepTables[key])
      .flatMap(table => getAllSchemaTables(db, table));

    await raii(
      db,
      updateTables,
      async dbTx => {
        lastSyncInfo = await updateDepTables.GetLastSyncForPublicDeriver.forId(
          db, dbTx,
          publicDeriver.getPublicDeriverId()
        );
        await rawUpdateTransactions(
          db, dbTx,
          updateDepTables,
          publicDeriver,
          lastSyncInfo,
          checkAddressesInUse,
          getTransactionsHistoryForAddresses,
          getBestBlock,
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
      AssociateTxWithUtxoIOs,
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
    });
    const rollbackTables = Object
      .keys(rollbackDepTables)
      .map(key => rollbackDepTables[key])
      .flatMap(table => getAllSchemaTables(db, table));
    await raii(
      db,
      rollbackTables,
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
          }
        );
      }
    );
  }
}

async function rollback(
  db: lf$Database,
  dbTx: lf$Transaction,
  depTables: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver>,
    ModifyLastSyncInfo: Class<ModifyLastSyncInfo>,
    GetBlock: Class<GetBlock>,
    ModifyTransaction: Class<ModifyTransaction>,
    MarkUtxo: Class<MarkUtxo>,
    GetTransaction: Class<GetTransaction>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {
    publicDeriver: IPublicDeriver & IGetAllAddresses,
    lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  }
): Promise<void> {
  const { TransactionSeed, } = await depTables.GetEncryptionMeta.get(db, dbTx);

  // if we've never succcessfully sync'd from the server, no need to rollback
  const lastSyncSlotNum = request.lastSyncInfo.SlotNum;
  if (lastSyncSlotNum === null) {
    return;
  }

  // 1) Get the best block we have in storage
  const addresses = await request.publicDeriver.rawGetAllAddresses(
    dbTx,
    {
      GetPathWithSpecific: depTables.GetPathWithSpecific,
      GetAddress: depTables.GetAddress,
      GetDerivationSpecific: depTables.GetDerivationSpecific,
    },
    undefined,
  );
  const txIds = await depTables.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
    db, dbTx,
    { addressIds: addresses.map(address => address.addr.AddressId) }
  );
  const bestInStorage = await depTables.GetTxAndBlock.firstTxBefore(
    db, dbTx,
    {
      txIds,
      slot: Number.MAX_SAFE_INTEGER,
    }
  );
  if (bestInStorage == null) {
    // if we have no txs stored, no need to rollback
    return;
  }

  // 2) Get latest k transactions

  const txsToRevert = await depTables.GetTxAndBlock.gteSlot(
    db, dbTx,
    { txIds, slot: bestInStorage.Block.SlotNum - STABLE_SIZE }
  );

  // 3) mark rollback transactions as failed
  // Note: theoretically we should mark rolled back transactions as pending
  // however, this is problematic for us because Yoroi doesn't allow multiple pending transactions
  // so instead, we mark them as failed

  for (const tx of txsToRevert) {
    // we keep both the block in the tx in history
    // because we need this information to show the fail tx information to the user
    await ModifyTransaction.updateStatus(
      db, dbTx,
      {
        status: TxStatusCodes.ROLLBACK_FAIL,
        transaction: tx.Transaction,
      }
    );
  }

  // 4) set all UTXO from these transactions as unspent

  await markAllInputs(
    db, dbTx,
    {
      MarkUtxo: depTables.MarkUtxo,
      GetUtxoInputs: depTables.GetUtxoInputs,
      GetTransaction: depTables.GetTransaction,
    }, {
      inputTxIds: txsToRevert.map(tx => tx.Transaction.TransactionId),
      allTxIds: txIds,
      isUnspent: true,
      TransactionSeed,
    }
  );

  // 5) marked pending transactions as failed
  const pendingTxs = await depTables.GetTransaction.withStatus(
    db, dbTx,
    {
      txIds,
      status: [TxStatusCodes.PENDING]
    }
  );
  for (const pendingTx of pendingTxs) {
    // TODO: would be faster if this was batched
    await ModifyTransaction.updateStatus(
      db, dbTx,
      {
        transaction: pendingTx,
        status: TxStatusCodes.ROLLBACK_FAIL,
      }
    );
  }

  // 6) Rollback LastSyncTable
  const bestStillIncluded = await depTables.GetTxAndBlock.firstTxBefore(
    db, dbTx,
    { txIds, slot: bestInStorage.Block.SlotNum - STABLE_SIZE }
  );
  await ModifyLastSyncInfo.overrideLastSyncInfo(
    db, dbTx,
    {
      LastSyncInfoId: request.lastSyncInfo.LastSyncInfoId,
      Time: new Date(Date.now()),
      SlotNum: bestStillIncluded === undefined ? null : bestStillIncluded.Block.SlotNum,
      Height: bestStillIncluded === undefined ? 0 : bestStillIncluded.Block.Height,
      BlockHash: bestStillIncluded === undefined ? null : bestStillIncluded.Block.Hash,
    }
  );

  // note: we don't modify the display cuttoff since it may confuse the user to suddenly shrink it
}

async function rawUpdateTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  depTables: {|
    GetLastSyncForPublicDeriver: Class<GetLastSyncForPublicDeriver>,
    ModifyLastSyncInfo: Class<ModifyLastSyncInfo>,
    GetKeyForPublicDeriver: Class<GetKeyForPublicDeriver>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetOrAddAddress: Class<GetOrAddAddress>,
    GetPublicDeriver: Class<GetPublicDeriver>,
    AddTree: Class<AddTree>,
    ModifyTransaction: Class<ModifyTransaction>,
    MarkUtxo: Class<MarkUtxo>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
    GetDerivationsByPath: Class<GetDerivationsByPath>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  publicDeriver: IPublicDeriver & IGetAllAddresses,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
): Promise<void> {
  const iPublicDeriver: IPublicDeriver = publicDeriver;
  const toAbsoluteSlotNumber = await genToAbsoluteSlotNumber();
  // 1) Check if backend is synced (avoid rollbacks if backend has to resync from block 1)

  const bestBlock = await getBestBlock();
  const slotInRemote = (bestBlock.epoch == null || bestBlock.slot == null)
    ? null
    : toAbsoluteSlotNumber({
      epoch: bestBlock.epoch,
      slot: bestBlock.slot,
    });
  if (lastSyncInfo.SlotNum !== null) {
    const lastSlotSeen = lastSyncInfo.SlotNum;
    const inRemote = (slotInRemote != null ? slotInRemote : 0);
    // if we're K slots ahead of remote
    if (lastSlotSeen - inRemote > STABLE_SIZE) {
      return;
    }
  }

  if (bestBlock.hash != null) {
    const untilBlock = bestBlock.hash;

    // 2) sync our address set with remote to make sure txs are identified as ours

    if (iPublicDeriver instanceof ScanAddressesInstance) {
      await iPublicDeriver.rawScanAddresses(
        dbTx,
        {
          GetKeyForPublicDeriver: depTables.GetKeyForPublicDeriver,
          GetAddress: depTables.GetAddress,
          GetPathWithSpecific: depTables.GetPathWithSpecific,
          GetUtxoTxOutputsWithTx: depTables.GetUtxoTxOutputsWithTx,
          GetOrAddAddress: depTables.GetOrAddAddress,
          GetPublicDeriver: depTables.GetPublicDeriver,
          AddTree: depTables.AddTree,
          ModifyDisplayCutoff: depTables.ModifyDisplayCutoff,
          GetDerivationsByPath: depTables.GetDerivationsByPath,
          GetDerivationSpecific: depTables.GetDerivationSpecific,
        },
        { checkAddressesInUse },
      );
    }

    // 3) get new txs from fetcher

    // important: we fetched addresses AFTER scanning for new addresses
    const addresses = await publicDeriver.rawGetAllAddresses(
      dbTx,
      {
        GetPathWithSpecific: depTables.GetPathWithSpecific,
        GetAddress: depTables.GetAddress,
        GetDerivationSpecific: depTables.GetDerivationSpecific,
      },
      undefined,
    );
    const addressIds = addresses.map(address => address.addr.AddressId);
    const txIds = await depTables.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
      db, dbTx,
      { addressIds }
    );
    const bestInStorage = await depTables.GetTxAndBlock.firstTxBefore(
      db, dbTx,
      {
        txIds,
        slot: Number.MAX_SAFE_INTEGER,
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
      addresses: addresses.map(address => address.addr.Hash),
      untilBlock,
    });

    // 4) save data to local DB
    await updateTransactionBatch(
      db,
      dbTx,
      {
        ModifyTransaction: depTables.ModifyTransaction,
        MarkUtxo: depTables.MarkUtxo,
        AssociateTxWithUtxoIOs: depTables.AssociateTxWithUtxoIOs,
        GetEncryptionMeta: depTables.GetEncryptionMeta,
        GetTransaction: depTables.GetTransaction,
        GetUtxoInputs: depTables.GetUtxoInputs,
      },
      {
        utxoAddressIds: addressIds,
        txsFromNetwork,
        hashToIds: rawGenHashToIdsFunc(
          db, dbTx,
          { GetOrAddAddress: depTables.GetOrAddAddress },
          new Set(addresses.map(address => address.addr.AddressId))
        ),
        toAbsoluteSlotNumber,
      }
    );
  }

  // 5) update last sync
  await ModifyLastSyncInfo.overrideLastSyncInfo(
    db, dbTx,
    {
      LastSyncInfoId: lastSyncInfo.LastSyncInfoId,
      Time: new Date(Date.now()),
      SlotNum: slotInRemote,
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
  depTables: {|
    ModifyTransaction: Class<ModifyTransaction>,
    MarkUtxo: Class<MarkUtxo>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
  |},
  request: {
    toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
    utxoAddressIds: Array<number>,
    txsFromNetwork: Array<RemoteTransaction>,
    hashToIds: HashToIdsFunc,
  }
): Promise<Array<DbTxInChain>> {
  const { TransactionSeed, BlockSeed } = await depTables.GetEncryptionMeta.get(db, dbTx);

  const txIds = await depTables.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
    db, dbTx,
    { addressIds: request.utxoAddressIds }
  );

  const matchesInDb = new Map<string, DbTxIO>();
  {
    const digestsForNew = request.txsFromNetwork.map(tx => digetForHash(tx.hash, TransactionSeed));
    const matchByDigest = await depTables.GetTransaction.byDigest(db, dbTx, {
      digests: digestsForNew,
      txIds,
    });
    const txsWithIOs = await depTables.AssociateTxWithUtxoIOs.mergeTxWithIO(
      db, dbTx,
      { txs: Array.from(matchByDigest.values()) }
    );
    for (const tx of txsWithIOs) {
      matchesInDb.set(tx.transaction.Hash, tx);
    }
  }

  const unseedNewTxs = [];
  const txsAddedToBlock: Array<DbTxInChain> = [];
  const modifiedTxIds = new Set<number>();
  for (const txFromNetwork of request.txsFromNetwork) {
    const matchInDb = matchesInDb.get(txFromNetwork.hash);
    if (matchInDb == null) {
      unseedNewTxs.push(txFromNetwork);
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
      request.toAbsoluteSlotNumber,
      TransactionSeed,
      BlockSeed
    );
    modifiedTxIds.add(matchInDb.transaction.TransactionId);
    const result = await depTables.ModifyTransaction.updateExisting(
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
        block: result.block,
        transaction: result.transaction,
        utxoInputs: matchInDb.utxoInputs,
        utxoOutputs: matchInDb.utxoOutputs,
      });
    }
  }

  // 2) Add new transactions
  const newTxsForDb = await networkTxToDbTx(
    unseedNewTxs,
    request.hashToIds,
    request.toAbsoluteSlotNumber,
    TransactionSeed,
    BlockSeed,
  );
  const newsTxsIdSet = new Set();
  for (const newTx of newTxsForDb) {
    const result = await depTables.ModifyTransaction.addNew(
      db,
      dbTx,
      newTx,
    );
    newsTxsIdSet.add(result.transaction.TransactionId);
    if (result.block !== null) {
      txsAddedToBlock.push({
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
      MarkUtxo: depTables.MarkUtxo,
      GetUtxoInputs: depTables.GetUtxoInputs,
      GetTransaction: depTables.GetTransaction,
    },
    {
      inputTxIds: newTxIds,
      allTxIds: [
        ...txIds,
        ...newTxIds,
      ],
      isUnspent: false,
      TransactionSeed,
    }
  );

  // 4) Mark any pending tx that is not found by remote as failed

  const pendingTxs = await depTables.GetTransaction.withStatus(
    db, dbTx,
    {
      txIds, // note: we purposely don't include the txids of transactions we just added
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
      await ModifyTransaction.updateStatus(
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

export async function networkTxToDbTx(
  newTxs: Array<RemoteTransaction>,
  hashToIds: HashToIdsFunc,
  toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
  TransactionSeed: number,
  BlockSeed: number,
): Promise<Array<{
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
  ioGen: (txRowId: number) => {|
    utxoInputs: Array<UtxoTransactionInputInsert>,
    utxoOutputs: Array<UtxoTransactionOutputInsert>,
  |},
}>> {
  const allAddresses = Array.from(new Set(
    newTxs.flatMap(tx => [
      ...tx.inputs.map(input => input.address),
      ...tx.outputs.map(output => output.address),
    ]),
  ));
  const idMapping = await hashToIds(allAddresses);

  const getIdOrThrow = (hash: string): number => {
    const id = idMapping.get(hash);
    if (id === undefined) {
      throw new Error('networkTxToDbTx should never happen id === undefined');
    }
    return id;
  };

  const mapped = newTxs.map(networkTx => {
    const { block, transaction } = networkTxHeaderToDb(
      networkTx,
      toAbsoluteSlotNumber,
      TransactionSeed,
      BlockSeed,
    );
    return {
      block,
      transaction,
      ioGen: (txRowId) => ({
        utxoInputs: networkTx.inputs.map((input, i) => ({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(input.address),
          ParentTxHash: input.txHash,
          IndexInParentTx: input.index,
          IndexInOwnTx: i,
          Amount: input.amount,
        })),
        utxoOutputs: networkTx.outputs.map((output, i) => ({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(output.address),
          OutputIndex: i,
          Amount: output.amount,
          /** we assume unspent for now but it will be updated after if necessary */
          // TODO: if this output doesn't belong to you, it may be unspent forever. Do we want this? Not clear.
          IsUnspent: true,
        })),
      }),
    };
  });

  return mapped;
}

async function markAllInputs(
  db: lf$Database,
  dbTx: lf$Transaction,
  depTables: {|
    MarkUtxo: Class<MarkUtxo>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    GetTransaction: Class<GetTransaction>,
  |},
  request: {
    inputTxIds: Array<number>,
    allTxIds: Array<number>,
    isUnspent: boolean,
    TransactionSeed: number,
  },
): Promise<void> {
  const inputs = await depTables.GetUtxoInputs.fromTxIds(
    db, dbTx,
    { ids: request.inputTxIds },
  );
  const digests = inputs.map(input => digetForHash(input.ParentTxHash, request.TransactionSeed));
  const txMap = await depTables.GetTransaction.byDigest(
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
    await depTables.MarkUtxo.markAs(
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
  throw new Error('statusStringToCode unexpected status ' + state);
}

export function networkTxHeaderToDb(
  tx: RemoteTransaction,
  toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
  TransactionSeed: number,
  BlockSeed: number,
): {
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
} {
  const block =
    tx.epoch != null &&
    tx.slot != null &&
    tx.block_hash != null &&
    tx.time != null &&
    tx.height != null
      ? {
        Hash: tx.block_hash,
        BlockTime: new Date(tx.time),
        Height: tx.height,
        SlotNum: toAbsoluteSlotNumber({ epoch: tx.epoch, slot: tx.slot }),
        Digest: digetForHash(tx.hash, BlockSeed),
      }
      : null;
  const digest = digetForHash(tx.hash, TransactionSeed);
  return {
    block,
    transaction: (blockId) => ({
      Hash: tx.hash,
      Digest: digest,
      BlockId: blockId,
      Ordinal: tx.tx_ordinal,
      LastUpdateTime: block == null || tx.time == null
        ? new Date(tx.last_update).getTime() // this is out best guess for txs not in a block
        : new Date(tx.time).getTime(),
      Status: statusStringToCode(tx.tx_state),
      ErrorMessage: null, // TODO: add error message from backend if present
    }),
  };
}
