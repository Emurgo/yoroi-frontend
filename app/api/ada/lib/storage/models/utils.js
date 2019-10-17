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
  PathWithAddrAndRow,
  IGetAllUtxos,
  IGetUtxoBalanceResponse,
  IHasChainsRequest,
  IGetNextUnusedForChainResponse,
  IHasChains,
  IDisplayCutoff,
} from './PublicDeriver/interfaces';
import { PublicDeriver, asDisplayCutoff, } from './PublicDeriver/index';
import { Bip44Wallet, } from './Bip44Wallet/index';

import type {
  IChangePasswordRequest, IChangePasswordResponse,
  Address, Value, Addressing, UsedStatus,
} from './common/interfaces';

import type { AddressRow, KeyInsert, KeyRow, } from '../database/primitives/tables';
import {
  UpdateGet, GetOrAddAddress,
} from '../database/primitives/api/write';
import {
  GetAddress,
  GetPathWithSpecific,
} from '../database/primitives/api/read';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import {
  GetAllBip44Wallets,
  GetBip44DerivationSpecific,
} from '../database/bip44/api/read';
import type { UtxoTxOutput } from '../database/utxoTransactions/api/read';
import type { UtxoTransactionOutputRow } from '../database/utxoTransactions/tables';
import { Bip44DerivationLevels } from '../database/bip44/api/utils';
import type { GetPathWithSpecificByTreeRequest } from '../database/primitives/api/read';
import type {
  Bip44AddressRow,
} from '../database/bip44/tables';
import {
  GetUtxoTxOutputsWithTx,
} from '../database/utxoTransactions/api/read';
import { TxStatusCodes } from '../database/primitives/tables';

import { WrongPassphraseError } from '../../cardanoCrypto/cryptoErrors';

import { RustModule } from '../../cardanoCrypto/rustLoader';

import { EXTERNAL, INTERNAL, } from  '../../../../../config/numbersConfig';
import {
  encryptWithPassword,
  decryptWithPassword,
} from '../../../../../utils/passwordCipher';
import type { ConfigType } from '../../../../../../config/config-types';

declare var CONFIG: ConfigType;
const protocolMagic = CONFIG.network.protocolMagic;

export type ToAbsoluteSlotNumberRequest = {
  epoch: number,
  slot: number,
};
export type ToAbsoluteSlotNumberResponse = number;
export type ToAbsoluteSlotNumberFunc = (
  request: ToAbsoluteSlotNumberRequest
) => ToAbsoluteSlotNumberResponse;

export async function genToAbsoluteSlotNumber(): Promise<ToAbsoluteSlotNumberFunc> {
  // TODO: Cardano in the future will have a variable epoch size
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: ToAbsoluteSlotNumberRequest) => {
    return (21600 * request.epoch) + request.slot;
  };
}

export type TimeSinceGenesisRequest = {
  absoluteSlot: number,
};
export type TimeSinceGenesisResponse = number;
export type TimeSinceGenesisRequestFunc = (
  request: TimeSinceGenesisRequest
) => TimeSinceGenesisResponse;
export async function genTimeSinceGenesis(): Promise<TimeSinceGenesisRequestFunc> {
  // TODO: Cardano in the future will have a variable slot length
  // and sidechains/networks can have different epoch sizes
  // so this needs to come from a DB
  return (request: TimeSinceGenesisRequest) => {
    return (20 * request.absoluteSlot);
  };
}

export function normalizeToPubDeriverLevel(request: {
  privateKeyRow: $ReadOnly<KeyRow>,
  password: null | string,
  path: Array<number>,
  version: number,
}): {
  prvKeyHex: string,
  pubKeyHex: string,
} {
  if (request.version === 2) {
    const prvKey = decryptKey(
      request.privateKeyRow,
      request.password,
    );
    const wasmKey = RustModule.WalletV2.PrivateKey.from_hex(prvKey);
    const newKey = deriveKeyV2(
      wasmKey,
      request.path,
    );
    return {
      prvKeyHex: newKey.to_hex(),
      pubKeyHex: newKey.public().to_hex()
    };
  }
  throw new Error('normalizeToPubDeriverLevel Only v2 supported for now');
}

export function decryptKey(
  keyRow: $ReadOnly<KeyRow>,
  password: null | string,
): string {
  let rawKey;
  if (keyRow.IsEncrypted) {
    if (password === null) {
      throw new WrongPassphraseError();
    }
    const keyBytes = decryptWithPassword(password, keyRow.Hash);
    rawKey = Buffer.from(keyBytes).toString('hex');

  } else {
    rawKey = keyRow.Hash;
  }
  return rawKey;
}


