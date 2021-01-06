// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  groupBy,
  mapValues,
} from 'lodash';

import {
  BigNumber
} from 'bignumber.js';

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
} from '../database/walletTypes/common/utils';
import {
  GetAddress,
  GetPathWithSpecific,
  GetDerivationsByPath,
  GetCertificates,
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
  CertificateForKey,
} from '../database/primitives/api/read';
import {
  GetUtxoTxOutputsWithTx,
} from '../database/transactionModels/utxo/api/read';
import { TxStatusCodes, } from '../database/primitives/enums';
import { MultiToken } from '../../../../common/lib/MultiToken';
import type { DefaultTokenEntry } from '../../../../common/lib/MultiToken';

import { ChainDerivations, BIP44_SCAN_SIZE, } from  '../../../../../config/numbersConfig';

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

export async function rawGetBip44AddressesByPath(
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
      throw new Error(`${nameof(rawGetBip44AddressesByPath)} should never happen`);
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

export function getBalanceForUtxos(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTxOutput>>,
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

export async function getCertificates(
  db: lf$Database,
  addressIds: Array<number>,
): Promise<Array<CertificateForKey>> {
  const deps = Object.freeze({
    GetCertificates,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  return await raii<PromisslessReturnType<typeof getCertificates>>(
    db,
    depTables,
    async dbTx => await deps.GetCertificates.forAddress(db, dbTx, { addressIds })
  );
}
