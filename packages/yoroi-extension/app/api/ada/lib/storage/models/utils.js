// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  groupBy,
  mapValues,
  uniqBy
} from 'lodash';

import {
  BigNumber
} from 'bignumber.js';

import type { UtxoStorage } from '@emurgo/yoroi-lib/dist/utxo';
import type {
  Utxo,
  UtxoAtSafePoint,
  UtxoDiffToBestBlock
} from '@emurgo/yoroi-lib/dist/utxo/models';
import type { Utxo as StorageUtxo } from '../database/utxo/tables';

import type {
  IPublicDeriver,
  UtxoAddressPath,
  IGetUtxoBalanceResponse,
  IHasUtxoChainsRequest,
  IHasUtxoChains,
  IDisplayCutoff,
  BaseAddressPath,
  Address, AddressType, Value, Addressing, UsedStatus,
} from './PublicDeriver/interfaces';

import { ConceptualWallet } from './ConceptualWallet/index';
import type { IHasLevels } from './ConceptualWallet/interfaces';
import type {
  CanonicalAddressRow,
} from '../database/primitives/tables';
import type {
  CoreAddressT
} from '../database/primitives/enums';
import {
  ModifyDisplayCutoff,
} from '../database/walletTypes/bip44/api/write';
import type {
  TreeInsert
} from '../database/walletTypes/common/utils.types';
import {
  GetAddress,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetKeyDerivation,
} from '../database/primitives/api/read';
import {
  getAllSchemaTables,
  raii,
  mapToTables,
} from '../database/utils';
import {
  GetDerivationSpecific,
} from '../database/walletTypes/common/api/read';
import type { UtxoTxOutput } from '../database/transactionModels/utxo/api/read';
import { Bip44DerivationLevels } from '../database/walletTypes/bip44/api/utils';
import type {
  GetPathWithSpecificByTreeRequest,
} from '../database/primitives/api/read';
import {
  GetUtxoTxOutputsWithTx,
} from '../database/transactionModels/utxo/api/read';
import {
  GetUtxoAtSafePoint, GetUtxoDiffToBestBlock,
} from '../database/utxo/api/read';
import {
  ModifyUtxoAtSafePoint, ModifyUtxoDiffToBestBlock,
} from '../database/utxo/api/write';
import { TxStatusCodes, } from '../database/primitives/enums';
import { MultiToken } from '../../../../common/lib/MultiToken';
import type { DefaultTokenEntry } from '../../../../common/lib/MultiToken';

import { ChainDerivations, BIP44_SCAN_SIZE, } from  '../../../../../config/numbersConfig';

type TokenCount = {|
  tokenTypes: number,
  nftTypes: number
|}

export async function rawGetDerivationsByPath<
  Row: { +KeyDerivationId: number, ... }
>(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
  |},
  request: GetPathWithSpecificByTreeRequest,
  finalLevel: number,
  derivationTables: Map<number, string>,
): Promise<Array<{|
  row: $ReadOnly<Row>,
  ...Addressing,
|}>> {
  const pathWithSpecific = await deps.GetPathWithSpecific.getTree<Row>(
    db, tx,
    request,
    async (derivationIds) => {
      const result = await deps.GetDerivationSpecific.get<Row>(
        db, tx,
        derivationIds,
        finalLevel,
        derivationTables,
      );
      return result;
    }
  );
  const result = pathWithSpecific.rows.map(row => {
    const path = pathWithSpecific.pathMap.get(row.KeyDerivationId);
    if (path == null) {
      throw new Error(`${nameof(rawGetDerivationsByPath)} should never happen`);
    }
    return {
      row,
      addressing: {
        path,
        startLevel: request.derivationLevel - request.commonPrefix.length + 1,
      },
    };
  });
  return result;
}