export function deriveKeyV2(
  startingKey: RustModule.WalletV2.PrivateKey,
  pathToPublic: Array<number>,
): RustModule.WalletV2.PrivateKey {
  let currKey = startingKey;
  for (let i = 0; i < pathToPublic.length; i++) {
    currKey = currKey.derive(
      RustModule.WalletV2.DerivationScheme.v2(),
      pathToPublic[i],
    );
  }

  return currKey;
}

export type KeyInfo = {
  password: string | null,
  lastUpdate: Date | null
};
export function toKeyInsert(
  keyInfo: KeyInfo,
  keyHex: string,
): KeyInsert {
  const hash = keyInfo.password != null
    ? encryptWithPassword(
      keyInfo.password,
      Buffer.from(keyHex, 'hex')
    )
    : keyHex;

  return {
    Hash: hash,
    IsEncrypted: keyInfo.password != null,
    PasswordLastUpdate: keyInfo.lastUpdate,
  };
}


export async function rawGetDerivationsByPath<
  Row: { +KeyDerivationId: number }
>(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
  |},
  request: GetPathWithSpecificByTreeRequest,
  level: number,
): Promise<Array<{|
  row: $ReadOnly<Row>,
  ...Addressing,
|}>> {
  const pathWithSpecific = await deps.GetPathWithSpecific.getTree<Row>(
    db, tx,
    request,
    async (derivationIds) => {
      const result = await deps.GetBip44DerivationSpecific.get<Row>(
        db, tx,
        derivationIds,
        level,
      );
      return result;
    }
  );
  const result = pathWithSpecific.rows.map(row => {
    const path = pathWithSpecific.pathMap.get(row.KeyDerivationId);
    if (path == null) {
      throw new Error('getDerivationsByPath should never happen');
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

export type HashToIdsFunc = Array<string> => Promise<Map<string, number>>;
export function rawGenHashToIdsFunc(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| GetOrAddAddress: Class<GetOrAddAddress> |},
  ownAddressIds: Set<number>,
): HashToIdsFunc {
  return async (
    hashes: Array<string>
  ): Promise<Map<string, number>> => {
    const rows = await deps.GetOrAddAddress.getByHash(db, tx, hashes);
    const addressRowMap: Map<string, Array<$ReadOnly<AddressRow>>> = rows.reduce(
      (map, nextElement) => {
        const array = map.get(nextElement.Hash) || [];
        map.set(
          nextElement.Hash,
          [...array, nextElement]
        );
        return map;
      },
      new Map()
    );
    const notFound = [];
    const finalMapping: Map<string, number> = new Map();
    for (const address of hashes) {
      if (addressRowMap.has(address)) {
        const ids = addressRowMap.get(address);
        if (ids == null) throw new Error('should never happen');
        const ownId = ids.filter(id => ownAddressIds.has(id.AddressId));
        if (ownId.length > 1) {
          throw new Error('Address associated multiple times with same wallet');
        }
        if (ownId.length === 1) {
          finalMapping.set(address, ownId[0].AddressId);
          continue;
        }
        // length = 0
        notFound.push(address);
      } else {
        notFound.push(address);
      }
    }
    const newEntries = await deps.GetOrAddAddress.addByHash(db, tx, notFound);
    for (let i = 0; i < newEntries.length; i++) {
      finalMapping.set(notFound[i], newEntries[i].AddressId);
    }
    return finalMapping;
  };
}

export async function rawGetBip44AddressesByPath(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetAddress: Class<GetAddress>,
    GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
  },
  request: GetPathWithSpecificByTreeRequest,
): Promise<Array<{|
  row: $ReadOnly<Bip44AddressRow>,
  ...Addressing,
  addr: $ReadOnly<AddressRow>
|}>> {
  const bip44Addresses = await rawGetDerivationsByPath<Bip44AddressRow>(
    db, tx,
    {
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
    },
    request,
    Bip44DerivationLevels.ADDRESS.level,
  );
  // Note: simple get since we know these addresses exist
  const addressRows = await deps.GetAddress.getById(
    db, tx,
    bip44Addresses.map(row => row.row.AddressId),
  );
  const infoMap = new Map<number, $ReadOnly<AddressRow>>(
    addressRows.map(row => [row.AddressId, row])
  );

  return bip44Addresses.map(row => {
    const info = infoMap.get(row.row.AddressId);
    if (info == null) {
      throw new Error('getBip44AddressesByPath should never happen');
    }
    return {
      ...row,
      addr: info,
    };
  });
}

export function getLastUsedIndex(request: {
  singleChainAddresses: Array<PathWithAddrAndRow>,
  usedStatus: Set<number>,
}): number {
  request.singleChainAddresses.sort((a1, a2) => {
    const index1 = a1.addressing.path[a1.addressing.path.length - 1];
    const index2 = a2.addressing.path[a2.addressing.path.length - 1];
    return index1 - index2;
  });

  let lastUsedIndex = -1;
  for (let i = 0; i < request.singleChainAddresses.length; i++) {
    if (request.usedStatus.has(request.singleChainAddresses[i].row.AddressId)) {
      lastUsedIndex = i;
    }
  }
  return lastUsedIndex;
}

export async function rawGetUtxoUsedStatus(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {| GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>, |},
  request: {
    addressIds: Array<number>,
  },
): Promise<Set<number>> {
  const outputs = await deps.GetUtxoTxOutputsWithTx.getOutputsForAddresses(
    db, tx,
    request.addressIds,
    [TxStatusCodes.IN_BLOCK]
  );
  return new Set(outputs.map(output => output.UtxoTransactionOutput.AddressId));
}

export async function rawGetAddressesForDisplay(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
  |},
  request: {
    addresses: Array<PathWithAddrAndRow>,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  const addressIds = request.addresses.map(address => address.addr.AddressId);
  const utxosForAddresses = await rawGetUtxoUsedStatus(
    db, tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    { addressIds },
  );
  const utxoForAddresses = await deps.GetUtxoTxOutputsWithTx.getUtxo(
    db, tx,
    addressIds,
  );
  const balanceForAddresses = getUtxoBalanceForAddresses(utxoForAddresses);

  return request.addresses.map(info => ({
    address: info.addr.Hash,
    value: balanceForAddresses[info.addr.AddressId],
    addressing: info.addressing,
    isUsed: utxosForAddresses.has(info.addr.AddressId),
  }));
}

export async function rawGetChainAddressesForDisplay(
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
  |},
  request: {
    publicDeriver: IPublicDeriver & IHasChains & IDisplayCutoff,
    chainsRequest: IHasChainsRequest,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  const addresses = await request.publicDeriver.rawGetAddressesForChain(
    tx,
    {
      GetAddress: deps.GetAddress,
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
    },
    request.chainsRequest
  );
  let belowCutoff = addresses;
  if (request.chainsRequest.chainId === EXTERNAL) {
    const cutoff = await request.publicDeriver.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      undefined,
    );
    belowCutoff = addresses.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= cutoff
    ));
  }
  let addressResponse = await rawGetAddressesForDisplay(
    request.publicDeriver.getDb(), tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    { addresses: belowCutoff },
  );
  if (request.chainsRequest.chainId === INTERNAL) {
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
  request: {
    publicDeriver: IPublicDeriver & IHasChains & IDisplayCutoff,
    chainsRequest: IHasChainsRequest,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  const deps = Object.freeze({
    GetUtxoTxOutputsWithTx,
    GetAddress,
    GetPathWithSpecific,
    GetBip44DerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  return await raii(
    request.publicDeriver.getDb(),
    depTables,
    async tx => await rawGetChainAddressesForDisplay(tx, deps, request)
  );
}
export async function rawGetAllAddressesForDisplay(
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
    GetAddress: Class<GetAddress>,
    GetPathWithSpecific: Class<GetPathWithSpecific>,
    GetBip44DerivationSpecific: Class<GetBip44DerivationSpecific>,
  |},
  request: {
    publicDeriver: IPublicDeriver & IGetAllUtxos,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  let addresses = await request.publicDeriver.rawGetAllUtxoAddresses(
    tx,
    {
      GetAddress: deps.GetAddress,
      GetPathWithSpecific: deps.GetPathWithSpecific,
      GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
    },
    undefined,
  );
  // when public deriver level = chain we still have a display cutoff
  const hasCutoff = asDisplayCutoff(request.publicDeriver);
  if (hasCutoff != null) {
    const cutoff = await hasCutoff.rawGetCutoff(
      tx,
      {
        GetPathWithSpecific: deps.GetPathWithSpecific,
        GetBip44DerivationSpecific: deps.GetBip44DerivationSpecific,
      },
      undefined,
    );
    addresses = addresses.filter(address => (
      address.addressing.path[address.addressing.path.length - 1] <= cutoff
    ));
  }
  return await rawGetAddressesForDisplay(
    request.publicDeriver.getDb(), tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    { addresses },
  );
}
export async function getAllAddressesForDisplay(
  request: {
    publicDeriver: IPublicDeriver & IGetAllUtxos,
  },
): Promise<Array<{| ...Address, ...Value, ...Addressing, ...UsedStatus |}>> {
  const deps = Object.freeze({
    GetUtxoTxOutputsWithTx,
    GetAddress,
    GetPathWithSpecific,
    GetBip44DerivationSpecific,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.publicDeriver.getDb(), table));
  return await raii(
    request.publicDeriver.getDb(),
    depTables,
    async tx => await rawGetAllAddressesForDisplay(
      tx,
      deps,
      request,
    )
  );
}

export async function rawGetNextUnusedIndex(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetUtxoTxOutputsWithTx: Class<GetUtxoTxOutputsWithTx>,
  |},
  request:  {|
    addressesForChain: Array<PathWithAddrAndRow>,
  |}
): Promise<IGetNextUnusedForChainResponse> {
  const usedStatus = await rawGetUtxoUsedStatus(
    db, tx,
    { GetUtxoTxOutputsWithTx: deps.GetUtxoTxOutputsWithTx },
    { addressIds: request.addressesForChain.map(address => address.addr.AddressId) }
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
): { [key: number]: IGetUtxoBalanceResponse } {
  const groupByAddress = groupBy(
    utxos,
    utxo => utxo.UtxoTransactionOutput.AddressId
  );
  const mapping = mapValues(
    groupByAddress,
    (utxoList: Array<$ReadOnly<UtxoTxOutput>>) => getBalanceForUtxos(
      utxoList.map(utxo => utxo.UtxoTransactionOutput)
    )
  );
  return mapping;
}

export function getBalanceForUtxos(
  utxos: $ReadOnlyArray<$ReadOnly<UtxoTransactionOutputRow>>,
): IGetUtxoBalanceResponse {
  const amounts = utxos.map(utxo => new BigNumber(utxo.Amount));
  const total = amounts.reduce(
    (acc, amount) => acc.plus(amount),
    new BigNumber(0)
  );
  return total;
}

export async function rawChangePassword(
  db: lf$Database,
  tx: lf$Transaction,
  deps: { UpdateGet: Class<UpdateGet> },
  request: IChangePasswordRequest & {
    oldKeyRow: $ReadOnly<KeyRow>,
  },
): Promise<IChangePasswordResponse> {
  const decryptedKey = decryptKey(
    request.oldKeyRow,
    request.oldPassword,
  );

  let newKey = decryptedKey;
  if (request.newPassword !== null) {
    newKey = encryptWithPassword(
      request.newPassword,
      Buffer.from(decryptedKey, 'hex'),
    );
  }

  const newRow: KeyRow = {
    KeyId: request.oldKeyRow.KeyId,
    Hash: newKey,
    IsEncrypted: request.newPassword !== null,
    PasswordLastUpdate: request.currentTime,
  };

  return await deps.UpdateGet.update(
    db, tx,
    newRow,
  );
}

export async function loadWalletsFromStorage(
  db: lf$Database,
): Promise<Array<PublicDeriver>> {
  const deps = Object.freeze({
    GetAllBip44Wallets,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const bip44Wallets = await raii(
    db,
    depTables,
    async tx => deps.GetAllBip44Wallets.get(db, tx)
  );
  const bip44Map = new Map<number, Bip44Wallet>();
  const result = [];
  for (const entry of bip44Wallets) {
    let bip44Wallet = bip44Map.get(entry.Bip44Wrapper.Bip44WrapperId);
    if (bip44Wallet == null) {
      bip44Wallet = await Bip44Wallet.createBip44Wallet(
        db,
        entry.Bip44Wrapper,
        protocolMagic,
      );
      bip44Map.set(entry.Bip44Wrapper.Bip44WrapperId, bip44Wallet);
    }
    const publicDeriver = await PublicDeriver.createPublicDeriver(
      entry.PublicDeriver,
      bip44Wallet,
    );
    result.push(publicDeriver);
  }
  return result;
}
