// @flow

import BigNumber from 'bignumber.js';
import { isEqual } from 'lodash';
import ObjectHash from 'object-hash';
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
  CardanoByronTransactionInsert,
  CardanoShelleyTransactionInsert,
  NetworkRow,
  DbBlock,
  AddressRow,
  TokenRow,
  TokenListInsert,
  CardanoAssetMintMetadata,
} from '../database/primitives/tables';
import {
  TransactionType,
} from '../database/primitives/tables';
import type {
  TxStatusCodesType,
  CertificateRelationType,
  CoreAddressT,
} from '../database/primitives/enums';
import {
  GetAddress,
  GetBlock,
  GetEncryptionMeta,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetTransaction,
  GetTxAndBlock,
  GetCertificates,
  GetKeyDerivation,
  GetToken,
  AssociateToken,
} from '../database/primitives/api/read';
import {
  ModifyAddress,
  ModifyTransaction,
  FreeBlocks,
  ModifyToken,
  ModifyTokenList,
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
  createTokenListIdGenFunction,
} from '../database/transactionModels/utxo/api/read';
import {
  AssociateTxWithAccountingIOs,
} from '../database/transactionModels/account/api/read';
import {
  CardanoByronAssociateTxWithIOs, CardanoShelleyAssociateTxWithIOs,
} from '../database/transactionModels/multipart/api/read';
import type {
  UserAnnotation,
} from '../../../transactions/types';
import type {
  UtxoTransactionInputInsert, UtxoTransactionOutputInsert,
} from '../database/transactionModels/utxo/tables';
import type {
  AccountingTransactionInputInsert,
} from '../database/transactionModels/account/tables';
import {
  TxStatusCodes,
  CoreAddressTypes,
  CertificateRelation,
  PRIMARY_ASSET_CONSTANTS,
} from '../database/primitives/enums';
import {
  asScanAddresses, asHasLevels, asGetAllUtxos,
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
import { getCardanoHaskellBaseConfig, } from '../database/prepackaged/networks';
import {
  ModifyLastSyncInfo,
  DeleteAllTransactions,
} from '../database/walletTypes/core/api/write';
import type { LastSyncInfoRow, } from '../database/walletTypes/core/tables';
import type { CardanoByronTxIO, CardanoShelleyTxIO } from '../database/transactionModels/multipart/tables';
import {
  rawGetAddressRowsForWallet,
} from  './traitUtils';
import TimeUtils from './timeUtils';
import {
  rawGenHashToIdsFunc, rawGenFindOwnAddress,
} from '../../../../common/lib/storage/bridge/hashMapper';
import type {
  HashToIdsFunc, FindOwnAddressFunc,
} from '../../../../common/lib/storage/bridge/hashMapper';
import { CARDANO_STABLE_SIZE } from '../../../../../config/numbersConfig';
import { RollbackApiError } from '../../../../common/errors';
import { getFromUserPerspective, identifierToCardanoAsset, } from '../../../transactions/utils';

import type {
  BestBlockFunc,
  RemoteTxState,
  RemoteTransaction,
  RemoteCertificate,
  TokenInfoFunc,
  MultiAssetMintMetadataFunc,
  GetRecentTransactionHashesFunc,
  GetTransactionsByHashesFunc,
  MultiAssetSupplyFunc,
  MultiAssetMintMetadataResponse,
  MultiAssetSupplyResponse,
  TxSummary,
  HistoryFunc, FilterFunc,
} from '../../state-fetch/types';
import {
  ShelleyCertificateTypes,
  RemoteTransactionTypes,
} from '../../state-fetch/types';
import { addressToKind, } from './utils';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { Bech32Prefix } from '../../../../../config/stringConfig';
import type {
  DefaultTokenEntry,
} from '../../../../common/lib/MultiToken';
import { UtxoStorageApi } from '../models/utils';
import { bytesToHex, createFilterUniqueBy, hexToBytes, listValues } from '../../../../../coreUtils';
import type { RelativeSlot } from './timeUtils';

type TxData = {|
  addressLookupMap: Map<number, string>,
  txs: Array<{|
    ...(CardanoByronTxIO | CardanoShelleyTxIO),
    ...WithNullableFields<DbBlock>,
    ...UserAnnotation,
  |}>,
|};

async function rawGetAllTxIds(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetCertificates: Class<GetCertificates>,
  |},
  request: {| publicDeriver: IPublicDeriver<ConceptualWallet>, |},
  derivationTables: Map<number, string>,
): Promise<{|
  txIds: Array<number>,
  addresses: {|
    utxoAddresses: Array<$ReadOnly<AddressRow>>,
    accountingAddresses: Array<$ReadOnly<AddressRow>>,
  |}
|}> {
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
    request,
    derivationTables,
  );

  const utxoAddressIds = utxoAddresses.map(row => row.address.AddressId);
  const accountingAddressIds = accountingAddresses.map(row => row.address.AddressId);

  const certificateTransactions = await deps.GetCertificates.forAddress(db, dbTx, {
    addressIds: [
      ...accountingAddressIds,
      ...utxoAddressIds,
    ],
  });

  const txIds = Array.from(new Set([
    ...(await deps.AssociateTxWithAccountingIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: accountingAddressIds },
    )),
    ...(await deps.AssociateTxWithUtxoIOs.getTxIdsForAddresses(
      db, dbTx, { addressIds: utxoAddressIds },
    )),
    ...certificateTransactions.map(certTx => certTx.transaction.TransactionId),
  ]));
  return {
    txIds,
    addresses: {
      utxoAddresses: utxoAddresses.map(a => a.address),
      accountingAddresses: accountingAddresses.map(a => a.address),
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
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetTxAndBlock: Class<GetTxAndBlock>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetCertificates: Class<GetCertificates>,
  |},
  request: {
    publicDeriver: IPublicDeriver<ConceptualWallet>,
    getTxAndBlock: (txIds: Array<number>) => Promise<$ReadOnlyArray<{|
      Block: null | $ReadOnly<BlockRow>,
      Transaction: $ReadOnly<TransactionRow>,
    |}>>,
    ...
  },
  derivationTables: Map<number, string>,
): Promise<{|
  addressLookupMap: Map<number, string>,
  txs: Array<{|
  ...(CardanoByronTxIO | CardanoShelleyTxIO),
  ...WithNullableFields<DbBlock>,
  ...UserAnnotation,
|}>,
|}> {
  const { publicDeriver } = request;
  const {
    addresses,
    txIds,
  } = await rawGetAllTxIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetCertificates: deps.GetCertificates,
    },
    { publicDeriver },
    derivationTables,
  );
  const blockMap = new Map<number, null | $ReadOnly<BlockRow>>();
  const txs = await request.getTxAndBlock(txIds);
  for (const tx of txs) {
    blockMap.set(tx.Transaction.TransactionId, tx.Block);
  }
  const byronWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: txs
        .map(txWithBlock => txWithBlock.Transaction)
        .filter(tx => tx.Type === TransactionType.CardanoByron),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const shelleyWithIOs = await deps.CardanoShelleyAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: txs
        .map(txWithBlock => txWithBlock.Transaction)
        .filter(tx => tx.Type === TransactionType.CardanoShelley),
      networkId: publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const txsWithIOs = [
    ...byronWithIOs,
    ...shelleyWithIOs,
  ];

  // we need to build a lookup map of AddressId => Hash
  // note: some inputs or outputs may not belong to us
  // so we can't build this map from previously calculated information
  const addressLookupMap = new Map<number, string>();
  {
    const allAddressIds = txsWithIOs.flatMap(txWithIO => [
      ...txWithIO.utxoInputs.map(input => input.AddressId),
      ...txWithIO.utxoOutputs.map(output => output.AddressId),
      ...(txWithIO.accountingInputs == null
        ? []
        : txWithIO.accountingInputs.map(output => output.AddressId)
      ),
      ...(txWithIO.certificates == null
        ? []
        : txWithIO.certificates.flatMap(
          cert => cert.relatedAddresses.map(relation => relation.AddressId)
        )
      ),
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

  const defaultToken = publicDeriver.getParent().getDefaultToken();

  const result = txsWithIOs.map((tx: CardanoByronTxIO | CardanoShelleyTxIO) => ({
    ...tx,
    block: blockMap.get(tx.transaction.TransactionId) || null,
    ...getFromUserPerspective({
      tokens: tx.tokens,
      utxoInputs: tx.utxoInputs,
      utxoOutputs: tx.utxoOutputs,
      accountingInputs: tx.accountingInputs == null ? undefined : tx.accountingInputs,
      allOwnedAddressIds: new Set(
        Object.keys(addresses).flatMap(key => addresses[key]).map(addrRow => addrRow.AddressId)
      ),
      /**
        * Note: we don't consider certificate refunds as belonging to you.
        * Rationale:
        * 1) It's very unclear who the refund "belongs to" in the case of a pool registration.
        *    Does it belong to the owner? Operators? Some weird split?
        *    Better to just say it's just bonus ADA to whoever gets it in the tx outputs
        * 2) For stake deregistration, it's tempting to say it belongs to the owner of the stake key
        *    But the protocol allows other people to pay to register your staking key
        *    (no staking key witness required for registration)
        *    So that wouldn't be quite accurate either.
        *    Again, it's easier to say it's just whoever gets it
      */
      ownImplicitInput: publicDeriver.getParent().getDefaultMultiToken(),
      ownImplicitOutput: (() => {
        if (tx.txType === TransactionType.CardanoShelley) {
          const implicitOutputSum = publicDeriver.getParent().getDefaultMultiToken();
          for (const cert of tx.certificates) {
            if (
              cert.certificate.Kind !==
              RustModule.WalletV4.CertificateKind.MoveInstantaneousRewardsCert
            ) {
              continue;
            }

            RustModule.WasmScope(Module => {
              const mir = Module.WalletV4.MoveInstantaneousRewardsCert.from_hex(cert.certificate.Payload)
                .move_instantaneous_reward().as_to_stake_creds();

              for (const relatedAddr of cert.relatedAddresses) {
                // recall: length of this list is usually just 1
                for (const addr of addresses.accountingAddresses) {
                  if (relatedAddr.AddressId === addr.AddressId) {
                    // this address got some rewards inside the cert
                    const rewardAddr = Module.WalletV4.RewardAddress.from_address(
                      Module.WalletV4.Address.from_hex(addr.Hash)
                    );
                    if (rewardAddr == null) continue; // should never happen
                    const rewardAmount = mir?.get(rewardAddr.payment_cred());
                    // happens if the MIR is to another pot
                    if (rewardAmount == null) continue;
                    const isPositive = rewardAmount.is_positive();
                    const rewardAmountBigInt = isPositive
                      ? rewardAmount.as_positive()
                      : rewardAmount.as_negative();
                    if (rewardAmountBigInt == null) continue;
                    const rewardAmountStr =
                      (isPositive ? '' : '-') + rewardAmountBigInt.to_str();
                    implicitOutputSum.add({
                      identifier: defaultToken.defaultIdentifier,
                      networkId: defaultToken.defaultNetworkId,
                      amount: new BigNumber(rewardAmountStr),
                    });
                  }
                }
              }
            });
          }
          return implicitOutputSum;
        }
        return publicDeriver.getParent().getDefaultMultiToken();
      })(),
      defaultToken,
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
): Promise<TxData> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    CardanoByronAssociateTxWithIOs,
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    AssociateTxWithAccountingIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
    GetCertificates,
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
          CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
          CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
          GetCertificates: deps.GetCertificates,
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
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    AssociateTxWithAccountingIOs,
    GetTxAndBlock,
    GetDerivationSpecific,
    GetCertificates,
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
          CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
          CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
          AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
          AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
          GetTxAndBlock: deps.GetTxAndBlock,
          GetDerivationSpecific: deps.GetDerivationSpecific,
          GetCertificates: deps.GetCertificates,
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetTransaction: Class<GetTransaction>,
    GetCertificates: Class<GetCertificates>,
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
      GetCertificates: deps.GetCertificates,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const fullTxs = await deps.GetTransaction.fromIds(
    db, dbTx,
    { ids: relatedIds.txIds }
  );

  const byronWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs.filter(tx => tx.Type === TransactionType.CardanoByron),
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const shelleyWithIOs = await deps.CardanoShelleyAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs.filter(tx => tx.Type === TransactionType.CardanoShelley),
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const txsWithIOs = [
    ...byronWithIOs,
    ...shelleyWithIOs,
  ];

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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetTransaction: Class<GetTransaction>,
    GetCertificates: Class<GetCertificates>,
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
      GetCertificates: deps.GetCertificates,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const fullTxs = await deps.GetTransaction.fromIds(
    db, dbTx,
    { ids: relatedIds.txIds }
  );

  const byronWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs.filter(tx => tx.Type === TransactionType.CardanoByron),
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const shelleyWithIOs = await deps.CardanoShelleyAssociateTxWithIOs.getIOsForTx(
    db, dbTx,
    {
      txs: fullTxs.filter(tx => tx.Type === TransactionType.CardanoShelley),
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
    }
  );
  const txsWithIOs = [
    ...byronWithIOs,
    ...shelleyWithIOs,
  ];

  const allAddressIds = txsWithIOs.flatMap(txWithIO => [
    ...txWithIO.utxoInputs.map(input => input.AddressId),
    ...txWithIO.utxoOutputs.map(output => output.AddressId),
    ...(txWithIO.accountingInputs == null
      ? []
      : txWithIO.accountingInputs.map(input => input.AddressId)
    ),
    // note: we don't show other addresses in a certificate as unknown addresses
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
    CardanoByronAssociateTxWithIOs,
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    AssociateTxWithAccountingIOs,
    GetDerivationSpecific,
    GetTransaction,
    GetCertificates,
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    DeleteAllTransactions: Class<DeleteAllTransactions>,
    GetTransaction: Class<GetTransaction>,
    ModifyAddress: Class<ModifyAddress>,
    FreeBlocks: Class<FreeBlocks>,
    GetCertificates: Class<GetCertificates>,
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
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
      CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetTransaction: deps.GetTransaction,
      GetCertificates: deps.GetCertificates,
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
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetCertificates: deps.GetCertificates,
    },
    { publicDeriver: request.publicDeriver },
    derivationTables,
  );

  const tokenListIds = await rawGetTokenListIds(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
      CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetTransaction: deps.GetTransaction,
      GetCertificates: deps.GetCertificates,
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
    tokenListIds,
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
    CardanoByronAssociateTxWithIOs,
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithUtxoIOs,
    AssociateTxWithAccountingIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
    GetTransaction,
    FreeBlocks,
    GetCertificates,
    ModifyTokenList,
  });
  const db = request.publicDeriver.getDb();
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const updateUtxoTables = Object
    .keys(UtxoStorageApi.depsTables)
    .map(key => UtxoStorageApi.depsTables[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii<PromisslessReturnType<typeof removeAllTransactions>>(
    db,
    [
      // need a lock on all tables to delete
      ...db.getSchema().tables(),
      ...depTables,
      ...mapToTables(db, derivationTables),
      ...updateUtxoTables,
    ],
    async dbTx => {
      await UtxoStorageApi.depsTables.ModifyUtxoAtSafePoint.remove(
        db, dbTx,
        request.publicDeriver.getPublicDeriverId(),
      );
      await UtxoStorageApi.depsTables.ModifyUtxoDiffToBestBlock.removeAll(
        db, dbTx,
        request.publicDeriver.getPublicDeriverId(),
      );
      return rawRemoveAllTransactions(
        db, dbTx,
        deps,
        request.publicDeriver.getParent().getDerivationTables(),
        { publicDeriver: request.publicDeriver },
      );
    }
  );
}

export async function updateUtxos(
  db: lf$Database,
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  checkAddressesInUse: FilterFunc,
  getTokenInfo: TokenInfoFunc,
  getMultiAssetMintMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
): Promise<void> {
  const withLevels = asHasLevels<ConceptualWallet>(publicDeriver);
  const derivationTables = withLevels == null
    ? new Map<number, string>()
    : withLevels.getParent().getDerivationTables();

  // sync our address set with remote to make sure txs are identified as ours
  const scanAddrTables = Object.freeze({
    GetKeyForPublicDeriver,
    GetAddress,
    GetPathWithSpecific,
    GetUtxoTxOutputsWithTx,
    ModifyAddress,
    GetPublicDeriver,
    AddDerivationTree,
    ModifyDisplayCutoff,
    GetDerivationsByPath,
    GetDerivationSpecific,
    GetKeyDerivation,
  });

  await raii(
    db,
    [
      ...Object.keys(scanAddrTables).map(key => scanAddrTables[key])
        .flatMap(table => getAllSchemaTables(db, table)),
      ...mapToTables(db, derivationTables),
    ],
    async dbTx => {
      const canScan = asScanAddresses(publicDeriver);
      if (canScan != null) {
        await canScan.rawScanAddresses(
          dbTx,
          {
            GetKeyForPublicDeriver: scanAddrTables.GetKeyForPublicDeriver,
            GetAddress: scanAddrTables.GetAddress,
            GetPathWithSpecific: scanAddrTables.GetPathWithSpecific,
            GetUtxoTxOutputsWithTx: scanAddrTables.GetUtxoTxOutputsWithTx,
            ModifyAddress: scanAddrTables.ModifyAddress,
            GetPublicDeriver: scanAddrTables.GetPublicDeriver,
            AddDerivationTree: scanAddrTables.AddDerivationTree,
            ModifyDisplayCutoff: scanAddrTables.ModifyDisplayCutoff,
            GetDerivationsByPath: scanAddrTables.GetDerivationsByPath,
            GetDerivationSpecific: scanAddrTables.GetDerivationSpecific,
            GetKeyDerivation: scanAddrTables.GetKeyDerivation,
          },
          // TODO: race condition because we don't pass in best block here
          { checkAddressesInUse },
          derivationTables,
        );
      }
    }
  );

  // have Yoroi-lib update
  const getAddrTables = Object.freeze({
    GetPathWithSpecific,
    GetAddress,
    GetDerivationSpecific,
  });

  await raii(
    db,
    [
      ...Object.keys(UtxoStorageApi.depsTables).map(key => UtxoStorageApi.depsTables[key])
        .flatMap(table => getAllSchemaTables(db, table)),
      ...Object.keys(getAddrTables).map(key => getAddrTables[key])
        .flatMap(table => getAllSchemaTables(db, table)),
    ],
    async dbTx => {
      await rawUpdateUtxos(
        db, dbTx,
        publicDeriver,
        getAddrTables,
        derivationTables,
      );
    }
  );

  // new UTXOs may contain new tokens so update token info
  const withUtxos = asGetAllUtxos(publicDeriver);
  if (withUtxos == null) {
    throw new Error('wallet doesn\'t support IGetAllUtxos');
  }
  const utxos = await withUtxos.getAllUtxos();
  const tokenIds = utxos.flatMap(utxo => utxo.output.tokens.map(token => token.Token.Identifier));
  const updateTokenTables =  Object.freeze({
    ModifyToken,
    GetToken,
  });

  await raii(
    db,
    Object
      .keys(updateTokenTables)
      .map(key => updateTokenTables[key])
      .flatMap(table => getAllSchemaTables(db, table)),
    dbTx => (
      genCardanoAssetMap(
        db,
        dbTx,
        updateTokenTables,
        tokenIds,
        getTokenInfo,
        getMultiAssetMintMetadata,
        getMultiAssetSupply,
        publicDeriver.getParent().getNetworkInfo(),
      )
    )
  );
}

export type ReferenceTx = {|
  blockHash: string,
  txHash: ?string,
|};

export async function updateTransactions(
  db: lf$Database,
  publicDeriver: IPublicDeriver<ConceptualWallet>,
  checkAddressesInUse: FilterFunc,
  getTransactionHistory: HistoryFunc,
  getRecentTransactionHashes: GetRecentTransactionHashesFunc,
  getTransactionsByHashes: GetTransactionsByHashesFunc,
  getBestBlock: BestBlockFunc,
  getTokenInfo: TokenInfoFunc,
  getMultiAssetMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
  after?: ?ReferenceTx,
  before?: ?ReferenceTx,
): Promise<TxData> {
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
      CardanoShelleyAssociateTxWithIOs,
      AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs,
      GetCertificates,
      GetKeyDerivation,
      ModifyToken,
      GetToken,
      AssociateToken,
      DeleteAllTransactions,
    });
    const updateTables = Object
      .keys(updateDepTables)
      .map(key => updateDepTables[key])
      .flatMap(table => getAllSchemaTables(db, table));

    return await raii(
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
        return await rawUpdateTransactions(
          db, dbTx,
          remainingDeps,
          publicDeriver,
          lastSyncInfo,
          getTransactionHistory,
          getRecentTransactionHashes,
          getTransactionsByHashes,
          getBestBlock,
          derivationTables,
          getTokenInfo,
          getMultiAssetMetadata,
          getMultiAssetSupply,
          after,
          before,
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
      AssociateTxWithAccountingIOs,
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
    return {
      addressLookupMap: new Map(),
      txs: [],
    };
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
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
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
  const utxoAddressIds = utxoAddresses.map(a => a.address.AddressId);
  const accountingAddressIds = accountingAddresses.map(a => a.address.AddressId);
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

  // note: we don't need to mark our own outputs as unspent. Only inputs we depended upon
  // this is because there are two cases
  // 1) Our outputs are already marked as "unspent" so nothing is required
  // 2) Our outputs were spent but the tx that spent it also got rolled back & marked us as unspent
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
    ModifyCardanoByronTx: Class<ModifyCardanoByronTx>,
    ModifyCardanoShelleyTx: Class<ModifyCardanoShelleyTx>,
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    AssociateTxWithUtxoIOs: Class<AssociateTxWithUtxoIOs>,
    AssociateTxWithAccountingIOs: Class<AssociateTxWithAccountingIOs>,
    GetCertificates: Class<GetCertificates>,
    GetKeyDerivation: Class<GetKeyDerivation>,
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
    AssociateToken: Class<AssociateToken>,
    DeleteAllTransactions: Class<DeleteAllTransactions>,
  |},
  publicDeriver: IPublicDeriver<>,
  lastSyncInfo: $ReadOnly<LastSyncInfoRow>,
  getTransactionHistory: HistoryFunc,
  getRecentTransactionHashes: GetRecentTransactionHashesFunc,
  getTransactionsByHashes: GetTransactionsByHashesFunc,
  getBestBlock: BestBlockFunc,
  derivationTables: Map<number, string>,
  getTokenInfo: TokenInfoFunc,
  getMultiAssetMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
  after: ?ReferenceTx,
  before: ?ReferenceTx,
): Promise<TxData> {
  const network = publicDeriver.getParent().getNetworkInfo();
  const toAbsoluteSlotNumber = (slot: RelativeSlot) =>
    TimeUtils.toAbsoluteSlotNumber(getCardanoHaskellBaseConfig(network), slot);

  if (before != null && after != null) {
    throw new Error('Only one of `before` or `after` should be used for a resync');
  }

  const bestBlock = await getBestBlock({ network });
  const untilBlock = before == null ? bestBlock.hash : before.blockHash;
  const shouldUpdateLastSync = before == null;


  if (shouldUpdateLastSync) {
    // update last sync
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

  let txHashes;

  if (untilBlock != null) {

    // address syncing has been done by scanUtxos so no need to do it here again
    // get new txs from fetcher
    // important: get addresses for our wallet AFTER scanning for new addresses
    const { txIds, addresses } = await rawGetAllTxIds(
      db, dbTx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetAddress: deps.GetAddress,
        GetDerivationSpecific: deps.GetDerivationSpecific,
        AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
        AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
        GetCertificates: deps.GetCertificates,
      },
      { publicDeriver },
      derivationTables,
    );

    let txsFromNetwork;
    if (after != null) {
      /*
       * HEAD
       */
      txsFromNetwork = await getTransactionHistory({
        network,
        addresses: toRequestAddresses(addresses),
        after: {
          block: after.blockHash,
          tx: after.txHash || undefined,
        },
        untilBlock,
      });
      txHashes = txsFromNetwork.map(tx => tx.hash);
    } else {
      /*
       * TAIL
       */
      const recentTxHashesResult = await getRecentTransactionHashes({
        network,
        addresses: toRequestAddresses(addresses),
        before: {
          blockHash: untilBlock,
          txHash: before?.txHash,
        },
      });
      const summaries: Array<TxSummary> =
        listValues(recentTxHashesResult).flat()
          .filter(createFilterUniqueBy(x => x.txHash));
      summaries.sort((a: TxSummary, b: TxSummary) => {
        // DESC ordering (b < a)
        return b.epoch - a.epoch || b.slot - a.slot || b.txBlockIndex - a.txBlockIndex;
      });
      txHashes = summaries.slice(0,20).map(x => x.txHash);
      txsFromNetwork = await getTransactionsByHashes({ network, txHashes });
    }

    const ourIds = new Set(
      Object.keys(addresses)
        .flatMap(key => addresses[key])
        .map(addrRow => addrRow.AddressId)
    );

    // save data to local DB

    // WARNING: this can also modify the address set
    // ex: a new group address is found
    await updateTransactionBatch(
      db,
      dbTx,
      {
        MarkUtxo: deps.MarkUtxo,
        CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
        CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
        GetEncryptionMeta: deps.GetEncryptionMeta,
        GetTransaction: deps.GetTransaction,
        GetUtxoInputs: deps.GetUtxoInputs,
        ModifyTransaction: deps.ModifyTransaction,
        ModifyCardanoByronTx: deps.ModifyCardanoByronTx,
        ModifyCardanoShelleyTx: deps.ModifyCardanoShelleyTx,
        ModifyToken: deps.ModifyToken,
        GetToken: deps.GetToken,
        AssociateToken: deps.AssociateToken,
      },
      {
        network: publicDeriver.getParent().getNetworkInfo(),
        txIds,
        txsFromNetwork,
        hashToIds: rawGenHashToIdsFunc(
          ourIds,
          publicDeriver.getParent().getNetworkInfo()
        ),
        defaultToken: publicDeriver.getParent().getDefaultToken(),
        findOwnAddress: rawGenFindOwnAddress(
          ourIds
        ),
        toAbsoluteSlotNumber,
        derivationTables,
        getTokenInfo,
        getMultiAssetMetadata,
        getMultiAssetSupply,
      }
    );
  } else {
    txHashes = [];
  }

  const txs = await rawGetTransactions(
    db, dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
      CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
      AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
      AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
      GetTxAndBlock: deps.GetTxAndBlock,
      GetDerivationSpecific: deps.GetDerivationSpecific,
      GetCertificates: deps.GetCertificates,
    },
    {
      publicDeriver,
      getTxAndBlock: async (txIds) => await deps.GetTxAndBlock.byTime(
        db, dbTx,
        {
          txIds,
        }
      )
    },
    derivationTables,
  );
  const toRemoveTxIds = txs.txs.slice(100).map(tx => tx.transaction.TransactionId);

  await deps.DeleteAllTransactions.delete(
    db, dbTx,
    {
      publicDeriverId: publicDeriver.getPublicDeriverId(),
      txIds: toRemoveTxIds,
    },
    false,
  );

  const txHashSet = new Set(txHashes);
  return {
    txs: txs.txs.filter(tx => txHashSet.has(tx.transaction.Hash)),
    addressLookupMap: txs.addressLookupMap,
  };
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
    CardanoByronAssociateTxWithIOs: Class<CardanoByronAssociateTxWithIOs>,
    CardanoShelleyAssociateTxWithIOs: Class<CardanoShelleyAssociateTxWithIOs>,
    GetEncryptionMeta: Class<GetEncryptionMeta>,
    GetTransaction: Class<GetTransaction>,
    GetUtxoInputs: Class<GetUtxoInputs>,
    ModifyTransaction: Class<ModifyTransaction>,
    ModifyCardanoByronTx: Class<ModifyCardanoByronTx>,
    ModifyCardanoShelleyTx: Class<ModifyCardanoShelleyTx>,
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
    AssociateToken: Class<AssociateToken>,
  |},
  request: {|
    network: $ReadOnly<NetworkRow>,
    toAbsoluteSlotNumber: RelativeSlot => number,
    txIds: Array<number>,
    txsFromNetwork: Array<RemoteTransaction>,
    hashToIds: HashToIdsFunc,
    findOwnAddress: FindOwnAddressFunc,
    derivationTables: Map<number, string>,
    defaultToken: DefaultTokenEntry,
    getTokenInfo: TokenInfoFunc,
    getMultiAssetMetadata: MultiAssetMintMetadataFunc,
    getMultiAssetSupply: MultiAssetSupplyFunc,
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
    const byronWithIOs = await deps.CardanoByronAssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      {
        txs: txs.filter(tx => tx.Type === TransactionType.CardanoByron),
        networkId: request.network.NetworkId,
      }
    );
    const shelleyWithIOs = await deps.CardanoShelleyAssociateTxWithIOs.getIOsForTx(
      db, dbTx,
      {
        txs: txs.filter(tx => tx.Type === TransactionType.CardanoShelley),
        networkId: request.network.NetworkId,
      }
    );
    const txsWithIOs = [
      ...byronWithIOs,
      ...shelleyWithIOs,
    ];
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
    if (matchInDb.transaction.Status === TxStatusCodes.IN_BLOCK) {
      continue;
    }
    if (result.block !== null) {
      txsAddedToBlock.push({
        ...(matchInDb: (CardanoByronTxIO | CardanoShelleyTxIO)),
        // override with updated
        transaction: result.transaction,
        block: result.block,
      });
    }
  }

  // 2) Add any new assets & lookup known ones
  const tokenIds = Array.from(new Set(unseenNewTxs.flatMap(tx => [
    ...tx.inputs
      .flatMap(input => input.assets)
      .map(asset => asset.assetId),
    ...tx.outputs
      .flatMap(output => output.assets)
      .map(asset => asset.assetId),
    // force inclusion of primary token for chain
    request.defaultToken.defaultIdentifier
  ])));

  const assetLookup = await genCardanoAssetMap(
    db, dbTx,
    {
      ModifyToken: deps.ModifyToken,
      GetToken: deps.GetToken,
    },
    tokenIds,
    request.getTokenInfo,
    request.getMultiAssetMetadata,
    request.getMultiAssetSupply,
    request.network,
  );

  // 3) Add new transactions
  const genNextTokenListId = await createTokenListIdGenFunction(
    db, dbTx,
    { AssociateToken: deps.AssociateToken }
  );
  const { byronTxs, shelleyTxs, } = await networkTxToDbTx(
    db,
    dbTx,
    request.network,
    request.derivationTables,
    unseenNewTxs,
    request.hashToIds,
    request.findOwnAddress,
    request.toAbsoluteSlotNumber,
    TransactionSeed,
    BlockSeed,
    assetLookup,
    genNextTokenListId,
  );
  const newsTxsIdSet = new Set();

  // <TODO:PENDING_REMOVAL> Byron Legacy: this should be impossible now, we are not syncing history from pre-Shelley
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
        tokens: result.tokens,
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
        accountingInputs: result.accountingInputs,
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

  // Mark any pending tx that is not found by remote as failed

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

function genByronIOGen(
  byronTx: RemoteTransaction,
  getIdOrThrow: string => number,
  network: $ReadOnly<NetworkRow>,
  getAssetInfoOrThrow: string => $ReadOnly<TokenRow>,
  genNextTokenListId: void => number,
): (number => {|
  utxoInputs: Array<UtxoTransactionInputInsert>,
  utxoOutputs: Array<UtxoTransactionOutputInsert>,
  tokenList: Array<{|
    TokenList: TokenListInsert,
    identifier: string,
    networkId: number,
  |}>,
|}) {
  if (!(byronTx.type == null || byronTx.type === RemoteTransactionTypes.byron)) {
    throw new Error(`${nameof(genByronIOGen)} not a byron transaction`);
  }
  return (txRowId) => {
    const utxoInputs = [];
    const utxoOutputs = [];
    const tokenList = [];
    for (let i = 0; i < byronTx.inputs.length; i++) {
      const input = byronTx.inputs[i];

      const listId = genNextTokenListId();
      // 1) Add ADA
      tokenList.push({
        TokenList: {
          Amount: input.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Cardano).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        networkId: network.NetworkId,
      });
      // 2) Add tokens
      for (let tokenIndex = 0; tokenIndex < input.assets.length; tokenIndex++) {
        const assetInfo = getAssetInfoOrThrow(input.assets[tokenIndex].assetId);
        tokenList.push({
          TokenList: {
            Amount: input.assets[tokenIndex].amount.toString(),
            ListId: listId,
            TokenId: assetInfo.TokenId,
          },
          identifier: input.assets[tokenIndex].assetId,
          networkId: network.NetworkId,
        });
      }

      utxoInputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(input.address),
        ParentTxHash: input.txHash,
        IndexInParentTx: input.index,
        IndexInOwnTx: i,
        TokenListId: listId,
      });
    }
    for (let i = 0; i < byronTx.outputs.length; i++) {
      const output = byronTx.outputs[i];

      // 1) Add ADA
      const listId = genNextTokenListId();
      tokenList.push({
        TokenList: {
          Amount: output.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Cardano).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        networkId: network.NetworkId,
      });
      // 2) Add tokens
      for (let tokenIndex = 0; tokenIndex < output.assets.length; tokenIndex++) {
        const assetInfo = getAssetInfoOrThrow(output.assets[tokenIndex].assetId);
        tokenList.push({
          TokenList: {
            Amount: output.assets[tokenIndex].amount.toString(),
            ListId: listId,
            TokenId: assetInfo.TokenId,
          },
          identifier: output.assets[tokenIndex].assetId,
          networkId: network.NetworkId,
        });
      }

      utxoOutputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(output.address),
        OutputIndex: i,
        /**
          * we assume unspent for now but it will be updated after if necessary
          * Note: if this output doesn't belong to you, it will be true forever
          * This is slightly misleading, but using null would require null-checks everywhere
          */
        IsUnspent: true,
        ErgoBoxId: null,
        ErgoCreationHeight: null,
        ErgoRegisters: null,
        ErgoTree: null,
        TokenListId: listId,
      });
    }

    return {
      utxoInputs,
      utxoOutputs,
      tokenList,
    };
  };
}
function genShelleyIOGen(
  shelleyTx: RemoteTransaction,
  getIdOrThrow: string => number,
  network: $ReadOnly<NetworkRow>,
  getAssetInfoOrThrow: string => $ReadOnly<TokenRow>,
  genNextTokenListId: void => number,
): (number => {|
  utxoInputs: Array<UtxoTransactionInputInsert>,
  utxoOutputs: Array<UtxoTransactionOutputInsert>,
  accountingInputs: Array<AccountingTransactionInputInsert>,
  tokenList: Array<{|
    TokenList: TokenListInsert,
    identifier: string,
    networkId: number,
  |}>,
|}) {
  if (shelleyTx.type !== RemoteTransactionTypes.shelley) {
    throw new Error(`${nameof(genShelleyIOGen)} not a shelley transaction`);
  }
  return (txRowId) => {
    const utxoInputs = [];
    const utxoOutputs = [];
    const accountingInputs = [];
    const tokenList = [];
    for (let i = 0; i < shelleyTx.inputs.length; i++) {
      const input = shelleyTx.inputs[i];

      const listId = genNextTokenListId();
      // 1) Add ADA
      tokenList.push({
        TokenList: {
          Amount: input.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Cardano).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        networkId: network.NetworkId,
      });
      // 2) Add tokens
      for (let tokenIndex = 0; tokenIndex < input.assets.length; tokenIndex++) {
        const assetInfo = getAssetInfoOrThrow(input.assets[tokenIndex].assetId);
        tokenList.push({
          TokenList: {
            Amount: input.assets[tokenIndex].amount.toString(),
            ListId: listId,
            TokenId: assetInfo.TokenId,
          },
          identifier: input.assets[tokenIndex].assetId,
          networkId: network.NetworkId,
        });
      }

      utxoInputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(input.address),
        ParentTxHash: input.txHash,
        IndexInParentTx: input.index,
        IndexInOwnTx: i,
        TokenListId: listId,
      });
    }
    for (let i = 0; i < shelleyTx.withdrawals.length; i++) {
      const listId = genNextTokenListId();

      // 1) Add ADA
      tokenList.push({
        TokenList: {
          Amount: shelleyTx.withdrawals[i].amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Cardano).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        networkId: network.NetworkId,
      });
      accountingInputs.push({
        TransactionId: txRowId,
        AddressId: getIdOrThrow(shelleyTx.withdrawals[i].address),
        /**
         * Withdrawal transactions don't increase the spending counter
         * Replay protection is achieved by forcing all transactions to also include a UTXO input
         * And requiring that the full balance is transferred in a withdrawal
         */
        SpendingCounter: 0,
        /**
         * Note: the index for a withdrawal starts at 0 (independent of UTXO inputs)
         */
        IndexInOwnTx: i,
        TokenListId: listId,
      });
    }
    for (let i = 0; i < shelleyTx.outputs.length; i++) {
      const output = shelleyTx.outputs[i];

      const listId = genNextTokenListId();
      // 1) Add ADA
      tokenList.push({
        TokenList: {
          Amount: output.amount,
          ListId: listId,
          TokenId: getAssetInfoOrThrow(PRIMARY_ASSET_CONSTANTS.Cardano).TokenId,
        },
        identifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        networkId: network.NetworkId,
      });
      for (let tokenIndex = 0; tokenIndex < output.assets.length; tokenIndex++) {
        const assetInfo = getAssetInfoOrThrow(output.assets[tokenIndex].assetId);
        tokenList.push({
          TokenList: {
            Amount: output.assets[tokenIndex].amount.toString(),
            ListId: listId,
            TokenId: assetInfo.TokenId,
          },
          identifier: output.assets[tokenIndex].assetId,
          networkId: network.NetworkId,
        });
      }

      const outputType = addressToKind(output.address, 'bytes', network);
      // consider a group address as a UTXO output
      // since the payment (UTXO) key is the one that signs
      if (
        outputType === CoreAddressTypes.CARDANO_LEGACY ||
        outputType === CoreAddressTypes.CARDANO_ENTERPRISE ||
        outputType === CoreAddressTypes.CARDANO_BASE ||
        outputType === CoreAddressTypes.CARDANO_PTR
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
          ErgoRegisters: null,
          ErgoTree: null,
        });
      } else if (
        outputType === CoreAddressTypes.CARDANO_REWARD
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
      accountingInputs,
      tokenList,
    };
  };
}