export async function rawGetAddressesByDerivationPath(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: GetPathWithSpecificByTreeRequest,
  derivationTables: Map<number, string>,
): Promise<Array<BaseAddressPath>> {
  const canonicalAddresses = await rawGetDerivationsByPath<CanonicalAddressRow>(
    db, tx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    request,
    Bip44DerivationLevels.ADDRESS.level,
    derivationTables,
  );
  const family = await deps.GetAddress.fromCanonical(
    db, tx,
    canonicalAddresses.map(addr => addr.row.KeyDerivationId),
    undefined,
  );
  return canonicalAddresses.map(canonical => {
    const addrs = family.get(canonical.row.KeyDerivationId);
    if (addrs == null) {
      throw new Error(`${nameof(rawGetAddressesByDerivationPath)} should never happen`);
    }
    return {
      ...canonical,
      addrs,
    };
  });
}

export function getLastUsedIndex(request: {|
  singleChainAddresses: Array<UtxoAddressPath>,
  usedStatus: Set<number>,
|}): number {
  request.singleChainAddresses.sort((a1, a2) => {
    const index1 = a1.addressing.path[a1.addressing.path.length - 1];
    const index2 = a2.addressing.path[a2.addressing.path.length - 1];
    return index1 - index2;
  });

  let lastUsedIndex = -1;
  for (let i = 0; i < request.singleChainAddresses.length; i++) {
    for (const addr of request.singleChainAddresses[i].addrs) {
      if (request.usedStatus.has(addr.AddressId)) {
        lastUsedIndex = i;
      }
    }
  }
  return lastUsedIndex;
}

export async function rawGetUtxoUsedStatus(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>, |},
  request: {|
    addressIds: Array<number>,
    networkId: number,
  |},
): Promise<Set<number>> {
  const outputs = await deps.GetUtxoTxOutputsWithTx.getOutputsForAddresses(
    db, tx,
    request.addressIds,
    [TxStatusCodes.IN_BLOCK],
    request.networkId
  );
  return new Set(outputs.map(output => output.UtxoTransactionOutput.AddressId));
}

export async function rawGetAddressesForDisplay(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
  |},
  request: {|
    addresses: Array<UtxoAddressPath>,
    type: CoreAddressT,
    networkId: number,
    defaultToken: DefaultTokenEntry,
  |},
): Promise<Array<{| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |}>> {
  const addressIds = request.addresses
    .flatMap(family => family.addrs)
    .filter(addr => addr.Type === request.type)
    .map(addr => addr.AddressId);
  const utxosForAddresses = await rawGetUtxoUsedStatus(
    db, tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    {
      addressIds,
      networkId: request.networkId,
    },
  );
  const utxoForAddresses = await deps.GetUtxoTxOutputsWithTx.getUtxo(
    db, tx,
    addressIds,
    request.networkId
  );
  const balanceForAddresses = getUtxoBalanceForAddresses(utxoForAddresses, request.defaultToken);

  return request.addresses.flatMap(family => family.addrs
    .filter(addr => addr.Type === request.type)
    .map(addr => {
      return {
        address: addr.Hash,
        values: balanceForAddresses[addr.AddressId],
        addressing: family.addressing,
        isUsed: utxosForAddresses.has(addr.AddressId),
        type: request.type,
      };
    }));
}

