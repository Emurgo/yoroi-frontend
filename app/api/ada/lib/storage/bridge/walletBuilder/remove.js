// @flow

import {
  getAllSchemaTables,
  raii,
} from '../../database/utils';
import type {
  IPublicDeriver,
} from '../../models/PublicDeriver/interfaces';
import {
  DeletePublicDeriver,
} from '../../database/walletTypes/core/api/write';

export async function removePublicDeriver(
  request: {| publicDeriver: IPublicDeriver<>, |},
): Promise<number> {
  const deps = Object.freeze({
    DeletePublicDeriver
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
    ],
    async dbTx => {
      await DeletePublicDeriver.delete(
        db, dbTx,
        { publicDeriverId: request.publicDeriver.getPublicDeriverId() }
      );
      // TODO delete public deriver
      // TODO: delete keys separately -- not cascaded (AKA any key not referenced)
      // TODO: delete any blocks separately?
      // TODO: wrapper deleted from key derivation cascade but not Conceptual Wallet
      // TODO: LastSyncInfoSchema
    }
  );
}
