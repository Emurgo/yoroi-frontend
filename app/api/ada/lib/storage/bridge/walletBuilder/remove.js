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
  DeleteAllTransactions,
} from '../../database/walletTypes/core/api/write';
import type { IConceptualWallet } from '../../models/ConceptualWallet/interfaces';
import {
  ConceptualWallet
} from '../../models/ConceptualWallet/index';
import {
  asHasLevels,
} from '../../models/PublicDeriver/traits';
import { rawRemoveAllTransactions } from '../updateTransactions';
import {
  GetAddress,
  GetPathWithSpecific,
} from '../../database/primitives/api/read';
import { ModifyAddress } from '../../database/primitives/api/write';
import {
  AssociateTxWithIOs
} from '../../database/transactionModels/multipart/api/read';
import { GetDerivationSpecific, } from '../../database/walletTypes/common/api/read';
import { rawGetAddressRowsForWallet } from '../traitUtils';

export async function removePublicDeriver(request: {|
  publicDeriver: IPublicDeriver<>,
  /** removes parent if specified */
  conceptualWallet: void | IConceptualWallet,
|}): Promise<number> {
  const deps = Object.freeze({
    RemovePublicDeriver,
    ModifyConceptualWallet,
    GetPathWithSpecific,
    GetAddress,
    AssociateTxWithIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
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
      const withLevels = asHasLevels<ConceptualWallet>(request.publicDeriver);
      if (withLevels != null) {
        // 1) remove transactions
        const relatedIds = await rawRemoveAllTransactions(
          db, dbTx,
          {
            GetPathWithSpecific,
            GetAddress,
            AssociateTxWithIOs,
            GetDerivationSpecific,
            DeleteAllTransactions,
          },
          withLevels.getParent().getDerivationTables(),
          {
            publicDeriver: withLevels,
          }
        );

        // 2) remove addresses
        // note: this won't actually delete all addresses
        // only wallets associated with this wallet
        const addresses = await rawGetAddressRowsForWallet(
          dbTx,
          {
            GetPathWithSpecific,
            GetAddress,
            GetDerivationSpecific,
          },
          { publicDeriver: request.publicDeriver },
          withLevels.getParent().getDerivationTables(),
        );
        const walletAddressIds = Object.keys(addresses)
          .flatMap(key => addresses[key])
          .map(row => row.AddressId);

        const addressIdsInTxs = Object.keys(relatedIds.addressIds)
          .flatMap(key => relatedIds.addressIds[key]);
        await deps.ModifyAddress.remove(
          db, dbTx,
          [
            // a) include all address for this wallet
            ...walletAddressIds,
            // b) include addresses that are in txs for this wallet but don't belong to you
            ...addressIdsInTxs,
          ]
        );
      }
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