export async function rawGetChainAddressesForDisplay(
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
  |},
  request: {|
    publicDeriver: IPublicDeriver<> & IHasUtxoChains & IDisplayCutoff,
    chainsRequest: IHasUtxoChainsRequest,
    type: CoreAddressT,
  |},
  derivationTables: Map<number, string>,
): Promise<Array<{| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |}>> {
  const addresses = await request.publicDeriver.rawGetAddressesForChain(
    tx,
    {
      GetAddress: deps.GetAddress,
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetDerivationSpecific: deps.GetDerivationSpecific,
    },
    request.chainsRequest,
    derivationTables,
  );
  let belowCutoff = addresses;
  if (request.chainsRequest.chainId === ChainDerivations.EXTERNAL) {
    const cutoff = await request.publicDeriver.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    belowCutoff = addresses.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= cutoff
    ));
  }
  let addressResponse = await rawGetAddressesForDisplay(
    request.publicDeriver.getDb(), tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    {
      addresses: belowCutoff,
      type: request.type,
      networkId: request.publicDeriver.getParent().getNetworkInfo().NetworkId,
      defaultToken: request.publicDeriver.getParent().getDefaultToken(),
    },
  );
  if (request.chainsRequest.chainId === ChainDerivations.INTERNAL) {
    let bestUsed = -1;
    for (const address of addressResponse) {
      if (address.isUsed) {
        const index = address.addressing.path[address.addressing.path.length - 1];
        if (index > bestUsed) {
          bestUsed = index;
        }
      }
    }
    addressResponse = addressResponse.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= bestUsed + 1
    ));
  }
  return addressResponse;
}
export async function getChainAddressesForDisplay(
  request: {|
    publicDeriver: IPublicDeriver<ConceptualWallet & IHasLevels> & IHasUtxoChains & IDisplayCutoff,
    chainsRequest: IHasUtxoChainsRequest,
    type: CoreAddressT,
  |},
): Promise<Array<{| ...Address, ...AddressType, ...Value, ...Addressing, ...UsedStatus |}>> {
  const derivationTables = request.publicDeriver.getParent().getDerivationTables();
  const deps = Object.freeze({
    GetUtxoTxOutputsWithTx,
    GetAddress,
    GetPathWithSpecific,
    GetDerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  return await raii<PromisslessReturnType<typeof getChainAddressesForDisplay>>(
    request.publicDeriver.getDb(),
    [
      ...depTables,
      ...mapToTables(request.publicDeriver.getDb(), derivationTables),
    ],
    async tx => await rawGetChainAddressesForDisplay(tx, deps, {
      publicDeriver: request.publicDeriver,
      chainsRequest: request.chainsRequest,
      type: request.type,
    }, derivationTables)
  );
}

export type NextUnusedResponse = {|
  addressInfo: void | UtxoAddressPath,
  index: number,
|}
export async function rawGetNextUnusedIndex(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
  |},
  request:  {|
    addressesForChain: Array<UtxoAddressPath>,
    networkId: number,
  |}
): Promise<NextUnusedResponse> {
  const usedStatus = await rawGetUtxoUsedStatus(
    db, tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    {
      addressIds: request.addressesForChain
        .flatMap(address => address.addrs.map(addr => addr.AddressId)),
      networkId: request.networkId,
    }
  );
  const lastUsedIndex = getLastUsedIndex({
    singleChainAddresses: request.addressesForChain,
    usedStatus,
  });

  const nextInternalAddress = request.addressesForChain[lastUsedIndex + 1];
  if (nextInternalAddress === undefined) {
    return {
      addressInfo: undefined,
      index: lastUsedIndex + 1,
    };
  }
  return {
    addressInfo: {
      ...nextInternalAddress
    },
    index: lastUsedIndex + 1,
  };
}

export function getUtxoBalanceForAddresses(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTxOutput>>,
  defaultToken: DefaultTokenEntry,
): { [key: number]: IGetUtxoBalanceResponse, ... } {
  const groupByAddress = groupBy(
    utxos,
    utxo => utxo.UtxoTransactionOutput.AddressId
  );
  const mapping = mapValues(
    groupByAddress,
    (utxoList: Array<$ReadOnly<UtxoTxOutput>>) => getBalanceForUtxos(
      utxoList,
      defaultToken
    )
  );
  return mapping;
}

export function getTokenCountForAddresses(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTxOutput>>
): { [key: number]: TokenCount } {
  const groupByAddress = groupBy(
    utxos,
    utxo => utxo.UtxoTransactionOutput.AddressId
  );

  const mapping: { [key: number]: TokenCount } = {};

  for (const k of Object.keys(groupByAddress)) {
    const group = groupByAddress[k];
    mapping[k] = getTokenCountForUtxos(group)
  }

  return mapping;
}

export function getTokenCountForUtxos(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTxOutput>>
): TokenCount {

  const allTokens = utxos
    .reduce((prev, curr) => prev.concat(curr.tokens), [])
    .filter(t => t.Token.Identifier !== '');

  const uniqueTokens = uniqBy(
    allTokens,
    t => t.Token.Identifier
  );

  return {
    nftTypes: uniqueTokens.filter(t => t.Token.IsNFT).length,
    tokenTypes: uniqueTokens.filter(t => !t.Token.IsNFT).length
  };
}

type UtxoTokenInfo = {
  tokens: $ReadOnlyArray<$ReadOnly<{
    TokenList: $ReadOnly<{ Amount: string, ... }>,
    Token: $ReadOnly<{ Identifier: string, NetworkId: number, ... }>,
    ...
  }>>,
  ...
};
export function getBalanceForUtxos(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTokenInfo>>,
  defaultToken: DefaultTokenEntry,
): IGetUtxoBalanceResponse {
  const tokens = new MultiToken([], defaultToken);

  for (const utxo of utxos) {
    for (const token of utxo.tokens) {
      tokens.add({
        identifier: token.Token.Identifier,
        amount: new BigNumber(token.TokenList.Amount),
        networkId: token.Token.NetworkId,
      });
    }
  }
  return tokens;
}

export async function updateCutoffFromInsert(
  tx: lf$Transaction,
  deps: {|
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetDerivationSpecific: Class<GetDerivationSpecific>,
    GetDerivationsByPath: Class<GetDerivationsByPath>,
    ModifyDisplayCutoff: Class<ModifyDisplayCutoff>,
    GetKeyDerivation: Class<GetKeyDerivation>,
  |},
  request: {|
    publicDeriverLevel: number,
    displayCutoffInstance: IDisplayCutoff,
    tree: TreeInsert<any>,
  |},
  derivationTables: Map<number, string>,
): Promise<void> {
  if (request.displayCutoffInstance != null) {
    const newEntries = (() => {
      if (request.publicDeriverLevel === Bip44DerivationLevels.ACCOUNT.level) {
        const external = request.tree.find(node => node.index === ChainDerivations.EXTERNAL);
        if (external == null || external.children == null) {
          throw new Error(`${nameof(updateCutoffFromInsert)} should never happen`);
        }
        return external.children;
      }
      if (request.publicDeriverLevel === Bip44DerivationLevels.CHAIN.level) {
        return request.tree;
      }
      throw new Error(`${nameof(updateCutoffFromInsert)} incorrect pubderiver level`);
    })();
    let bestNewCutoff = 0;
    for (const child of newEntries) {
      if (child.index > bestNewCutoff) {
        bestNewCutoff = child.index;
      }
    }

    const currentCutoff = await request.displayCutoffInstance.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetDerivationSpecific: deps.GetDerivationSpecific,
      },
      undefined,
      derivationTables,
    );
    if (bestNewCutoff - BIP44_SCAN_SIZE > currentCutoff) {
      await request.displayCutoffInstance.rawSetCutoff(
        tx,
        {
          ModifyDisplayCutoff: deps.ModifyDisplayCutoff,
          GetDerivationsByPath: deps.GetDerivationsByPath,
          GetKeyDerivation: deps.GetKeyDerivation,
        },
        { newIndex: bestNewCutoff - BIP44_SCAN_SIZE },
      );
    }
  }
}

