// @flow

import type { lf$Database, lf$Transaction, } from 'lovefield';
import {
  ModifyAddress,
} from '../../../../ada/lib/storage/database/primitives/api/write';
import {
  GetAddress,
} from '../../../../ada/lib/storage/database/primitives/api/read';
import type {
  AddressRow, NetworkRow,
} from '../../../../ada/lib/storage/database/primitives/tables';
import type {
  CoreAddressT,
} from '../../../../ada/lib/storage/database/primitives/enums';
import { RustModule } from '../../../../ada/lib/cardanoCrypto/rustLoader';
import { CoreAddressTypes, } from '../../../../ada/lib/storage/database/primitives/enums';
import {
  addressToKind,
} from '../../../../ada/lib/storage/bridge/utils';
import { getAllTables } from '../../../../ada/lib/storage/database/utils';
import type { InsertRequest } from '../../../../ada/lib/storage/database/walletTypes/common/utils.types';

export type AddByHashRequest = {|
  ...InsertRequest,
  address: {|
    type: CoreAddressT,
    data: string,
  |},
|};
export type AddByHashFunc = AddByHashRequest => Promise<void>;

/**
 * Captures a set of address IDs
 * and allows adding new addresses by hash as long as no address in the set shares the same hash
 * Note: assumes all addresses passed to this function belong to the user's wallet
 */
export function rawGenAddByHash(
  ownAddressIds: Set<number>,
): AddByHashFunc {
  return async (
    request: AddByHashRequest
  ): Promise<void> => {
    const deps = Object.freeze({
      GetAddress, ModifyAddress
    });
    const depsTables = Array.from(
      getAllTables(...Object.keys(deps).map(key => deps[key]))
    );
    // to make sure all addresses get added in the same transaction
    // we require the tables to be locked prior to calling this function
    const locked = new Set(request.lockedTables);
    for (const table of depsTables) {
      if (!locked.has(table)) {
        throw new Error(`${nameof(rawGenAddByHash)} missing lock on ` + table);
      }
    }
    // get all existing addresses that have this hash
    const rows = await deps.GetAddress.getByHash(
      request.db, request.tx,
      [request.address.data]
    );
    // check if an address by this hash is already in our set
    for (const row of rows) {
      // if one exists, return
      if (ownAddressIds.has(row.AddressId)) {
        return;
      }
    }
    // otherwise, add this new address to the DB
    const newHashes = await deps.ModifyAddress.addFromCanonicalByHash(
      request.db, request.tx,
      [{
        ...request.address,
        keyDerivationId: request.keyDerivationId,
      }]
    );
    // after adding it to the DB, add it to our set
    for (const row of newHashes) {
      ownAddressIds.add(row.AddressId);
    }
  };
}

async function addFromCanonical(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetAddress: Class<GetAddress>,
    ModifyAddress: Class<ModifyAddress>,
  |},
  notFoundWithoutCanonical: Array<{| data: string, type: CoreAddressT |}>,
  ownAddressIds: Set<number>,
  address: {| data: string, type: CoreAddressT |},
  finalMapping: Map<string, number>,
  hash: string,
): Promise<void> {
  // TODO: make this batched
  const addressRows = (await deps.GetAddress.getByHash(db, tx, [hash]))
    .filter(addressRow => ownAddressIds.has(addressRow.AddressId));

  if (addressRows.length > 1) {
    throw new Error(`${nameof(addFromCanonical)} Should never happen multi-match`);
  } else if (addressRows.length === 0) {
    notFoundWithoutCanonical.push(address);
  } else { // addressRows.length === 1
    const keyDerivationId = await deps.GetAddress.getKeyForFamily(
      db, tx,
      addressRows[0].AddressId
    );
    if (keyDerivationId == null) throw new Error(`${nameof(addFromCanonical)} Should never happen no mapping`);
    const newAddr = await deps.ModifyAddress.addFromCanonicalByHash(db, tx, [{
      keyDerivationId,
      data: address.data,
      type: address.type,
    }]);
    finalMapping.set(address.data, newAddr[0].AddressId);
    ownAddressIds.add(newAddr[0].AddressId);
  }
}

export type FindOwnAddressRequest = {|
  db: lf$Database,
  tx: lf$Transaction,
  lockedTables: Array<string>,
  hash: string,
|};
export type FindOwnAddressFunc = FindOwnAddressRequest => Promise<number | void>;

export function rawGenFindOwnAddress(
  ownAddressIds: Set<number>,
): FindOwnAddressFunc {
  return async (
    request: FindOwnAddressRequest
  ): Promise<number | void> => {
    const deps = Object.freeze({
      GetAddress,
    });
    const depsTables = Array.from(
      getAllTables(...Object.keys(deps).map(key => deps[key]))
    );
    // to make sure all addresses get added in the same transaction
    // we require the tables to be locked prior to calling this function
    const locked = new Set(request.lockedTables);
    for (const table of depsTables) {
      if (!locked.has(table)) {
        throw new Error(`${nameof(rawGenFindOwnAddress)} missing lock on ` + table);
      }
    }

    const rows = await deps.GetAddress.getByHash(request.db, request.tx, [request.hash]);
    for (const row of rows) {
      if (ownAddressIds.has(row.AddressId)) {
        return row.AddressId;
      }
    }
    return undefined;
  };
}

