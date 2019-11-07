// @flow

import type { lf$Database, lf$Transaction, } from 'lovefield';
import {
  AddAddress,
} from '../lib/storage/database/primitives/api/write';
import {
  GetAddress,
} from '../lib/storage/database/primitives/api/read';

export async function foo(
  db: lf$Database,
  tx: lf$Transaction,
  deps: {|
    GetAddress: Class<GetAddress>,
    AddAddress: Class<AddAddress>,
  |},
  addresses: Array<string>,
) {
  const rows = await deps.GetAddress.getByHash(db, tx, addresses);
  const addressSet = new Set(addresses);
  for (const row of rows) {
    addressSet.delete(row.Hash);
  }
  const toAdd = Array.from(addressSet);
  
}