export async function getTokenMintMetadataAndSupply(
  tokenIds: string[],
  getMultiAssetMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
  network: $ReadOnly<NetworkRow>
) : Promise<[
  $ReadOnly<MultiAssetMintMetadataResponse>,
  $ReadOnly<MultiAssetSupplyResponse>,
]> {
  const assets = (tokenIds||[])
    .filter(t => t.indexOf('.') !== -1)
    .map(t => {
      const parts = t.split('.');
      const policyId = parts[0];
      const assetNameHex = parts[1];
      return {
        nameHex: assetNameHex,
        policy: policyId,
      };
    });

  if (assets.length === 0)
    return [{}, {}];

  const [tokensMintMetadata, tokensSupply] = await Promise.all([
    getMultiAssetMetadata({ network, assets }),
    getMultiAssetSupply({ network, assets }),
  ]);

  return [tokensMintMetadata, tokensSupply];
};

const TOKEN_INFO_CACHE_TIME = 1 * 60 * 60 * 1000;

export async function genCardanoAssetMap(
  db: lf$Database,
  dbTx: lf$Transaction,
  deps: {|
    ModifyToken: Class<ModifyToken>,
    GetToken: Class<GetToken>,
  |},
  tokenIds: Array<string>,
  getTokenInfo: TokenInfoFunc,
  getMultiAssetMetadata: MultiAssetMintMetadataFunc,
  getMultiAssetSupply: MultiAssetSupplyFunc,
  network: $ReadOnly<NetworkRow>,
): Promise<Map<string, $ReadOnly<TokenRow>>> {
  const existingDbRows = (await deps.GetToken.fromIdentifier(
    db, dbTx,
    tokenIds
  )).filter(row => row.NetworkId === network.NetworkId);
  const existingRowsMap = new Map<string, $ReadOnly<TokenRow>>(
    existingDbRows.map(row => [row.Identifier, row])
  );

  const noNeedForUpdateTokens = new Set<string>(
    existingDbRows.filter(row => {
      // default token rows are never updated from the network
      if (row.IsDefault) {
        return true;
      }
      // tokens rows that have never been queried from the network
      const { lastUpdatedAt } = row.Metadata;
      if (lastUpdatedAt == null) {
        return false;
      }
      // fresh enough, no need for updating this time
      if (Date.now() - Date.parse(lastUpdatedAt) < TOKEN_INFO_CACHE_TIME) {
        return true;
      }
      return false;
    }).map(row => row.Identifier)
  );

  const updatingTokenIds = tokenIds.filter(token => !noNeedForUpdateTokens.has(token));

  const tokenInfoPromise = getTokenInfo({
    network,
    tokenIds: updatingTokenIds.map(id => id.split('.').join(''))
  });

  const tokenMintMetadataAndSupplyPromise = getTokenMintMetadataAndSupply(
    tokenIds,
    getMultiAssetMetadata,
    getMultiAssetSupply,
    network,
  );

  let tokenInfoResponse = {};
  let metadata = {};
  let supply = {};
  try {
    [tokenInfoResponse, [metadata, supply]] =
      await Promise.all([tokenInfoPromise, tokenMintMetadataAndSupplyPromise]);
  } catch(e) {
    console.error('Failed to query token info, metadata, or supply', e);
  }

  const databaseInsert = updatingTokenIds
    .map(tokenId => {
      const id = tokenId.split('.').join('');

      let numberOfDecimals = 0;
      let lastUpdatedAt = null;
      let ticker = null;
      let longName = null;
      let logo = null;

      const tokenInfo = tokenInfoResponse[id];
      if (tokenInfo) {
        numberOfDecimals = tokenInfo.decimals ?? 0;
        ticker = tokenInfo.ticker ?? null;
        lastUpdatedAt = new Date().toISOString();
        longName = tokenInfo.name ?? null;
        logo = tokenInfo.logo ?? null;
      } else if (tokenInfo === null) {
        // the token is not registered
        lastUpdatedAt = new Date().toISOString();
      } else if (existingRowsMap.has(tokenId)) {
        // the token entry exists, do not update
        return null;
      }

      const parts = identifierToCardanoAsset(tokenId);

      const assetName = bytesToHex(parts.name.name());
      const policyId = parts.policyId.to_hex();

      const tokenMetadata = metadata[tokenId];
      const tokenSupplyStr = supply[tokenId];

      let isNft = false;

      let assetMintMetadata: CardanoAssetMintMetadata[] = [];
      if (tokenMetadata) {
        const hasMediaMetadata = tokenMetadata.filter(m => m.key === '721').length > 0;
        const hasOnlyOneUnit = tokenSupplyStr === '1';
        isNft = hasMediaMetadata && hasOnlyOneUnit;

        assetMintMetadata = tokenMetadata.map(m => {
          const metaObj: CardanoAssetMintMetadata = {};
          metaObj[m.key] = m.metadata;
          return metaObj;
        });
      }

      return {
        NetworkId: network.NetworkId,
        Identifier: tokenId,
        IsDefault: false,
        // must have the same TokenId, which is the primary key, as the existing
        // token row, otherwise a new row is inserted instead of the existing row
        // being updated
        TokenId: existingRowsMap.get(tokenId)?.TokenId,
        IsNFT: isNft,
        Metadata: {
          type: 'Cardano',
          ticker,
          logo,
          longName,
          numberOfDecimals,
          assetName,
          policyId,
          lastUpdatedAt,
          assetMintMetadata
        },
      };
    }).filter(Boolean);

  const newDbRows = await deps.ModifyToken.upsert(
    db, dbTx,
    databaseInsert
  );

  const result = new Map<string, $ReadOnly<TokenRow>>();
  existingDbRows.forEach(row => result.set(row.Identifier, row));
  newDbRows.forEach(row => result.set(row.Identifier, row));

  return result;
}