export function verifyFromDerivationRoot(request: $ReadOnly<{|
  ...$PropertyType<Addressing, 'addressing'>,
|}>): void {
  const accountPosition = request.startLevel;
  if (accountPosition !== Bip44DerivationLevels.PURPOSE.level) {
    throw new Error(`${nameof(verifyFromDerivationRoot)} addressing does not start from root`);
  }
  const lastLevelSpecified = request.startLevel + request.path.length - 1;
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`${nameof(verifyFromDerivationRoot)} incorrect addressing size`);
  }
}

// convert from storage Utxo type to Yoroi-lib Utxo type
function storageUtxoToYoroiLib(utxo: StorageUtxo): Utxo {
  return {
    ...utxo,
    assets: utxo.assets.map(
      asset => (
        {
          assetId: asset.assetId,
          policyId: asset.policyId,
          name: asset.name,
          amount: asset.amount,
        }
      )
    ),
    amount: new BigNumber(utxo.amount),
  };
}

function yoroiLibUtxoToStorage(utxo: Utxo): StorageUtxo {
  return {
    utxoId: utxo.utxoId,
    txHash: utxo.txHash,
    txIndex: utxo.txIndex,
    receiver: utxo.receiver,
    blockNum: utxo.blockNum,

    assets: utxo.assets.map(
      asset => (
        {
          assetId: asset.assetId,
          policyId: asset.policyId,
          name: asset.name,
          amount: asset.amount,
        }
      )
    ),
    amount: utxo.amount.toString(),
  };
}


