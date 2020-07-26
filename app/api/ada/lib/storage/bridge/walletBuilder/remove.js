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
import { rawRemoveAllTransactions as cardanoRawRemoveAllTransactions } from '../updateTransactions';
import { rawRemoveAllTransactions as jormungandrRawRemoveAllTransactions } from '../../../../../jormungandr/lib/storage/bridge/updateTransactions';
import {
  GetAddress,
  GetPathWithSpecific,
  GetTransaction,
} from '../../database/primitives/api/read';
import { ModifyAddress, FreeBlocks, } from '../../database/primitives/api/write';
import { AssociateTxWithUtxoIOs, } from '../../database/transactionModels/utxo/api/read';
import { AssociateTxWithAccountingIOs, } from '../../database/transactionModels/account/api/read';
import {
  CardanoByronAssociateTxWithIOs,
  CardanoShelleyAssociateTxWithIOs,
  JormungandrAssociateTxWithIOs,
} from '../../database/transactionModels/multipart/api/read';
import { GetDerivationSpecific, } from '../../database/walletTypes/common/api/read';
import { rawGetAddressRowsForWallet } from '../traitUtils';
import { isCardanoHaskell, isJormungandr, } from '../../database/prepackaged/networks';


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
    CardanoByronAssociateTxWithIOs,
    JormungandrAssociateTxWithIOs,
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
    GetTransaction,
    FreeBlocks,
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

        const network = request.publicDeriver.getParent().getNetworkInfo();
        if (isCardanoHaskell(network)) {
          await cardanoRawRemoveAllTransactions(
            db, dbTx,
            {
              GetPathWithSpecific: deps.GetPathWithSpecific,
              GetAddress: deps.GetAddress,
              CardanoByronAssociateTxWithIOs: deps.CardanoByronAssociateTxWithIOs,
              CardanoShelleyAssociateTxWithIOs: deps.CardanoShelleyAssociateTxWithIOs,
              AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
              AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
              GetDerivationSpecific: deps.GetDerivationSpecific,
              DeleteAllTransactions: deps.DeleteAllTransactions,
              ModifyAddress: deps.ModifyAddress,
              GetTransaction: deps.GetTransaction,
              FreeBlocks: deps.FreeBlocks,
            },
            withLevels.getParent().getDerivationTables(),
            {
              publicDeriver: withLevels,
            }
          );
        } else if (isJormungandr(network)) {
          await jormungandrRawRemoveAllTransactions(
            db, dbTx,
            {
              GetPathWithSpecific: deps.GetPathWithSpecific,
              GetAddress: deps.GetAddress,
              JormungandrAssociateTxWithIOs: deps.JormungandrAssociateTxWithIOs,
              AssociateTxWithAccountingIOs: deps.AssociateTxWithAccountingIOs,
              AssociateTxWithUtxoIOs: deps.AssociateTxWithUtxoIOs,
              GetDerivationSpecific: deps.GetDerivationSpecific,
              DeleteAllTransactions: deps.DeleteAllTransactions,
              ModifyAddress: deps.ModifyAddress,
              GetTransaction: deps.GetTransaction,
              FreeBlocks: deps.FreeBlocks,
            },
            withLevels.getParent().getDerivationTables(),
            {
              publicDeriver: withLevels,
            }
          );
        } else {
          throw new Error(`${nameof(removePublicDeriver)} No implementation for wallet removal`);
        }

        // 2) remove addresses
        // note: this won't actually delete all addresses
        // only wallets associated with this wallet
        // we depend on other things (like transaction deletion)
        // to delete addresses only kept as metadata
        const addresses = await rawGetAddressRowsForWallet(
          dbTx,
          {
            GetPathWithSpecific: deps.GetPathWithSpecific,
            GetAddress: deps.GetAddress,
            GetDerivationSpecific: deps.GetDerivationSpecific,
          },
          { publicDeriver: request.publicDeriver },
          withLevels.getParent().getDerivationTables(),
        );
        const walletAddressIds = Object.keys(addresses)
          .flatMap(key => addresses[key])
          .map(row => row.AddressId);

        await deps.ModifyAddress.remove(
          db, dbTx,
          walletAddressIds
        );
      }
      await deps.RemovePublicDeriver.remove(
        db, dbTx,
        { publicDeriverId: request.publicDeriver.getPublicDeriverId() }
      );
      if (request.conceptualWallet != null) {
        await request.conceptualWallet.rawRemove(db, dbTx);
      }
    }
  );
}
