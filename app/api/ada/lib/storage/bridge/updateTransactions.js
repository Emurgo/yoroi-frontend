// @flow

import { isEqual } from 'lodash';
import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../database/utils';
import type {
  BlockInsert, BlockRow,
  TransactionInsert, TransactionRow,
  NetworkRow,
  DbBlock,
} from '../database/primitives/tables';
import {
  TransactionType,
} from '../database/primitives/tables';
import type {
  TxStatusCodesType,
  CertificateRelationType,
} from '../database/primitives/enums';
import {
  GetAddress,
  GetBlock,
  GetEncryptionMeta,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetTransaction,
  GetTxAndBlock,
} from '../database/primitives/api/read';
import {
  ModifyAddress,
  ModifyTransaction,
  FreeBlocks,
} from '../database/primitives/api/write';
import type { AddCertificateRequest } from '../database/primitives/api/write';
import { ModifyCardanoByronTx, ModifyCardanoShelleyTx } from  '../database/transactionModels/multipart/api/write';
import { digestForHash, } from '../database/primitives/api/utils';
import {
  MarkUtxo,
} from '../database/transactionModels/utxo/api/write';
import {
  GetUtxoTxOutputsWithTx,
  GetUtxoInputs,
  AssociateTxWithUtxoIOs,
} from '../database/transactionModels/utxo/api/read';
import {
  CardanoByronAssociateTxWithIOs
} from '../database/transactionModels/multipart/api/read';
import type {
  UserAnnotation,
} from '../../../transactions/types';
import type {
  ToAbsoluteSlotNumberFunc,
} from './timeUtils';
import type {
  UtxoTransactionInputInsert, UtxoTransactionOutputInsert,
} from '../database/transactionModels/utxo/tables';
import {
  TxStatusCodes,
  CoreAddressTypes,
  CertificateRelation,
} from '../database/primitives/enums';
import {
  asScanAddresses, asHasLevels, asGetAllUtxos, asGetAllAccounting,
} from '../models/PublicDeriver/traits';
import type { IHasLevels } from '../models/ConceptualWallet/interfaces';
import { ConceptualWallet } from '../models/ConceptualWallet/index';
import type {
  IPublicDeriver,
} from '../models/PublicDeriver/interfaces';
import {
  GetLastSyncForPublicDeriver,
  GetPublicDeriver,
  GetKeyForPublicDeriver,
} from '../database/walletTypes/core/api/read';
import { ModifyDisplayCutoff, } from '../database/walletTypes/bip44/api/write';
import { AddDerivationTree, } from '../database/walletTypes/common/api/write';
import { GetDerivationSpecific, } from '../database/walletTypes/common/api/read';
import {
  ModifyLastSyncInfo,
  DeleteAllTransactions,
} from '../database/walletTypes/core/api/write';
import type { LastSyncInfoRow, } from '../database/walletTypes/core/tables';
import type { CardanoByronTxIO, CardanoShelleyTxIO } from '../database/transactionModels/multipart/tables';
import {
  rawGetAddressRowsForWallet,
} from  './traitUtils';
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
import { getFromUserPerspective, } from '../../../transactions/utils';

import type {
  HistoryFunc, BestBlockFunc,
  RemoteTxState,
  RemoteTransaction,
  RemoteCertificate,
} from '../../state-fetch/types';
import {
  ShelleyCertificateTypes,
  RemoteTransactionTypes,
} from '../../state-fetch/types';
import type {
  FilterFunc,
} from '../../../../common/lib/state-fetch/currencySpecificTypes';
import { addressToKind } from './utils';
import { RustModule } from '../../cardanoCrypto/rustLoader';