export class UtxoStorageApi implements UtxoStorage {
  static depsTables: {|
    ModifyUtxoAtSafePoint: Class<ModifyUtxoAtSafePoint>,
    ModifyUtxoDiffToBestBlock: Class<ModifyUtxoDiffToBestBlock>,
    GetUtxoAtSafePoint: Class<GetUtxoAtSafePoint>,
    GetUtxoDiffToBestBlock: Class<GetUtxoDiffToBestBlock>,
  |} = Object.freeze({
    ModifyUtxoAtSafePoint, ModifyUtxoDiffToBestBlock,
    GetUtxoAtSafePoint, GetUtxoDiffToBestBlock,
  });

  conceptualWalletId: number;
  db: lf$Database;
  dbTx: lf$Transaction;

  constructor(conceptualWalletId: number) {
    this.conceptualWalletId = conceptualWalletId;
  }

  setDb(db: lf$Database): void {
    this.db = db;
  }

  setDbTx(dbTx: lf$Transaction): void {
    this.dbTx = dbTx;
  }

  async getUtxoAtSafePoint(): Promise<UtxoAtSafePoint | void> {
    const result = await GetUtxoAtSafePoint.forWallet(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
    );
    if (result) {
      // convert from storage UtxoAtSafePoint type to Yoroi-lib UtxoAtSafePoint type
      return {
        lastSafeBlockHash: result.UtxoAtSafePoint.lastSafeBlockHash,
        utxos: result.UtxoAtSafePoint.utxos.map(storageUtxoToYoroiLib),
      };
    }
    return undefined;
  }

  async getUtxoDiffToBestBlock(): Promise<UtxoDiffToBestBlock[]> {
    return (
      await GetUtxoDiffToBestBlock.forWallet(
        this.db,
        this.dbTx,
        this.conceptualWalletId,
      )
    ).map(utxoDiffToBestBlock => (
      {
        ...utxoDiffToBestBlock,
        newUtxos: utxoDiffToBestBlock.newUtxos.map(storageUtxoToYoroiLib),
      }
    ));
  }

  async replaceUtxoAtSafePoint(utxos: Utxo[], lastSafeBlockHash: string): Promise<void> {
    await ModifyUtxoAtSafePoint.addOrReplace(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
      {
        lastSafeBlockHash,
        utxos: utxos.map(yoroiLibUtxoToStorage),
      },
    );
  }


  async clearUtxoState(): Promise<void> {
    await ModifyUtxoAtSafePoint.remove(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
    );
    await ModifyUtxoDiffToBestBlock.removeAll(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
    );
  }

  async appendUtxoDiffToBestBlock(diff: UtxoDiffToBestBlock): Promise<void> {
    await ModifyUtxoDiffToBestBlock.add(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
      {
        lastBestBlockHash: diff.lastBestBlockHash,
        spentUtxoIds: diff.spentUtxoIds,
        newUtxos: diff.newUtxos.map(yoroiLibUtxoToStorage),
      },
    );
  }

  async removeDiffWithBestBlock(blockHash: string): Promise<void> {
    await ModifyUtxoDiffToBestBlock.remove(
      this.db,
      this.dbTx,
      this.conceptualWalletId,
      blockHash,
    );
  }
}
