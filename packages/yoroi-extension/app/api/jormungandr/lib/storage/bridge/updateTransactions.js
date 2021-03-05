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
  JormungandrTransactionInsert,
  NetworkRow,
  DbBlock,
  TokenRow,
  TokenListInsert,
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
  GetToken,
  AssociateToken,
} from '../../../../ada/lib/storage/database/primitives/api/read';
import {
  ModifyAddress,
  ModifyTransaction,
  FreeBlocks,
  ModifyToken,
  ModifyTokenList,
} from '../../../../ada/lib/storage/database/primitives/api/write';
import type { AddCertificateRequest } from '../../../../ada/lib/storage/database/primitives/api/write';
import { ModifyJormungandrTx } from  '../../../../ada/lib/storage/database/transactionModels/multipart/api/write';
import { digestForHash, } from '../../../../ada/lib/storage/database/primitives/api/utils';
import {
  MarkUtxo,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/write';
import {
  GetUtxoTxOutputsWithTx,
  GetUtxoInputs,
  AssociateTxWithUtxoIOs,
  createTokenListIdGenFunction,
} from '../../../../ada/lib/storage/database/transactionModels/utxo/api/read';
import {
  AssociateTxWithAccountingIOs,
} from '../../../../ada/lib/storage/database/transactionModels/account/api/read';
import {
  JormungandrAssociateTxWithIOs
} from '../../../../ada/lib/storage/database/transactionModels/multipart/api/read';
import {
  InputTypes,
} from '../../state-fetch/types';
import type {
  UserAnnotation,
} from '../../../../ada/transactions/types';
import type {
  ToAbsoluteSlotNumberFunc,
} from '../../../../common/lib/storage/bridge/timeUtils';
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
  PRIMARY_ASSET_CONSTANTS,
} from '../../../../ada/lib/storage/database/primitives/enums';
import {
  asScanAddresses, asHasLevels, asGetAllUtxos, asGetAllAccounting,
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
import type { JormungandrTxIO } from '../../../../ada/lib/storage/database/transactionModels/multipart/tables';
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
import { CARDANO_STABLE_SIZE } from '../../../../../config/numbersConfig';
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
import { getFromUserPerspective, } from '../../../../ada/transactions/utils';
import type { AddressDiscriminationType, } from '@emurgo/js-chain-libs/js_chain_libs';
import { getJormungandrBaseConfig, } from '../../../../ada/lib/storage/database/prepackaged/networks';
import type {
  DefaultTokenEntry,
} from '../../../../common/lib/MultiToken';

async function rawGetAllTxIds(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
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
    ...(await deps.AssociateTxWithAccountingIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: accountingAddressIds },
    )),
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
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
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
  ...JormungandrTxIO,
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
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
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
  const txsWithIOs = await deps.JormungandrAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: txs.map(txWithBlock => txWithBlock.Transaction),
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
      ...txWithIO.accountingInputs.map(input => input.AddressId),
      ...txWithIO.accountingOutputs.map(output => output.AddressId),
      ...txWithIO.certificates.flatMap(
        cert => cert.relatedAddresses.map(relation => relation.AddressId)
      )
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
      tokens: tx.tokens,
      utxoInputs: tx.utxoInputs,
      utxoOutputs: tx.utxoOutputs,
      accountingInputs: tx.accountingInputs,
      accountingOutputs: tx.accountingOutputs,
      allOwnedAddressIds: new Set(
        Object.keys(addressIds).flatMap(key => addressIds[key])
      ),
      defaultToken: request.publicDeriver.getParent().getDefaultToken()
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
  ...JormungandrTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    JormungandrAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
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
          JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
          AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
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
  ...JormungandrTxIO,
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    JormungandrAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
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
          JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
          AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
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

export async function rawGetTokenListIds(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
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
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const fullTxs = await deps.GetTransaction.fromIds(
    db, dbTx,
    { ids: relatedIds.txIds }
  );

  const txsWithIOs = await deps.JormungandrAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs,
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );

  return Array.from(new Set(txsWithIOs
    .flatMap(txs => txs.tokens)
    .map(token => token.TokenList.ListId)));
}