async function networkTxToDbTx(
  db: lf$Database,
  dbTx: lf$Transaction,
  network: $ReadOnly<NetworkRow>,
  derivationTables: Map<number, string>,
  newTxs: Array<RemoteTransaction>,
  hashToIds: HashToIdsFunc,
  findOwnAddress: FindOwnAddressFunc,
  toAbsoluteSlotNumber: RelativeSlot => number,
  TransactionSeed: number,
  BlockSeed: number,
  assetLookup: Map<string, $ReadOnly<TokenRow>>,
  genNextTokenListId: void => number,
): Promise<{|
  byronTxs: Array<{|
    block: null | BlockInsert,
    transaction: (blockId: null | number) => TransactionInsert,
    ioGen: ReturnType<typeof genByronIOGen>,
  |}>,
  shelleyTxs: Array<{|
    block: null | BlockInsert,
    transaction: (blockId: null | number) => TransactionInsert,
    certificates: $ReadOnlyArray<number => (void | AddCertificateRequest)>,
    ioGen: ReturnType<typeof genShelleyIOGen>,
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

  const getAssetInfoOrThrow = (hash: string): $ReadOnly<TokenRow> => {
    // recall: we already added all needed tokens to the DB before we get here
    const id = assetLookup.get(hash);
    if (id === undefined) {
      throw new Error(`${nameof(networkTxToDbTx)} should never happen -- asset missing`);
    }
    return id;
  };

  // <TODO:PENDING_REMOVAL> Byron Legacy: this should be impossible now, we are not syncing history from pre-Shelley
  const byronTxs = [];
  const shelleyTxs = [];

  for (const networkTx of newTxs) {
    const { block, transaction } = networkTxHeaderToDb(
      networkTx,
      toAbsoluteSlotNumber,
      TransactionSeed,
      BlockSeed,
    );

    // <TODO:PENDING_REMOVAL> Byron
    if (networkTx.type == null || networkTx.type === RemoteTransactionTypes.byron) {
      byronTxs.push({
        block,
        transaction,
        ioGen: genByronIOGen(
          networkTx,
          getIdOrThrow,
          network,
          getAssetInfoOrThrow,
          genNextTokenListId
        ),
      });
    } else if (networkTx.type === RemoteTransactionTypes.shelley) {
      const baseConfig = getCardanoHaskellBaseConfig(network)
        .reduce((acc, next) => Object.assign(acc, next), {});
      const certificates: $ReadOnlyArray<
        number => (void | AddCertificateRequest)
      > = networkTx.certificates == null
        ? [(_txId) => undefined]
        : await certificateToDb(
          db, dbTx,
          {
            certificates: networkTx.certificates,
            hashToIds,
            findOwnAddress,
            derivationTables,
            network: Number.parseInt(baseConfig.ChainNetworkId, 10)
          }
        );
      shelleyTxs.push({
        block,
        transaction,
        certificates,
        ioGen: genShelleyIOGen(
          networkTx,
          getIdOrThrow,
          network,
          getAssetInfoOrThrow,
          genNextTokenListId
        ),
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
  toAbsoluteSlotNumber: RelativeSlot => number,
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

  const baseTx = {
    Hash: tx.hash,
    Digest: digest,
    Ordinal: tx.tx_ordinal,
    LastUpdateTime: block == null || tx.time == null
      ? new Date(tx.last_update).getTime() // this is out best guess for txs not in a block
      : new Date(tx.time).getTime(),
    Status: statusStringToCode(tx.tx_state),
    ErrorMessage: null, // TODO: add error message from backend if present
  };

  if (tx.type == null || tx.type === RemoteTransactionTypes.byron) {
    return {
      block,
      transaction: (blockId) => ({
        Type: TransactionType.CardanoByron,
        Extra: null,
        BlockId: blockId,
        ...baseTx,
      }: CardanoByronTransactionInsert),
    };
  }
  if (tx.type === RemoteTransactionTypes.shelley) {
    return {
      block,
      transaction: (blockId) => ({
        Type: TransactionType.CardanoShelley,
        Extra: {
          Fee: tx.fee,
          Metadata: tx.metadata,
          // for backward compatiblity, if the field is not present, we take the tx as valid
          IsValid: tx.valid_transaction ?? true,
        },
        BlockId: blockId,
        ...baseTx,
      }: CardanoShelleyTransactionInsert),
    };
  }
  throw new Error(`${nameof(networkTxHeaderToDb)} Unhandled tx type ${tx.type ?? ''}`);
}

async function certificateToDb(
  db: lf$Database,
  dbTx: lf$Transaction,
  request: {|
    network: number,
    certificates: $ReadOnlyArray<RemoteCertificate>,
    hashToIds: HashToIdsFunc,
    findOwnAddress: FindOwnAddressFunc,
    derivationTables: Map<number, string>,
  |},
): Promise<$ReadOnlyArray<number => AddCertificateRequest>> {
  const findOwnAddress = async (addr: string) => await request.findOwnAddress({
    db,
    tx: dbTx,
    lockedTables: Array.from(request.derivationTables.values()),
    hash: addr
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
  const tryGetKey = async (
    stakeCredentialHex: string
  ): Promise<void | number> => {
    // an operator/owner key might belong to the wallet
    // however, these keys are plain ED25519 hashes
    // there there is no way of knowing what address it corresponds to
    // so we just try both and see if one of them matches
    // note: if there is no match, we don't add these addresses to the DB
    // since we don't know what address it would be
    // and in most cases, people generate these addresses through the CLI anyway
    {
      const rewardAddressHex = RustModule.WasmScope(Module => {
        const stakeCredential = Module.WalletV4.Credential
          .from_bytes(hexToBytes(stakeCredentialHex));
        return bytesToHex(
          Module.WalletV4.RewardAddress
            .new(request.network, stakeCredential)
            .to_address()
            .to_bytes()
        );
      });
      const ownAddress = await findOwnAddress(rewardAddressHex);
      if (ownAddress != null) {
        return ownAddress;
      }
    }
    {
      const enterpriseAddressHex = RustModule.WasmScope(Module => {
        const stakeCredential = Module.WalletV4.Credential
          .from_bytes(hexToBytes(stakeCredentialHex));
        return Module.WalletV4.EnterpriseAddress
          .new(request.network, stakeCredential)
          .to_address()
          .to_hex();
      });
      const ownAddress = await findOwnAddress(enterpriseAddressHex);
      if (ownAddress != null) return ownAddress;
    }
    return undefined;
  };

  const result = [];
  for (let i = 0; i < request.certificates.length; i++) {
    const cert = request.certificates[i];
    switch (cert.kind) {
      case ShelleyCertificateTypes.StakeRegistration: {
        const [addressHex, certificateHex] = RustModule.WasmScope(Module => {
          const stakeCredentials = Module.WalletV4.RewardAddress.from_address(
            Module.WalletV4.Address.from_bytes(hexToBytes(cert.rewardAddress))
          )?.payment_cred();
          if (stakeCredentials == null) throw new Error(`${nameof(certificateToDb)} not a valid reward account`);
          return [
            bytesToHex(Module.WalletV4.RewardAddress
              .new(request.network, stakeCredentials).to_address().to_bytes()),
            bytesToHex(Module.WalletV4.StakeRegistration
              .new(stakeCredentials).to_bytes()),
          ];
        });
        const addressId = await addressToId(addressHex);
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeRegistration,
            Payload: certificateHex,
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
        const [addressHex, certificateHex] = RustModule.WasmScope(Module => {
          const stakeCredentials = Module.WalletV4.RewardAddress.from_address(
            Module.WalletV4.Address.from_bytes(hexToBytes(cert.rewardAddress))
          )?.payment_cred();
          if (stakeCredentials == null) throw new Error(`${nameof(certificateToDb)} not a valid reward account`);
          return [
            bytesToHex(Module.WalletV4.RewardAddress
              .new(request.network, stakeCredentials).to_address().to_bytes()),
            bytesToHex(Module.WalletV4.StakeRegistration
              .new(stakeCredentials).to_bytes()),
          ];
        });
        const addressId = await addressToId(addressHex);
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeDeregistration,
            Payload: certificateHex,
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
        const [addressHex, certificateHex, stakeCredentialHex] = RustModule.WasmScope(Module => {
          const rewardAddress = Module.WalletV4.RewardAddress.from_address(
            Module.WalletV4.Address.from_bytes(hexToBytes(cert.rewardAddress))
          );
          if (rewardAddress == null) throw new Error(`${nameof(certificateToDb)} not a valid reward account`);
          const stakeCredentials = rewardAddress.payment_cred();
          const poolKeyHash = Module.WalletV4.Ed25519KeyHash
            .from_bytes(hexToBytes(cert.poolKeyHash));
          return [
            bytesToHex(rewardAddress.to_address().to_bytes()),
            bytesToHex(Module.WalletV4.StakeDelegation
              .new(stakeCredentials, poolKeyHash).to_bytes()),
            bytesToHex(Module.WalletV4.Credential
              .from_keyhash(poolKeyHash).to_bytes()),
          ]
        });
        { // pool key
          const poolKeyId = await tryGetKey(stakeCredentialHex);
          if (poolKeyId != null) {
            relatedAddressesInfo.push({
              AddressId: poolKeyId,
              Relation: CertificateRelation.POOL_KEY
            });
          }
        }

        { // delegator
          const addressId = await addressToId(addressHex);
          relatedAddressesInfo.push({
            AddressId: addressId,
            Relation: CertificateRelation.SIGNER
          });
        }

        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeDelegation,
            Payload: certificateHex,
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
        const ownerStakeCredentialHexes = [];
        const [operatorStakeCredentialHex, certificateHex] = RustModule.WasmScope(Module => {
          const rewardAddress = Module.WalletV4.RewardAddress.from_address(
            Module.WalletV4.Address.from_bytes(hexToBytes(cert.poolParams.rewardAccount))
          );
          if (rewardAddress == null) throw new Error(`${nameof(certificateToDb)} registration address not a reward address`);

          const operatorKey = Module.WalletV4.Ed25519KeyHash
            .from_bytes(hexToBytes(cert.poolParams.operator));

          // pool owners
          const owners = Module.WalletV4.Ed25519KeyHashes.new();
          for (let j = 0; j < cert.poolParams.poolOwners.length; j++) {
            const owner = cert.poolParams.poolOwners[j];
            const ownerKey = Module.WalletV4.Ed25519KeyHash.from_hex(owner);
            owners.add(ownerKey);
            const ownerStakeCredentialHex = bytesToHex(Module.WalletV4.Credential
              .from_keyhash(ownerKey).to_bytes());
            ownerStakeCredentialHexes.push(ownerStakeCredentialHex);
          }

          let poolMetadata = undefined;
          if (cert.poolParams.poolMetadata != null) {
            const metadata = cert.poolParams.poolMetadata;
            poolMetadata = Module.WalletV4.PoolMetadata.new(
              Module.WalletV4.URL.new(metadata.url),
              Module.WalletV4.PoolMetadataHash.from_hex(metadata.metadataHash)
            );
          }

          const certificate = Module.WalletV4.PoolRegistration.new(
            Module.WalletV4.PoolParams.new(
              operatorKey,
              Module.WalletV4.VRFKeyHash.from_hex(cert.poolParams.vrfKeyHash),
              Module.WalletV4.BigNum.from_str(cert.poolParams.pledge),
              Module.WalletV4.BigNum.from_str(cert.poolParams.cost),
              Module.WalletV4.UnitInterval.new(
                // TODO: dummy data since db-sync doesn't support this yet
                Module.WalletV4.BigNum.from_str('1'),
                Module.WalletV4.BigNum.from_str('1'),
                // Module.WalletV4.BigNum.from_str(cert.poolParams.margin.numerator),
                // Module.WalletV4.BigNum.from_str(cert.poolParams.margin.denominator),
              ),
              rewardAddress,
              owners,
              Module.WalletV4.Relays.new(),
              poolMetadata
            )
          );

          return [
            bytesToHex(Module.WalletV4.Credential
              .from_keyhash(operatorKey).to_bytes()),
            bytesToHex(certificate.to_bytes()),
          ];
        });

        { // owners
          for (const ownerStakeCredentialHex of ownerStakeCredentialHexes) {
            const ownerId = await tryGetKey(ownerStakeCredentialHex);
            if (ownerId != null) {
              relatedAddressesInfo.push({
                AddressId: ownerId,
                Relation: CertificateRelation.OWNER
              });
            }
          }
        }
        { // operator
          const operatorId = await tryGetKey(operatorStakeCredentialHex);
          if (operatorId != null) {
            relatedAddressesInfo.push({
              AddressId: operatorId,
              Relation: CertificateRelation.OPERATOR
            });
          }
        }
        { // reward
          const addressId = await addressToId(cert.poolParams.rewardAccount);
          relatedAddressesInfo.push({
            AddressId: addressId,
            Relation: CertificateRelation.REWARD_ADDRESS
          });
        }

        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.PoolRegistration,
            Payload: certificateHex,
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
        const [stakeCredentialHex, certificateHex] = RustModule.WasmScope(Module => {
          const poolKeyHash = Module.WalletV4.Ed25519KeyHash
            .from_bytes(hexToBytes(cert.poolKeyHash));
          return [
            bytesToHex(Module.WalletV4.Credential
              .from_keyhash(poolKeyHash).to_bytes()),
            bytesToHex(Module.WalletV4.PoolRetirement
              .new(poolKeyHash, cert.epoch).to_bytes()),
          ];
        });

        {
          const poolKeyId = await tryGetKey(stakeCredentialHex);
          if (poolKeyId != null) {
            relatedAddressesInfo.push({
              AddressId: poolKeyId,
              Relation: CertificateRelation.POOL_KEY
            });
          }
        }

        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.PoolRetirement,
            Payload: certificateHex,
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
        const certificateHex = RustModule.WasmScope(Module => bytesToHex(
          Module.WalletV4.GenesisKeyDelegation.new(
            Module.WalletV4.GenesisHash
              .from_bytes(hexToBytes(cert.genesishash)),
            Module.WalletV4.GenesisDelegateHash
              .from_bytes(hexToBytes(cert.genesisDelegateHash)),
            Module.WalletV4.VRFKeyHash
              .from_bytes(hexToBytes(cert.vrfKeyHash)),
          ).to_bytes()
        ));

        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.GenesisKeyDelegation,
            Payload: certificateHex,
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
        const certificateHex = RustModule.WasmScope(Module => {
          const certPot = Module.WalletV4.MIRToStakeCredentials.new();
          for (const addressHex of Object.keys(cert.rewards)) {
            const rewardAddress = Module.WalletV4.RewardAddress.from_address(
              Module.WalletV4.Address.from_bytes(hexToBytes(addressHex))
            );
            if (rewardAddress == null) throw new Error(`${nameof(certificateToDb)} not a valid reward account`);
            const stakeCredentials = rewardAddress.payment_cred();
            if (stakeCredentials == null) throw new Error(`${nameof(certificateToDb)} not a valid reward account`);
            certPot.insert(
              stakeCredentials,
              Module.WalletV4.Int.new(
                Module.WalletV4.BigNum.from_str(cert.rewards[addressHex])
              ),
            );
          }
          const certificate = Module.WalletV4.MoveInstantaneousRewardsCert.new(
            Module.WalletV4.MoveInstantaneousReward.new_to_stake_creds(
              cert.pot,
              certPot,
            )
          );
          return bytesToHex(certificate.to_bytes());
        });

        {
          for (const addressHex of Object.keys(cert.rewards)) {
            const rewardAddrKey = await findOwnAddress(addressHex);
            if (rewardAddrKey != null) {
              relatedAddressesInfo.push({
                AddressId: rewardAddrKey,
                Relation: CertificateRelation.REWARD_ADDRESS
              });
            }
          }
        }

        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.MoveInstantaneousRewardsCert,
            Payload: certificateHex,
            TransactionId: txId,
          },
          relatedAddresses: (certId: number) => relatedAddressesInfo.map(info => ({
            ...info,
            CertificateId: certId,
          }))
        }));
        break;
      }
      case ShelleyCertificateTypes.VoteDelegation: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.VoteDelegation,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.StakeVoteDelegation: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeAndVoteDelegation,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.StakeRegistrationDelegation: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeRegistrationAndDelegation,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.VoteRegistrationDelegation: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.VoteRegistrationAndDelegation,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.StakeVoteRegistrationDelegation: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.StakeVoteRegistrationAndDelegation,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.AuthCommitteeHot: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.CommitteeHotAuth,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.ResignCommitteeCold: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.CommitteeColdResign,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.RegisterDrep: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.DRepRegistration,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.UnregisterDrep: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.DRepDeregistration,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      case ShelleyCertificateTypes.UpdateDrep: {
        result.push((txId: number) => ({
          certificate: {
            Ordinal: cert.certIndex,
            Kind: RustModule.WalletV4.CertificateKind.DRepUpdate,
            Payload: '',
            TransactionId: txId,
          },
          relatedAddresses: (_certId: number) => [],
        }));
        break;
      }
      default: throw new Error(`${nameof(certificateToDb)} unknown cert kind ` + cert.kind);
    }
  }
  return result;
}

function compareAndSetIfNewAddressSetHash(id: number, addresses: Array<string>): boolean {
  const requestAddresseSet = new Set(addresses);
  const requestAddresseHash = ObjectHash.sha1(requestAddresseSet);
  const localStorageKey = `TMP/UTXO_REQUEST_ADDRESSES_HASH/${id}`;
  const prevRequestAddressHash = localStorage.getItem(localStorageKey);
  const isUpdating = prevRequestAddressHash == null || prevRequestAddressHash !== requestAddresseHash;
  if (isUpdating) {
    // <TODO:REMOVE_AFTER_YOROI_LIB_UPGRADE>
    console.debug('/// utxo state must be cleared:', id, requestAddresseHash, prevRequestAddressHash);
    localStorage.setItem(localStorageKey, requestAddresseHash);
  }
  return isUpdating;
}

async function rawUpdateUtxos(
  db: lf$Database,
  dbTx: lf$Transaction,
  publicDeriver: IPublicDeriver<>,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  derivationTables: Map<number, string>,
): Promise<void> {
  const addresses = await rawGetAddressRowsForWallet(
    dbTx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetAddress: deps.GetAddress,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    { publicDeriver },
    derivationTables,
  );

  const utxoStorageApi = publicDeriver.getUtxoStorageApi();
  const utxoService = publicDeriver.getUtxoService();

  utxoStorageApi.setDb(db);
  utxoStorageApi.setDbTx(dbTx);

  const requestAddresses = toRequestAddresses({
    utxoAddresses: addresses.utxoAddresses.map(a => a.address),
    accountingAddresses: addresses.accountingAddresses.map(a => a.address),
  });
  if (compareAndSetIfNewAddressSetHash(publicDeriver.getPublicDeriverId(), requestAddresses)) {
    await utxoStorageApi.clearUtxoState();
  }
  await utxoService.syncUtxoState(requestAddresses);
}

export function toRequestAddresses(
  addresses: {|
    utxoAddresses: Array<$ReadOnly<AddressRow>>,
    accountingAddresses: Array<$ReadOnly<AddressRow>>,
  |}
): Array<string> {
  return [
    // needs to send legacy addresses directly since they don't use the payment key method
    ...addresses.utxoAddresses
      .filter(address => address.Type === CoreAddressTypes.CARDANO_LEGACY)
      .map(address => address.Hash),
    // payment keys will fetch all addresses with the same payment key
    ...addresses.utxoAddresses
      .filter(address => address.Type === CoreAddressTypes.CARDANO_ENTERPRISE)
      .reduce(
        (list, next) => {
          return RustModule.WasmScope(Module => {
            const wasmAddr = Module.WalletV4.Address.from_hex(next.Hash);
            const enterpriseWasm = Module.WalletV4.EnterpriseAddress.from_address(wasmAddr);
            if (enterpriseWasm == null) return list;
            const keyHash = enterpriseWasm.payment_cred().to_keyhash();
            if (keyHash == null) return list;
            list.push(keyHash.to_bech32(Bech32Prefix.PAYMENT_KEY_HASH));
            return list;
          });
        },
        []
      ),
    // note: sending account addresses is required
    // since for example, the staking key registration certificate doesn't need a witness
    // so a tx where no input/output belongs to you could register your staking key
    ...addresses.accountingAddresses.map(address => address.Hash),
  ];
}
