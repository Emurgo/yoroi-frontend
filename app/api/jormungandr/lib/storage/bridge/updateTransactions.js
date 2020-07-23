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
  BlockInsert,
  TransactionInsert, TransactionRow,
  NetworkRow,
} from '../../../../ada/lib/storage/database/primitives/tables';
import type {
  TxStatusCodesType,
} from '../../../../ada/lib/storage/database/primitives/enums';
import {
  GetAddress,
  GetBlock,
  GetEncryptionMeta,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetTransaction,
  GetTxAndBlock,
} from '../../../../ada/lib/storage/database/primitives/api/read';
import {
  ModifyAddress,
  ModifyTransaction,
} from '../../../../ada/lib/storage/database/primitives/api/write';
import type { AddCertificateRequest } from '../../../../ada/lib/storage/database/primitives/api/write';
import { ModifyMultipartTx } from  '../../../../ada/lib/storage/database/transactionModels/multipart/api/write';
import { digestForHash, } from '../../../../ada/lib/storage/database/primitives/api/utils';
import {
  MarkUtxo,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/write';
import {
  GetUtxoTxOutputsWithTx,
  GetUtxoInputs,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/read';
import {
  AssociateTxWithIOs
} from '../../../../ada/lib/storage/database/transactionModels/multipart/api/read';
import {
  InputTypes,
} from '../../state-fetch/types';
import type {
  ToAbsoluteSlotNumberFunc,
} from './timeUtils';
import type {
  UtxoTransactionInputInsert, UtxoTransactionOutputInsert,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/tables';
import type {
  AccountingTransactionInputInsert, AccountingTransactionOutputInsert,
} from '../../../../ada/lib/storage/database/transactionModels/account/tables';
import {
  TxStatusCodes,
  CoreAddressTypes,
  CertificateRelation,
} from '../../../../ada/lib/storage/database/primitives/enums';
import {
  asScanAddresses, asHasLevels,
} from '../../../../ada/lib/storage/models/PublicDeriver/traits';
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
} from '../../../../ada/lib/storage/database/walletTypes/core/api/write';
import type { LastSyncInfoRow, } from '../../../../ada/lib/storage/database/walletTypes/core/tables';
import type { DbTxIO, DbTxInChain } from '../../../../ada/lib/storage/database/transactionModels/multipart/tables';
import {
  rawGetAddressRowsForWallet,
} from  '../../../../ada/lib/storage/bridge/traitUtils';
import {
  genToAbsoluteSlotNumber,
} from './timeUtils';
import {
  rawGenHashToIdsFunc,
} from '../../../../common/lib/storage/bridge/hashMapper';
import type {
  HashToIdsFunc,
} from '../../../../common/lib/storage/bridge/hashMapper';
import { STABLE_SIZE } from '../../../../../config/numbersConfig';
import { RollbackApiError } from '../../../../common/errors';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';

import type {
  HistoryFunc, BestBlockFunc,
  RemoteTxState,
  RemoteTransaction,
  RemoteTransactionInput,
  RemoteCertificate,
} from '../../state-fetch/types';
import type {
  FilterFunc,
} from '../../../../common/lib/state-fetch/currencySpecificTypes';
import { addressToKind } from '../../../../ada/lib/storage/bridge/utils';

import environment from '../../../../../environment';

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
      ModifyMultipartTx,
      AssociateTxWithIOs,
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
      AssociateTxWithIOs,
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
    AssociateTxWithIOs: Class<AssociateTxWithIOs>,
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
  const lastSyncSlotNum = request.lastSyncInfo.SlotNum;
  if (lastSyncSlotNum === null) {
    return;
  }

  // 1) Get all transactions
  const {
    utxoAddresses,
    accountingAddresses,
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
  const accountingAddressIds = accountingAddresses.map(address => address.AddressId);
  const txIds = await deps.AssociateTxWithIOs.getTxIdsForAddresses(
    db, dbTx,
    {
      utxoAddressIds,
      accountingAddressIds,
    }
  );

  // 2) get best tx in block
  const bestInStorage = await deps.GetTxAndBlock.firstSuccessTxBefore(
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

  // 3) Get latest k transactions

  const txsToRevert = await deps.GetTxAndBlock.gteSlot(
    db, dbTx,
    { txIds, slot: bestInStorage.Block.SlotNum - STABLE_SIZE }
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
    { txIds, slot: bestInStorage.Block.SlotNum - STABLE_SIZE }
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
    ModifyMultipartTx: Class<ModifyMultipartTx>,
    AssociateTxWithIOs: Class<AssociateTxWithIOs>,
  |},
  publicDeriver: IPublicDeriver<>,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
  derivationTables: Map<number, string>,
): Promise<void> {
  // TODO: consider passing this function in as an argument instead of generating it here
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
        },
        // TODO: race condition because we don't pass in best block here
        { checkAddressesInUse },
        derivationTables,
      );
    }

    // 3) get new txs from fetcher

    // important: get addresses for our wallet AFTER scanning for new addresses
    const {
      utxoAddresses,
      accountingAddresses,
    } = await rawGetAddressRowsForWallet(
      dbTx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      { publicDeriver },
      derivationTables,
    );
    const utxoAddressIds = utxoAddresses.map(address => address.AddressId);
    const accountingAddressIds = accountingAddresses.map(address => address.AddressId);
    const txIds = await deps.AssociateTxWithIOs.getTxIdsForAddresses(
      db, dbTx,
      {
        utxoAddressIds,
        accountingAddressIds,
      }
    );
    const bestInStorage = await deps.GetTxAndBlock.firstSuccessTxBefore(
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
      addresses: [
        ...utxoAddresses
          // Note: don't send group keys
          // Okay to filter them because the payment key is duplicated inside the single addresses
          .filter(address => address.Type !== CoreAddressTypes.JORMUNGANDR_GROUP)
          .map(address => address.Hash),
        ...accountingAddresses.map(address => address.Hash),
      ],
      untilBlock,
    });

    // 4) save data to local DB
    // WARNING: this can also modify the address set
    // ex: a new group address is found
    await updateTransactionBatch(
      db,
      dbTx,
      {
        MarkUtxo: deps.MarkUtxo,
        AssociateTxWithIOs: deps.AssociateTxWithIOs,
        GetEncryptionMeta: deps.GetEncryptionMeta,
        GetTransaction: deps.GetTransaction,
        GetUtxoInputs: deps.GetUtxoInputs,
        ModifyTransaction: deps.ModifyTransaction,
        ModifyMultipartTx: deps.ModifyMultipartTx,
      },
      {
        network: publicDeriver.getParent().getNetworkInfo(),
        txIds,
        txsFromNetwork,
        hashToIds: rawGenHashToIdsFunc(
          new Set([
            ...utxoAddressIds,
            ...accountingAddressIds,
          ]),
          publicDeriver.getParent().getNetworkInfo()
        ),
        toAbsoluteSlotNumber,
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
  deps: {|
    MarkUtxo: Class<MarkUtxo>,
    AssociateTxWithIOs: Class<AssociateTxWithIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyMultipartTx: Class<ModifyMultipartTx>,
  |},
  request: {|
    network: $ReadOnly<NetworkRow>,
    toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
    txIds: Array<number>,
    txsFromNetwork: Array<RemoteTransaction>,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
  |}
): Promise<Array<DbTxInChain>> {
  const { TransactionSeed, BlockSeed } = await deps.GetEncryptionMeta.get(db, dbTx);

  const matchesInDb = new Map<string, DbTxIO>();
  {
    const digestsForNew = request.txsFromNetwork.map(tx => digestForHash(tx.hash, TransactionSeed));
    const matchByDigest = await deps.GetTransaction.byDigest(db, dbTx, {
      digests: digestsForNew,
      txIds: request.txIds,
    });
    const txs: Array<$ReadOnly<TransactionRow>> = Array.from(matchByDigest.values());
    const txsWithIOs = await deps.AssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      { txs }
    );
    for (const tx of txsWithIOs) {
      matchesInDb.set(tx.transaction.Hash, tx);
    }
  }

  const unseenNewTxs: Array<RemoteTransaction> = [];
  const txsAddedToBlock: Array<DbTxInChain> = [];
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
      request.toAbsoluteSlotNumber,
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
        ...matchInDb,
        // override with updated
        block: result.block,
        transaction: result.transaction,
      });
    }
  }

  // 2) Add new transactions
  const newTxsForDb = await networkTxToDbTx(
    db,
    dbTx,
    request.network,
    request.derivationTables,
    unseenNewTxs,
    request.hashToIds,
    request.toAbsoluteSlotNumber,
    TransactionSeed,
    BlockSeed,
  );
  const newsTxsIdSet = new Set();
  for (const newTx of newTxsForDb) {
    const result = await deps.ModifyMultipartTx.addTxWithIOs(
      db,
      dbTx,
      newTx,
    );
    newsTxsIdSet.add(result.transaction.TransactionId);
    if (result.block !== null) {
      txsAddedToBlock.push({
        block: result.block,
        transaction: result.transaction,
        certificates: result.certificates,
        utxoInputs: result.utxoInputs,
        utxoOutputs: result.utxoOutputs,
        accountingInputs: result.accountingInputs,
        accountingOutputs: result.accountingOutputs,
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

async function networkTxToDbTx(
  db: lf$Database,
  dbTx: lf$Transaction,
  network: $ReadOnly<NetworkRow>,
  derivationTables: Map<number, string>,
  newTxs: Array<RemoteTransaction>,
  hashToIds: HashToIdsFunc,
  toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
  TransactionSeed: number,
  BlockSeed: number,
): Promise<Array<{|
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
  certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
  ioGen: number => {|
    utxoInputs: Array<UtxoTransactionInputInsert>,
    utxoOutputs: Array<UtxoTransactionOutputInsert>,
    accountingInputs: Array<AccountingTransactionInputInsert>,
    accountingOutputs: Array<AccountingTransactionOutputInsert>,
  |},
|}>> {
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

  const result = [];
  for (const networkTx of newTxs) {
    const { block, transaction } = networkTxHeaderToDb(
      networkTx,
      toAbsoluteSlotNumber,
      TransactionSeed,
      BlockSeed,
    );

    const certificates: Array<
      number => (void | AddCertificateRequest)
    > = networkTx.certificate == null
      ? [(_txId) => undefined]
      : [await certificateToDb(
        db, dbTx,
        {
          certificate: networkTx.certificate,
          hashToIds,
          derivationTables,
          firstInput: networkTx.inputs[0],
        }
      )];
    result.push({
      block,
      transaction,
      certificates,
      ioGen: (txRowId) => {
        const utxoInputs = [];
        const utxoOutputs = [];
        const accountingInputs = [];
        const accountingOutputs = [];
        for (let i = 0; i < networkTx.inputs.length; i++) {
          const input = networkTx.inputs[i];
          if (input.type === InputTypes.utxo || input.type === InputTypes.legacyUtxo) {
            utxoInputs.push({
              TransactionId: txRowId,
              AddressId: getIdOrThrow(input.address),
              ParentTxHash: input.txHash,
              IndexInParentTx: input.index,
              IndexInOwnTx: i,
              Amount: input.amount,
            });
          } else if (input.type === InputTypes.account) {
            accountingInputs.push({
              TransactionId: txRowId,
              AddressId: getIdOrThrow(input.address),
              SpendingCounter: input.spendingCounter,
              IndexInOwnTx: i,
              Amount: input.amount,
            });
          } else {
            throw new Error(`${nameof(networkTxToDbTx)} Unhandled input type`);
          }
        }
        for (let i = 0; i < networkTx.outputs.length; i++) {
          const output = networkTx.outputs[i];
          const txType = addressToKind(output.address, 'bytes', network);
          // consider a group address as a UTXO output
          // since the payment (UTXO) key is the one that signs
          if (
            txType === CoreAddressTypes.CARDANO_LEGACY ||
            txType === CoreAddressTypes.JORMUNGANDR_SINGLE ||
            txType === CoreAddressTypes.JORMUNGANDR_GROUP
          ) {
            utxoOutputs.push({
              TransactionId: txRowId,
              AddressId: getIdOrThrow(output.address),
              OutputIndex: i,
              Amount: output.amount,
              /**
               * we assume unspent for now but it will be updated after if necessary
               * Note: if this output doesn't belong to you, it will be true forever
               * This is slightly misleading, but using null would require null-checks everywhere
               */
              IsUnspent: true,
            });
          } else if (
            txType === CoreAddressTypes.JORMUNGANDR_ACCOUNT
          ) {
            accountingOutputs.push({
              TransactionId: txRowId,
              AddressId: getIdOrThrow(output.address),
              OutputIndex: i,
              Amount: output.amount,
            });
          } else {
            // TODO: handle multisig
            throw new Error(`${nameof(networkTxToDbTx)} Unhandled output type`);
          }
        }

        return {
          utxoInputs,
          utxoOutputs,
          accountingInputs,
          accountingOutputs,
        };
      },
    });
  }

  return result;
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
  tx: RemoteTransaction,
  toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
  TransactionSeed: number,
  BlockSeed: number,
): {
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
  ...
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
        Digest: digestForHash(tx.hash, BlockSeed),
      }
      : null;
  const digest = digestForHash(tx.hash, TransactionSeed);
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

async function certificateToDb(
  db: lf$Database,
  dbTx: lf$Transaction,
  request: {|
    certificate: RemoteCertificate,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
    firstInput: RemoteTransactionInput,
  |},
): Promise<number => AddCertificateRequest> {
  const accountToId = async (account: RustModule.WalletV3.Account): Promise<number> => {
    const address = account.to_address(
      // TODO: should come from the public deriver, not environment
      environment.getDiscriminant(),
    );
    const hash = Buffer.from(address.as_bytes()).toString('hex');
    const idMap = await request.hashToIds({
      db,
      tx: dbTx,
      lockedTables: Array.from(request.derivationTables.values()),
      hashes: [hash]
    });
    const id = idMap.get(hash);
    if (id === undefined) {
      throw new Error(`${nameof(certificateToDb)} should never happen id === undefined`);
    }
    return id;
  };

  const kind = request.certificate.payloadKindId;
  switch (kind) {
    case RustModule.WalletV3.CertificateKind.StakeDelegation: {
      const cert = RustModule.WalletV3.StakeDelegation.from_bytes(
        Buffer.from(request.certificate.payloadHex, 'hex')
      );
      const accountIdentifier = cert.account();
      // TODO: this could be a multi sig instead of a single account
      // you can differentiate by looking at the witness type
      // but we don't have access to the witness right now
      const account = accountIdentifier.to_account_single();
      const addressId = await accountToId(account);

      return (txId: number) => ({
        certificate: {
          Kind: kind,
          Payload: request.certificate.payloadHex,
          TransactionId: txId,
        },
        relatedAddresses: (certId: number) => [{
          CertificateId: certId,
          AddressId: addressId,
          Relation: CertificateRelation.SIGNER,
        }]
      });
    }
    case RustModule.WalletV3.CertificateKind.OwnerStakeDelegation: {
      const idMap = await request.hashToIds({
        db,
        tx: dbTx,
        lockedTables: Array.from(request.derivationTables.values()),
        hashes: [request.firstInput.address]
      });
      const addressId = idMap.get(request.firstInput.address);
      if (addressId === undefined) {
        throw new Error(`${nameof(certificateToDb)} should never happen id === undefined`);
      }
      return (txId: number) => ({
        certificate: {
          Kind: kind,
          Payload: request.certificate.payloadHex,
          TransactionId: txId,
        },
        relatedAddresses: (certId: number) => [{
          CertificateId: certId,
          AddressId: addressId,
          Relation: CertificateRelation.SIGNER,
        }]
      });
    }
    case RustModule.WalletV3.CertificateKind.PoolRegistration: {
      const cert = RustModule.WalletV3.PoolRegistration.from_bytes(
        Buffer.from(request.certificate.payloadHex, 'hex')
      );
      const accountIdentifier = cert.reward_account();
      const rewardAccountId = accountIdentifier == null
        ? null
        : await accountToId(accountIdentifier);

      return (txId: number) => ({
        certificate: {
          Kind: kind,
          Payload: request.certificate.payloadHex,
          TransactionId: txId,
        },
        // TODO - can't know signer
        relatedAddresses: (certId: number) => [
          ...(rewardAccountId != null
            ? [{
              CertificateId: certId,
              AddressId: rewardAccountId,
              Relation: CertificateRelation.REWARD_ADDRESS,
            }]
            : [])
        ]
      });
    }
    case RustModule.WalletV3.CertificateKind.PoolRetirement: {
      return (txId: number) => ({
        certificate: {
          Kind: kind,
          Payload: request.certificate.payloadHex,
          TransactionId: txId,
        },
        // TODO - can't know signer
        relatedAddresses: (_certId: number) => []
      });
    }
    case RustModule.WalletV3.CertificateKind.PoolUpdate: {
      return (txId: number) => ({
        certificate: {
          Kind: kind,
          Payload: request.certificate.payloadHex,
          TransactionId: txId,
        },
        // TODO - can't know signer
        relatedAddresses: (_certId: number) => []
      });
    }
    default: throw new Error('unknown cert type ' + kind);
  }
}