async function rawGetAllTxIds(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet>, |},
  derivationTables: Map<number, string>,
): Promise<{|
  txIds: Array<number>,
  addressIds: {|
    utxoAddressIds: Array<number>,
    accountingAddressIds: Array<number>,
  |}
|}> {
  const utxoAddressIds = [];
  const withUtxos = asGetAllUtxos(request.publicDeriver);
  if (withUtxos != null) {
    const foundAddresses = await withUtxos.rawGetAllUtxoAddresses(
      dbTx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    const ids = foundAddresses.flatMap(address => address.addrs.map(addr => addr.AddressId));
    utxoAddressIds.push(...ids);
  }
  const accountingAddressIds = [];
  const withAccounting = asGetAllAccounting(request.publicDeriver);
  if (withAccounting != null) {
    const foundAddresses = await withAccounting.rawGetAllAccountingAddresses(
      dbTx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    const ids = foundAddresses.flatMap(address => address.addrs.map(addr => addr.AddressId));
    accountingAddressIds.push(...ids);
  }

  const txIds = Array.from(new Set([
    ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: utxoAddressIds },
    )),
  ]));
  return {
    txIds,
    addressIds: {
      utxoAddressIds,
      accountingAddressIds,
    },
  };
}

export async function rawGetTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
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
  ...(CardanoByronTxIO | CardanoShelleyTxIO),
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const {
    addressIds,
    txIds,
  } = await rawGetAllTxIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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
  const txsWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
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

  const result = txsWithIOs.map(tx => ({
    ...tx,
    block: blockMap.get(tx.transaction.TransactionId) || null,
    ...getFromUserPerspective({
      utxoInputs: tx.utxoInputs,
      utxoOutputs: tx.utxoOutputs,
      allOwnedAddressIds: new Set(
        Object.keys(addressIds).flatMap(key => addressIds[key])
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
  ...(CardanoByronTxIO | CardanoShelleyTxIO),
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    CardanoByronAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));

  return await raii(
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
          CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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
  ...(CardanoByronTxIO | CardanoShelleyTxIO),
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    CardanoByronAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));

  return await raii(
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
          CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
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
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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

  const txsWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    { txs: fullTxs }
  );

  const allAddressIds = txsWithIOs.flatMap(txWithIO => [
    ...txWithIO.utxoInputs.map(input => input.AddressId),
    ...txWithIO.utxoOutputs.map(output => output.AddressId),
  ]);

  const ourIds = new Set(
    Object.keys(relatedIds.addressIds)
      .flatMap(key => relatedIds.addressIds[key])
  );
  // recall: we store addresses that don't belong to our wallet in the DB
  // if they're in a tx that belongs to us
  const unownedAddresses = allAddressIds.filter(address => !ourIds.has(address));

  // get rid of duplications (some tx can have multiple inputs of same address)
  return Array.from(new Set(unownedAddresses));
}
export async function getForeignAddresses(
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>, |},
): Promise<Array<string>> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    CardanoByronAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    GetTransaction,
  });
  const db = request.publicDeriver.getDb();
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii(
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
      const result = addressRows.map(row => row.Hash);
      // remove duplicates
      return Array.from(new Set(result));
    }
  );
}

