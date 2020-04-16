// @flow

import type { lf$Database, lf$Transaction, } from 'lovefield';
import {
  ModifyAddress,
} from '../database/primitives/api/write';
import {
  GetAddress,
} from '../database/primitives/api/read';
import type {
  AddressRow,
} from '../database/primitives/tables';
import type {
  CoreAddressT,
} from '../database/primitives/enums';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { CoreAddressTypes, } from '../database/primitives/enums';
import {
  addressToKind,
} from './utils';
import { getAllTables } from '../database/utils';
import type { InsertRequest } from '../database/walletTypes/common/utils';

export type AddByHashRequest = {|
  ...InsertRequest,
  address: {|
    type: CoreAddressT,
    data: string,
  |},
|};
export type AddByHashFunc = AddByHashRequest => Promise<void>;
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
    const locked = new Set(request.lockedTables);
    for (const table of depsTables) {
      if (!locked.has(table)) {
        throw new Error('rawGenAddByHash missing lock on ' + table);
      }
    }
    const rows = await deps.GetAddress.getByHash(
      request.db, request.tx,
      [request.address.data]
    );
    for (const row of rows) {
      if (ownAddressIds.has(row.AddressId)) {
        return;
      }
    }
    const newHashes = await deps.ModifyAddress.addFromCanonicalByHash(
      request.db, request.tx,
      [{
        ...request.address,
        keyDerivationId: request.keyDerivationId,
      }]
    );

    for (const row of newHashes) {
      ownAddressIds.add(row.AddressId);
    }
  };
}

export type HashToIdsRequest = {|
  db: lf$Database,
  tx: lf$Transaction,
  lockedTables: Array<string>,
  hashes: Array<string>,
|};
export type HashToIdsFunc = HashToIdsRequest => Promise<Map<string, number>>;
export function rawGenHashToIdsFunc(
  ownAddressIds: Set<number>,
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
    const locked = new Set(request.lockedTables);
    for (const table of depsTables) {
      if (!locked.has(table)) {
        throw new Error('rawGenAddByHash missing lock on ' + table);
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
    const notFoundWithoutCanonical: Array<{| data: string, type: CoreAddressT |}> = [];
    const addressWithType = notFound.map(addr => ({
      data: addr,
      type: addressToKind(addr, 'bytes'),
    }));
    for (const address of addressWithType) {
      if (address.type !== CoreAddressTypes.SHELLEY_GROUP) {
        notFoundWithoutCanonical.push(address);
      } else {
        // for group addresses we have to look at the payment key
        // to see if there exists a canonical address
        const wasmAddress = RustModule.WalletV3.Address.from_bytes(
          Buffer.from(address.data, 'hex')
        );
        const groupAddress = wasmAddress.to_group_address();
        if (groupAddress == null) throw new Error('rawGenHashToIdsFunc Should never happen');
        const canonical = RustModule.WalletV3.Address.single_from_public_key(
          groupAddress.get_spending_key(),
          wasmAddress.get_discrimination()
        );
        const hash = Buffer.from(canonical.as_bytes()).toString('hex');
        // TODO: make this batched
        const addressRows = (await deps.GetAddress.getByHash(request.db, request.tx, [hash]))
          .filter(addressRow => ownAddressIds.has(addressRow.AddressId));

        if (addressRows.length > 1) {
          throw new Error('rawGenHashToIdsFunc Should never happen multi-match');
        } else if (addressRows.length === 0) {
          notFoundWithoutCanonical.push(address);
        } else {
          const keyDerivationId = await deps.GetAddress.getKeyForFamily(
            request.db, request.tx,
            addressRows[0].AddressId
          );
          if (keyDerivationId == null) throw new Error('rawGenHashToIdsFunc Should never happen no mapping');
          const newAddr = await deps.ModifyAddress.addFromCanonicalByHash(request.db, request.tx, [{
            keyDerivationId,
            data: address.data,
            type: CoreAddressTypes.SHELLEY_GROUP,
          }]);
          finalMapping.set(address.data, newAddr[0].AddressId);
          ownAddressIds.add(newAddr[0].AddressId);
        }
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
