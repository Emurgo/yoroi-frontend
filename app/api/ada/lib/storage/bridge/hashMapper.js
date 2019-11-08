// @flow

import type { lf$Database, lf$Transaction, } from 'lovefield';
import {
  AddAddress,
} from '../database/primitives/api/write';
import {
  GetAddress,
} from '../database/primitives/api/read';
import type {
  AddressRow, CoreAddressT,
} from '../database/primitives/tables';
import { RustModule } from '../../cardanoCrypto/rustLoader';
import { CoreAddressTypes, } from '../database/primitives/tables';
import {
  addressToKind,
} from './utils';

export type AddByHashFunc = {|
  type: CoreAddressT,
  keyDerivationId: number,
  data: string,
|} => Promise<void>;
export function rawGenAddByHash(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetAddress: Class<GetAddress>,
    AddAddress: Class<AddAddress>,
  |},
  ownAddressIds: Set<number>,
) {
  return async (
    address: {|
      type: CoreAddressT,
      keyDerivationId: number,
      data: string,
    |}
  ): Promise<void> => {
    const rows = await deps.GetAddress.getByHash(db, tx, [address.data]);
    for (const row of rows) {
      if (ownAddressIds.has(row.AddressId)) {
        return;
      }
    }
    await deps.AddAddress.addFromCanonicalByHash(db, tx, [address]);
  };
}

export type HashToIdsFunc = Array<string> => Promise<Map<string, number>>;
export function rawGenHashToIdsFunc(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetAddress: Class<GetAddress>,
    AddAddress: Class<AddAddress>,
  |},
  ownAddressIds: Set<number>,
): HashToIdsFunc {
  return async (
    hashes: Array<string>
  ): Promise<Map<string, number>> => {
    const dedupedHashes = Array.from(new Set(hashes));
    const rows = await deps.GetAddress.getByHash(db, tx, dedupedHashes);
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
    const notFoundWithoutCanonical = [];
    const addressWithType = notFound.map(addr => ({
      data: addr,
      type: addressToKind(addr),
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
        const addressRows = (await deps.GetAddress.getByHash(db, tx, [hash]))
          .filter(addressRow => ownAddressIds.has(addressRow.AddressId));

        if (addressRows.length > 1) {
          throw new Error('rawGenHashToIdsFunc Should never happen multi-match');
        } else if (addressRows.length === 0) {
          notFoundWithoutCanonical.push(address);
        } else {
          const keyDerivationId = await deps.GetAddress.getKeyForFamily(
            db, tx,
            addressRows[0].AddressId
          );
          if (keyDerivationId == null) throw new Error('rawGenHashToIdsFunc Should never happen no mapping');
          const newAddr = await deps.AddAddress.addFromCanonicalByHash(db, tx, [{
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
    const newEntries = await deps.AddAddress.addForeignByHash(
      db, tx,
      addressWithType
    );
    for (let i = 0; i < newEntries.length; i++) {
      finalMapping.set(notFound[i], newEntries[i].AddressId);
    }
    return finalMapping;
  };
}