export async function rawRemoveAllTransactions(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
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
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
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
    CardanoByronAssociateTxWithIOs,
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

  return await raii(
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
      ModifyCardanoByronTx,
      ModifyCardanoShelleyTx,
      CardanoByronAssociateTxWithIOs,
      AssociateTxWithUtxoIOs,
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
      CardanoByronAssociateTxWithIOs,
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
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
  const lastSyncSlotNum = request.lastSyncInfo.SlotNum;
  if (lastSyncSlotNum === null) {
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
    ModifyCardanoByronTx: Class<ModifyCardanoByronTx>,
    ModifyCardanoShelleyTx: Class<ModifyCardanoShelleyTx>,
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
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
    const txIds = Array.from(new Set([
      ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
        db, dbTx, { addressIds: utxoAddressIds },
      )),
    ]));
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
          // Note: don't send base/ptr keys
          // Since the payment key is duplicated inside the enterprise addresses
          .filter(address => (
            address.Type !== CoreAddressTypes.CARDANO_BASE &&
            address.Type !== CoreAddressTypes.CARDANO_PTR
          ))
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
        CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
        GetEncryptionMeta: deps.GetEncryptionMeta,
        GetTransaction: deps.GetTransaction,
        GetUtxoInputs: deps.GetUtxoInputs,
        ModifyTransaction: deps.ModifyTransaction,
        ModifyCardanoByronTx: deps.ModifyCardanoByronTx,
        ModifyCardanoShelleyTx: deps.ModifyCardanoShelleyTx,
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyCardanoByronTx: Class<ModifyCardanoByronTx>,
    ModifyCardanoShelleyTx: Class<ModifyCardanoShelleyTx>,
  |},
  request: {|
    network: $ReadOnly<NetworkRow>,
    toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
    txIds: Array<number>,
    txsFromNetwork: Array<RemoteTransaction>,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
  |}
): Promise<Array<{|
  ...(CardanoByronTxIO | CardanoShelleyTxIO),
  ...DbBlock,
|}>> {
  const { TransactionSeed, BlockSeed } = await deps.GetEncryptionMeta.get(db, dbTx);

  const matchesInDb = new Map<string, CardanoByronTxIO | CardanoShelleyTxIO>();
  {
    const digestsForNew = request.txsFromNetwork.map(tx => digestForHash(tx.hash, TransactionSeed));
    const matchByDigest = await deps.GetTransaction.byDigest(db, dbTx, {
      digests: digestsForNew,
      txIds: request.txIds,
    });
    const txs: Array<$ReadOnly<TransactionRow>> = Array.from(matchByDigest.values());
    const txsWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      { txs }
    );
    for (const tx of txsWithIOs) {
      matchesInDb.set(tx.transaction.Hash, tx);
    }
  }

  const unseenNewTxs: Array<RemoteTransaction> = [];
  const txsAddedToBlock: Array<{|
    ...(CardanoByronTxIO | CardanoShelleyTxIO),
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
        ...(matchInDb: (CardanoByronTxIO | CardanoShelleyTxIO)),
        // override with updated
        block: result.block,
        transaction: result.transaction,
      });
    }
  }

  // 2) Add new transactions
  const { byronTxs, shelleyTxs, } = await networkTxToDbTx(
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
  for (const newTx of byronTxs) {
    const result = await deps.ModifyCardanoByronTx.addTxWithIOs(
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
  for (const newTx of shelleyTxs) {
    const result = await deps.ModifyCardanoShelleyTx.addTxWithIOs(
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
        certificates: result.certificates,
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
): Promise<{|
  byronTxs: Array<{|
    block: null | BlockInsert,
    transaction: (blockId: null | number) => TransactionInsert,
    ioGen: number => {|
      utxoInputs: Array<UtxoTransactionInputInsert>,
      utxoOutputs: Array<UtxoTransactionOutputInsert>,
    |},
  |}>,
  shelleyTxs: Array<{|
    block: null | BlockInsert,
    transaction: (blockId: null | number) => TransactionInsert,
    certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
    ioGen: number => {|
      utxoInputs: Array<UtxoTransactionInputInsert>,
      utxoOutputs: Array<UtxoTransactionOutputInsert>,
    |},
  |}>,
|}> {
  const allAddresses = Array.from(new Set(
    newTxs.flatMap(tx => [
      ...tx.inputs.map(input => input.address),
      ...tx.outputs.map(output => output.address),
      ...(tx.withdrawals
        ? tx.withdrawals.map(withdrawal => withdrawal.address)
        : []
      ),
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

  const byronTxs = [];
  const shelleyTxs = [];
  for (const networkTx of newTxs) {
    const { block, transaction } = networkTxHeaderToDb(
      networkTx,
      toAbsoluteSlotNumber,
      TransactionSeed,
      BlockSeed,
    );

    const ioGen = (txRowId) => {
      const utxoInputs = [];
      const utxoOutputs = [];
      for (let i = 0; i < networkTx.inputs.length; i++) {
        const input = networkTx.inputs[i];
        utxoInputs.push({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(input.address),
          ParentTxHash: input.txHash,
          IndexInParentTx: input.index,
          IndexInOwnTx: i,
          Amount: input.amount,
        });
      }
      for (let i = 0; i < networkTx.outputs.length; i++) {
        const output = networkTx.outputs[i];
        const txType = addressToKind(output.address, 'bytes', network);
        // consider a group address as a UTXO output
        // since the payment (UTXO) key is the one that signs
        if (
          txType === CoreAddressTypes.CARDANO_LEGACY ||
          txType === CoreAddressTypes.CARDANO_ENTERPRISE ||
          txType === CoreAddressTypes.CARDANO_BASE ||
          txType === CoreAddressTypes.CARDANO_PTR
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
          txType === CoreAddressTypes.CARDANO_REWARD
        ) {
          throw new Error(`${nameof(networkTxToDbTx)} cannot send to a reward address`);
        } else {
          // TODO: handle multisig
          throw new Error(`${nameof(networkTxToDbTx)} Unhandled output type`);
        }
      }

      return {
        utxoInputs,
        utxoOutputs,
      };
    };

    if (networkTx.type == null || networkTx.type === RemoteTransactionTypes.byron) {
      byronTxs.push({
        block,
        transaction,
        ioGen,
      });
    } else if (networkTx.type === RemoteTransactionTypes.shelley) {
      const certificates: $ReadOnlyArray<
        number => (void | AddCertificateRequest)
      > = networkTx.certificates == null
        ? [(_txId) => undefined]
        : await certificateToDb(
          db, dbTx,
          {
            certificates: networkTx.certificates,
            hashToIds,
            derivationTables,
            network: Number.parseInt(network.StaticConfig.NetworkId, 10)
          }
        );
      shelleyTxs.push({
        block,
        transaction,
        certificates,
        ioGen,
      });
    } else {
      throw new Error(`${nameof(networkTxToDbTx)} Unhandled tx type ${networkTx.type ?? ''}`);
    }
  }

  return {
    byronTxs,
    shelleyTxs,
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
      Type: TransactionType.CardanoByron,
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
    network: number,
    certificates: Array<RemoteCertificate>,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
  |},
): Promise<$ReadOnlyArray<number => AddCertificateRequest>> {
  const existingAddressesMap = await request.hashToIds({
    db,
    tx: dbTx,
    lockedTables: Array.from(request.derivationTables.values()),
    hashes: []
  });
  const addressToId = async (bytes: string): Promise<number> => {
    const idMap = await request.hashToIds({
      db,
      tx: dbTx,
      lockedTables: Array.from(request.derivationTables.values()),
      hashes: [bytes]
    });
    const id = idMap.get(bytes);
    if (id === undefined) {
      throw new Error(`${nameof(certificateToDb)} should never happen id === undefined`);
    }
    return id;
  };
  const tryGetKey = (stakeCredentials: RustModule.WalletV4.StakeCredential): void | number => {
    // an operator/owner key might belong to the wallet
    // however, these keys are plain ED25519 hashes
    // there there is no way of knowing what address it corresponds to
    // so we just try both and see if one of them matches
    // note: if there is no match, we don't add these addresses to the DB
    // since we don't know what address it would be
    // and in most cases, people generate these addresses through the CLI anyway
    {
      const rewardAddress = RustModule.WalletV4.RewardAddress.new(
        request.network,
        stakeCredentials
      );
      const addressId = existingAddressesMap.get(
        Buffer.from(rewardAddress.to_address().to_bytes()).toString('hex')
      );
      if (addressId != null) return addressId;
    }
    {
      const enterpriseAddress = RustModule.WalletV4.EnterpriseAddress.new(
        request.network,
        stakeCredentials
      );
      const addressId = existingAddressesMap.get(
        Buffer.from(enterpriseAddress.to_address().to_bytes()).toString('hex')
      );
      if (addressId != null) return addressId;
    }
    return undefined;
  };

  const result = [];
  for (let i = 0; i < request.certificates.length; i++) {
    const cert = request.certificates[i];
    switch (cert.type) {
      case ShelleyCertificateTypes.StakeRegistration: {
        const stakeCredentials = RustModule.WalletV4.StakeCredential.from_bytes(
          Buffer.from(cert.stake_credential, 'hex')
        );
        const certificate = RustModule.WalletV4.StakeRegistration.new(
          stakeCredentials
        );
        const address = RustModule.WalletV4.RewardAddress.new(
          request.network,
          stakeCredentials
        );
        const addrBytes = Buffer.from(address.to_address().to_bytes()).toString('hex');
        const addressId = await addressToId(addrBytes);
        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.StakeRegistration,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => [{
            CertificateId: certId,
            AddressId: addressId,
            Relation: CertificateRelation.SIGNER,
          }]
        }));
        break;
      }
      case ShelleyCertificateTypes.StakeDeregistration: {
        const stakeCredentials = RustModule.WalletV4.StakeCredential.from_bytes(
          Buffer.from(cert.stake_credential, 'hex')
        );
        const certificate = RustModule.WalletV4.StakeRegistration.new(
          stakeCredentials
        );
        const address = RustModule.WalletV4.RewardAddress.new(
          request.network,
          stakeCredentials
        );
        const addrBytes = Buffer.from(address.to_address().to_bytes()).toString('hex');
        const addressId = await addressToId(addrBytes);
        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.StakeDeregistration,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => [{
            CertificateId: certId,
            AddressId: addressId,
            Relation: CertificateRelation.SIGNER,
          }]
        }));
        break;
      }
      case ShelleyCertificateTypes.StakeDelegation: {
        const relatedAddressesInfo: Array<{|
          AddressId: number,
          Relation: CertificateRelationType,
        |}> = [];

        const stakeCredentials = RustModule.WalletV4.StakeCredential.from_bytes(
          Buffer.from(cert.stake_credential, 'hex')
        );
        const poolKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
          Buffer.from(cert.pool_keyhash, 'hex')
        );
        const certificate = RustModule.WalletV4.StakeDelegation.new(
          stakeCredentials,
          poolKeyHash
        );

        { // pool key
          const poolKeyId = tryGetKey(
            RustModule.WalletV4.StakeCredential.from_keyhash(poolKeyHash)
          );
          if (poolKeyId != null) {
            relatedAddressesInfo.push({
              AddressId: poolKeyId,
              Relation: CertificateRelation.POOL_KEY
            });
          }
        }

        { // delegator
          const address = RustModule.WalletV4.RewardAddress.new(
            request.network,
            stakeCredentials
          );

          const addrBytes = Buffer.from(address.to_address().to_bytes()).toString('hex');
          const addressId = await addressToId(addrBytes);
          relatedAddressesInfo.push({
            AddressId: addressId,
            Relation: CertificateRelation.SIGNER
          });
        }

        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.StakeDelegation,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => relatedAddressesInfo.map(info => ({
            ...info,
            CertificateId: certId,
          }))
        }));
        break;
      }
      case ShelleyCertificateTypes.PoolRegistration: {
        const relatedAddressesInfo: Array<{|
          AddressId: number,
          Relation: CertificateRelationType,
        |}> = [];

        const operatorKey = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
          Buffer.from(cert.pool_params.operator, 'hex')
        );
        { // operator
          const operatorId = tryGetKey(
            RustModule.WalletV4.StakeCredential.from_keyhash(operatorKey)
          );
          if (operatorId != null) {
            relatedAddressesInfo.push({
              AddressId: operatorId,
              Relation: CertificateRelation.OPERATOR
            });
          }
        }

        // reward_account
        const rewardAddress = RustModule.WalletV4.Address.from_bytes(
          Buffer.from(cert.pool_params.reward_account, 'hex')
        );
        {
          const addressId = await addressToId(cert.pool_params.reward_account);
          relatedAddressesInfo.push({
            AddressId: addressId,
            Relation: CertificateRelation.REWARD_ADDRESS
          });
        }
        const wasmRewardAddress = RustModule.WalletV4.RewardAddress.from_address(rewardAddress);
        if (wasmRewardAddress == null) throw new Error(`${nameof(certificateToDb)} registration address not a reward address`);

        // pool owners
        const owners = RustModule.WalletV4.Ed25519KeyHashes.new();
        for (let j = 0; j < cert.pool_params.pool_owners.length; j++) {
          const owner = cert.pool_params.pool_owners[j];
          const ownerKey = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
            Buffer.from(owner, 'hex')
          );
          owners.add(ownerKey);
          const ownerId = tryGetKey(
            RustModule.WalletV4.StakeCredential.from_keyhash(ownerKey)
          );
          if (ownerId != null) {
            relatedAddressesInfo.push({
              AddressId: ownerId,
              Relation: CertificateRelation.OWNER
            });
          }
        }

        const relays = RustModule.WalletV4.Relays.new();
        for (let j = 0; j < cert.pool_params.relays.length; j++) {
          relays.add(RustModule.WalletV4.Relay.from_bytes(
            Buffer.from(cert.pool_params.relays[i], 'hex')
          ));
        }

        const certificate = RustModule.WalletV4.PoolRegistration.new(
          RustModule.WalletV4.PoolParams.new(
            operatorKey,
            RustModule.WalletV4.VRFKeyHash.from_bytes(
              Buffer.from(cert.pool_params.vrf_keyhash, 'hex')
            ),
            RustModule.WalletV4.BigNum.from_str(cert.pool_params.pledge),
            RustModule.WalletV4.BigNum.from_str(cert.pool_params.cost),
            RustModule.WalletV4.UnitInterval.new(
              RustModule.WalletV4.BigNum.from_str(cert.pool_params.margin.numerator),
              RustModule.WalletV4.BigNum.from_str(cert.pool_params.margin.denominator),
            ),
            wasmRewardAddress,
            owners,
            relays,
            cert.pool_params.pool_metadata == null
              ? undefined
              : RustModule.WalletV4.PoolMetadata.new(
                cert.pool_params.pool_metadata.url,
                RustModule.WalletV4.MetadataHash.from_bytes(
                  Buffer.from(cert.pool_params.pool_metadata.metadata_hash, 'hex')
                )
              )
          )
        );

        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.PoolRegistration,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => relatedAddressesInfo.map(info => ({
            ...info,
            CertificateId: certId,
          }))
        }));
        break;
      }
      case ShelleyCertificateTypes.PoolRetirement: {
        const relatedAddressesInfo: Array<{|
          AddressId: number,
          Relation: CertificateRelationType,
        |}> = [];

        const poolKeyHash = RustModule.WalletV4.Ed25519KeyHash.from_bytes(
          Buffer.from(cert.pool_keyhash, 'hex')
        );
        const certificate = RustModule.WalletV4.PoolRetirement.new(
          poolKeyHash,
          cert.epoch
        );

        const poolKeyId = tryGetKey(
          RustModule.WalletV4.StakeCredential.from_keyhash(poolKeyHash)
        );
        if (poolKeyId != null) {
          relatedAddressesInfo.push({
            AddressId: poolKeyId,
            Relation: CertificateRelation.POOL_KEY
          });
        }

        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.PoolRetirement,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => relatedAddressesInfo.map(info => ({
            ...info,
            CertificateId: certId,
          }))
        }));
        break;
      }
      case ShelleyCertificateTypes.GenesisKeyDelegation: {
        const genesisKeyHash = RustModule.WalletV4.GenesisDelegateHash.from_bytes(
          Buffer.from(cert.genesis_delegate_hash, 'hex')
        );
        const certificate = RustModule.WalletV4.GenesisKeyDelegation.new(
          RustModule.WalletV4.GenesisHash.from_bytes(
            Buffer.from(cert.genesishash, 'hex')
          ),
          genesisKeyHash,
          RustModule.WalletV4.VRFKeyHash.from_bytes(
            Buffer.from(cert.vrf_keyhash, 'hex')
          ),
        );

        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.GenesisKeyDelegation,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => []
        }));
        break;
      }
      case ShelleyCertificateTypes.MoveInstantaneousRewardsCert: {
        const relatedAddressesInfo: Array<{|
          AddressId: number,
          Relation: CertificateRelationType,
        |}> = [];

        const certPot = RustModule.WalletV4.MoveInstantaneousReward.new(
          cert.pot
        );
        for (const key of Object.keys(cert.rewards)) {
          const stakeCredentials = RustModule.WalletV4.StakeCredential.from_bytes(
            Buffer.from(key, 'hex')
          );
          certPot.insert(
            stakeCredentials,
            RustModule.WalletV4.BigNum.from_str(cert.rewards[key])
          );
          const rewardAddrKey = tryGetKey(stakeCredentials);
          if (rewardAddrKey != null) {
            relatedAddressesInfo.push({
              AddressId: rewardAddrKey,
              Relation: CertificateRelation.REWARD_ADDRESS
            });
          }
        }
        const certificate = RustModule.WalletV4.MoveInstantaneousRewardsCert.new(certPot);
        result.push((txId: number) => ({
          certificate: {
            Kind: RustModule.WalletV4.CertificateKind.MoveInstantaneousRewardsCert,
            Payload: Buffer.from(certificate.to_bytes()).toString('hex'),
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => relatedAddressesInfo.map(info => ({
            ...info,
            CertificateId: certId,
          }))
        }));
        break;
      }
      default: throw new Error(`${nameof(certificateToDb)} unknown cert type ` + cert.type);
    }
  }
  return result;
}