export async function rawGetForeignAddresses(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
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
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
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

  const txsWithIOs = await deps.JormungandrAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs,
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );

  const allAddressIds = txsWithIOs.flatMap(txWithIO => [
    ...txWithIO.utxoInputs.map(input => input.AddressId),
    ...txWithIO.utxoOutputs.map(output => output.AddressId),
    ...txWithIO.accountingInputs.map(input => input.AddressId),
    ...txWithIO.accountingOutputs.map(output => output.AddressId),
    // note: we don't show other addresses in a certificate as unknown addresses
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
): Promise<Array<{|
  address: string,
  type: CoreAddressT,
|}>> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    JormungandrAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
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
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    DeleteAllTransactions: Class<DeleteAllTransactions>,
    GetTransaction: Class<GetTransaction>,
    ModifyAddress: Class<ModifyAddress>,
    FreeBlocks: Class<FreeBlocks>,
    ModifyTokenList: Class<ModifyTokenList>,
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
      JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
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
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const tokenListIds = await rawGetTokenListIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetTransaction: deps.GetTransaction,
    },
    derivationTables,
    request,
  );

  // WARNING: anything past this point can't assume txs exist in the DB
  // since we start removing stuff

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

  // 4) Remove token lists
  await deps.ModifyTokenList.remove(
    db, dbTx,
    tokenListIds
  );

  return relatedIds;
}

export async function removeAllTransactions(
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels>, |},
): ReturnType<typeof rawGetAllTxIds> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    JormungandrAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
    GetTransaction,
    FreeBlocks,
    ModifyTokenList,
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
      ModifyJormungandrTx,
      JormungandrAssociateTxWithIOs,
      AssociateTxWithAccountingIOs,
      AssociateTxWithUtxoIOs,
      GetKeyDerivation,
      ModifyToken,
      GetToken,
      AssociateToken,
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
      JormungandrAssociateTxWithIOs,
      AssociateTxWithAccountingIOs,
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
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
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
  const txIds = Array.from(new Set([
    ...(await deps.AssociateTxWithAccountingIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: accountingAddressIds },
    )),
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
    { txIds, height: bestInStorage.Block.Height - CARDANO_STABLE_SIZE }
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
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
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
    { txIds, height: bestInStorage.Block.Height - CARDANO_STABLE_SIZE }
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
    ModifyJormungandrTx: Class<ModifyJormungandrTx>,
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    GetKeyDerivation: Class<GetKeyDerivation>,
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
    AssociateToken: Class<AssociateToken>,
  |},
  publicDeriver: IPublicDeriver<>,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  checkAddressesInUse: FilterFunc,
  getTransactionsHistoryForAddresses: HistoryFunc,
  getBestBlock: BestBlockFunc,
  derivationTables: Map<number, string>,
): Promise<void> {
  // TODO: consider passing this function in as an argument instead of generating it here
  const toAbsoluteSlotNumber = await genToAbsoluteSlotNumber(
    getJormungandrBaseConfig(publicDeriver.getParent().getNetworkInfo())
  );
  // 1) Check if backend is synced (avoid rollbacks if backend has to resync from block 1)

  const { BackendService } = publicDeriver.getParent().getNetworkInfo().Backend;
  if (BackendService == null) throw new Error(`${nameof(rawUpdateTransactions)} missing backend url`);
  const bestBlock = await getBestBlock({
    network: publicDeriver.getParent().getNetworkInfo(),
  });
  if (lastSyncInfo.SlotNum !== null) {
    const lastBlockSeen = lastSyncInfo.Height;
    const inRemote = (bestBlock.height != null ? bestBlock.height : 0);
    // if we're K blocks ahead of remote
    if (lastBlockSeen - inRemote > CARDANO_STABLE_SIZE) {
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
      ...(await deps.AssociateTxWithAccountingIOs.getTxIdsForAddresses(
        db, dbTx, { addressIds: accountingAddressIds },
      )),
      ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
        db, dbTx, { addressIds: utxoAddressIds },
      )),
    ]));
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
      network: publicDeriver.getParent().getNetworkInfo(),
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
        JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
        GetEncryptionMeta: deps.GetEncryptionMeta,
        GetTransaction: deps.GetTransaction,
        GetUtxoInputs: deps.GetUtxoInputs,
        ModifyTransaction: deps.ModifyTransaction,
        ModifyJormungandrTx: deps.ModifyJormungandrTx,
        ModifyToken: deps.ModifyToken,
        GetToken: deps.GetToken,
        AssociateToken: deps.AssociateToken,
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
        defaultToken: publicDeriver.getParent().getDefaultToken(),
        toAbsoluteSlotNumber,
        derivationTables,
      }
    );
  }

  // 5) update last sync
  const slotInRemote = (bestBlock.epoch == null || bestBlock.slot == null)
    ? null
    : toAbsoluteSlotNumber({
      epoch: bestBlock.epoch,
      slot: bestBlock.slot,
    });

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
async function updateTransactionBatch(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    MarkUtxo: Class<MarkUtxo>,
    JormungandrAssociateTxWithIOs: Class<JormungandrAssociateTxWithIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyJormungandrTx: Class<ModifyJormungandrTx>,
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
    AssociateToken: Class<AssociateToken>,
  |},
  request: {|
    network: $ReadOnly<NetworkRow>,
    toAbsoluteSlotNumber: ToAbsoluteSlotNumberFunc,
    txIds: Array<number>,
    txsFromNetwork: Array<RemoteTransaction>,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
    defaultToken: DefaultTokenEntry,
  |}
): Promise<Array<{|
  ...JormungandrTxIO,
  ...DbBlock,
|}>> {
  const { TransactionSeed, BlockSeed } = await deps.GetEncryptionMeta.get(db, dbTx);

  const matchesInDb = new Map<string, JormungandrTxIO>();
  {
    const digestsForNew = request.txsFromNetwork.map(tx => digestForHash(tx.hash, TransactionSeed));
    const matchByDigest = await deps.GetTransaction.byDigest(db, dbTx, {
      digests: digestsForNew,
      txIds: request.txIds,
    });
    const txs: Array<$ReadOnly<TransactionRow>> = Array.from(matchByDigest.values());
    const txsWithIOs = await deps.JormungandrAssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      {
        txs,
        networkId: request.network.NetworkId,
      }
    );
    for (const tx of txsWithIOs) {
      matchesInDb.set(tx.transaction.Hash, tx);
    }
  }

  const unseenNewTxs: Array<RemoteTransaction> = [];
  const txsAddedToBlock: Array<{|
    ...JormungandrTxIO,
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
        ...matchInDb,
        // override with updated
        block: result.block,
        transaction: result.transaction,
      });
    }
  }

  // 2) Add any new assets & lookup known ones
  const assetLookup = await genJormungandrAssetMap(
    db, dbTx,
    {
      ModifyToken: deps.ModifyToken,
      GetToken: deps.GetToken,
    },
    unseenNewTxs,
    // request.getAssetInfo,
    request.network,
    request.defaultToken,
  );

  // 3) Add new transactions
  const genNextTokenListId = await createTokenListIdGenFunction(
    db, dbTx,
    { AssociateToken: deps.AssociateToken }
  );
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
    assetLookup,
    genNextTokenListId,
  );
  const newsTxsIdSet = new Set();
  for (const newTx of newTxsForDb) {
    const result = await deps.ModifyJormungandrTx.addTxWithIOs(
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
        accountingInputs: result.accountingInputs,
        accountingOutputs: result.accountingOutputs,
        tokens: result.tokens,
      });
    }
  }

  // 4) Update UTXO set

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
      networkId: request.network.NetworkId,
    }
  );

  // 5) Mark any pending tx that is not found by remote as failed

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