export type HashToIdsRequest = {|
  db: lf$Database,
  tx: lf$Transaction,
  lockedTables: Array<string>,
  hashes: Array<string>,
|};
export type HashToIdsFunc = HashToIdsRequest => Promise<Map<string, number>>;
/**
 * Captures a set of address IDs
 * and allows adding new addresses by hash as long as no address in the set shares the same hash
 * Note: this function uses special logic for adding address for transaction syncing purposes
 * ex: handles adding foreign addresses (that don't belong to your wallet)
 * ex: handles the difference between base/enterprise addresses or group/single
 */

export const rawGenHashToIdsFunc = (
  ownAddressIds: Set<number>,
  network: $ReadOnly<NetworkRow>,
): HashToIdsFunc => RustModule.WasmScope(
    Scope => _rawGenHashToIdsFunc(Scope, ownAddressIds, network)
  );

function _rawGenHashToIdsFunc(
  Scope: typeof RustModule,
  ownAddressIds: Set<number>,
  network: $ReadOnly<NetworkRow>,
): HashToIdsFunc {
  return async (
    request: HashToIdsRequest
  ): Promise<Map<string, number>> => {
    const deps = Object.freeze({
      GetAddress, ModifyAddress
    });
    const depsTables = Array.from(
      getAllTables(...Object.keys(deps).map(key => deps[key]))
    );
    // to make sure all addresses get added in the same transaction
    // we require the tables to be locked prior to calling this function
    const locked = new Set(request.lockedTables);
    for (const table of depsTables) {
      if (!locked.has(table)) {
        throw new Error(`${nameof(rawGenHashToIdsFunc)} missing lock on ` + table);
      }
    }

    const dedupedHashes = Array.from(new Set(request.hashes));
    const rows = await deps.GetAddress.getByHash(request.db, request.tx, dedupedHashes);
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
    const notFound: Array<string> = [];
    const finalMapping: Map<string, number> = new Map();
    for (const address of dedupedHashes) {
      if (addressRowMap.has(address)) {
        const ids = addressRowMap.get(address);
        if (ids == null) throw new Error('should never happen');
        const ownId = ids.filter(id => ownAddressIds.has(id.AddressId));
        if (ownId.length > 1) {
          throw new Error(`${nameof(rawGenHashToIdsFunc)} Address associated multiple times with same wallet`);
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
    const notFoundWithoutCanonical: Array<{| data: string, type: CoreAddressT |}> = [];
    const addressWithType = notFound.map(addr => ({
      data: addr,
      type: addressToKind(addr, 'bytes', network),
    }));
    for (const address of addressWithType) {
      if (address.type === CoreAddressTypes.CARDANO_BASE) {
        // for group addresses we have to look at the payment key
        // to see if there exists a canonical address
        const wasmAddress = Scope.WalletV4.Address.from_hex(address.data);
        const baseAddress = Scope.WalletV4.BaseAddress.from_address(wasmAddress);
        if (baseAddress == null) throw new Error(`${nameof(rawGenHashToIdsFunc)} not base address Should never happen`);
        const canonical = Scope.WalletV4.EnterpriseAddress.new(
          wasmAddress.network_id(),
          baseAddress.payment_cred()
        );
        const hash = canonical.to_address().to_hex();
        await addFromCanonical(
          request.db,
          request.tx,
          deps,
          notFoundWithoutCanonical,
          ownAddressIds,
          address,
          finalMapping,
          hash
        );
      } else if (address.type === CoreAddressTypes.CARDANO_PTR) {
        // for group addresses we have to look at the payment key
        // to see if there exists a canonical address
        const wasmAddress = Scope.WalletV4.Address.from_hex(address.data);
        const ptrAddress = Scope.WalletV4.PointerAddress.from_address(wasmAddress);
        if (ptrAddress == null) throw new Error(`${nameof(rawGenHashToIdsFunc)} not ptr address Should never happen`);
        const canonical = Scope.WalletV4.EnterpriseAddress.new(
          wasmAddress.network_id(),
          ptrAddress.payment_cred()
        );
        const hash = canonical.to_address().to_hex();
        await addFromCanonical(
          request.db,
          request.tx,
          deps,
          notFoundWithoutCanonical,
          ownAddressIds,
          address,
          finalMapping,
          hash
        );
      } else {
        notFoundWithoutCanonical.push(address);
      }
    }
    // note: must be foreign
    // because we should have synced address history before ever calling this
    const newEntries = await deps.ModifyAddress.addForeignByHash(
      request.db, request.tx,
      notFoundWithoutCanonical
    );
    for (let i = 0; i < notFoundWithoutCanonical.length; i++) {
      finalMapping.set(notFoundWithoutCanonical[i].data, newEntries[i].AddressId);
    }
    return finalMapping;
  };
}
