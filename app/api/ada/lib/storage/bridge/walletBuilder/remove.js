// @flow

import {
  getAllSchemaTables,
  raii,
} from '../../database/utils';
import type {
  IPublicDeriver,
} from '../../models/PublicDeriver/interfaces';
import {
  RemovePublicDeriver,
  ModifyConceptualWallet,
} from '../../database/walletTypes/core/api/write';
import type { IConceptualWallet } from '../../models/ConceptualWallet/interfaces';

export async function removePublicDeriver(request: {|
  publicDeriver: IPublicDeriver<>,
  /** removes parent if specified */
  conceptualWallet: void | IConceptualWallet,
|}): Promise<number> {
  const deps = Object.freeze({
    RemovePublicDeriver,
    ModifyConceptualWallet,
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
      await deps.RemovePublicDeriver.remove(
        db, dbTx,
        { publicDeriverId: request.publicDeriver.getPublicDeriverId() }
      );
      if (request.conceptualWallet != null) {
        await request.conceptualWallet.rawRemove(db, dbTx);
      }
      // TODO: delete any blocks separately?
    }
  );
}