async function genJormungandrAssetMap(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
  |},
  newTxs: Array<RemoteTransaction>,
  // getAssetInfo: AssetInfoFunc,
  network: $ReadOnly<NetworkRow>,
  defaultToken: DefaultTokenEntry,
): Promise<Map<string, $ReadOnly<TokenRow>>> {
  const tokenIds = Array.from(new Set(newTxs.flatMap(_tx => [
    // ...tx.inputs
    //   .flatMap(input => input.assets)
    //   .map(asset => asset.tokenId),
    // ...tx.outputs
    //   .flatMap(output => output.assets)
    //   .map(asset => asset.tokenId),
    // force inclusion of primary token for chain
    defaultToken.defaultIdentifier
  ])));

  const existingDbRows = (await deps.GetToken.fromIdentifier(
    db, dbTx,
    tokenIds
  )).filter(row => row.NetworkId === network.NetworkId);

  const result = new Map<string, $ReadOnly<TokenRow>>();
  existingDbRows.forEach(row => result.set(row.Identifier, row));

  return result;
}

function genJormungandrIOGen(
  networkTx: RemoteTransaction,
  getIdOrThrow: string => number,
  network: $ReadOnly<NetworkRow>,
  getAssetInfoOrThrow: string => $ReadOnly<TokenRow>,
  genNextTokenListId: void => number,
): (number => {|
  utxoInputs: Array<UtxoTransactionInputInsert>,
  utxoOutputs: Array<UtxoTransactionOutputInsert>,
  accountingInputs: Array<AccountingTransactionInputInsert>,
  accountingOutputs: Array<AccountingTransactionOutputInsert>,
  tokenList: Array<{|
    TokenList: TokenListInsert,
    identifier: string,
    networkId: number,
  |}>,
|}) {
  return (txRowId) => {
    const utxoInputs = [];
    const utxoOutputs = [];
    const accountingInputs = [];
    const accountingOutputs = [];
    const tokenList = [];
    for (let i = 0; i < networkTx.inputs.length; i++) {
      const input = networkTx.inputs[i];

      const listId = genNextTokenListId();
      tokenList.push({
        TokenList: {
          Amount: input.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Jormungandr).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
        networkId: network.NetworkId,
      });
      if (input.type === InputTypes.utxo || input.type === InputTypes.legacyUtxo) {
        utxoInputs.push({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(input.address),
          ParentTxHash: input.txHash,
          IndexInParentTx: input.index,
          IndexInOwnTx: i,
          TokenListId: listId,
        });
      } else if (input.type === InputTypes.account) {
        accountingInputs.push({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(input.address),
          SpendingCounter: input.spendingCounter,
          IndexInOwnTx: i,
          TokenListId: listId,
        });
      } else {
        throw new Error(`${nameof(networkTxToDbTx)} Unhandled input type`);
      }
    }
    for (let i = 0; i < networkTx.outputs.length; i++) {
      const output = networkTx.outputs[i];
      const outputType = addressToKind(output.address, 'bytes', network);

      const listId = genNextTokenListId();
      tokenList.push({
        TokenList: {
          Amount: output.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Jormungandr).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Jormungandr,
        networkId: network.NetworkId,
      });
      // consider a group address as a UTXO output
      // since the payment (UTXO) key is the one that signs
      if (
        outputType === CoreAddressTypes.CARDANO_LEGACY ||
        outputType === CoreAddressTypes.JORMUNGANDR_SINGLE ||
        outputType === CoreAddressTypes.JORMUNGANDR_GROUP
      ) {
        utxoOutputs.push({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(output.address),
          OutputIndex: i,
          TokenListId: listId,
          /**
            * we assume unspent for now but it will be updated after if necessary
            * Note: if this output doesn't belong to you, it will be true forever
            * This is slightly misleading, but using null would require null-checks everywhere
            */
          IsUnspent: true,
          ErgoBoxId: null,
          ErgoCreationHeight: null,
          ErgoTree: null,
          ErgoRegisters: null,
        });
      } else if (
        outputType === CoreAddressTypes.JORMUNGANDR_ACCOUNT
      ) {
        accountingOutputs.push({
          TransactionId: txRowId,
          AddressId: getIdOrThrow(output.address),
          OutputIndex: i,
          TokenListId: listId,
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
      tokenList,
    };
  };
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
  assetLookup: Map<string, $ReadOnly<TokenRow>>,
  genNextTokenListId: void => number,
): Promise<Array<{|
  block: null | BlockInsert,
  transaction: (blockId: null | number) => TransactionInsert,
  certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
  ioGen: ReturnType<typeof genJormungandrIOGen>,
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
  const getAssetInfoOrThrow = (hash: string): $ReadOnly<TokenRow> => {
    // recall: we already added all needed tokens to the DB before we get here
    const id = assetLookup.get(hash);
    if (id === undefined) {
      throw new Error(`${nameof(networkTxToDbTx)} should never happen -- asset missing`);
    }
    return id;
  };

  const config = getJormungandrBaseConfig(
    network
  ).reduce((acc, next) => Object.assign(acc, next), {});

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
          discriminant: config.Discriminant,
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
      ioGen: genJormungandrIOGen(
        networkTx,
        getIdOrThrow,
        network,
        getAssetInfoOrThrow,
        genNextTokenListId
      ),
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
    networkId: number,
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
        networkId: request.networkId,
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
      Type: TransactionType.Jormungandr,
      Hash: tx.hash,
      Digest: digest,
      BlockId: blockId,
      Ordinal: tx.tx_ordinal,
      LastUpdateTime: block == null || tx.time == null
        ? new Date(tx.last_update).getTime() // this is out best guess for txs not in a block
        : new Date(tx.time).getTime(),
      Status: statusStringToCode(tx.tx_state),
      ErrorMessage: null, // TODO: add error message from backend if present
      Extra: null,
    }: JormungandrTransactionInsert),
  };
}

async function certificateToDb(
  db: lf$Database,
  dbTx: lf$Transaction,
  request: {|
    discriminant: AddressDiscriminationType,
    certificate: RemoteCertificate,
    hashToIds: HashToIdsFunc,
    derivationTables: Map<number, string>,
    firstInput: RemoteTransactionInput,
  |},
): Promise<number => AddCertificateRequest> {
  const accountToId = async (account: RustModule.WalletV3.Account): Promise<number> => {
    const address = account.to_address(
      request.discriminant,
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
          Ordinal: 0, // only one cert per tx in Jormungandr
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
          Ordinal: 0, // only one cert per tx in Jormungandr
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
          Ordinal: 0, // only one cert per tx in Jormungandr
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
          Ordinal: 0, // only one cert per tx in Jormungandr
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
          Ordinal: 0, // only one cert per tx in Jormungandr
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
