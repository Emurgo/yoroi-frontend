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
import {
  GetAddress,
  GetPathWithSpecific,
  GetTransaction,
  GetCertificates,
} from '../../database/primitives/api/read';
import { ModifyAddress, FreeBlocks, ModifyTokenList, } from '../../database/primitives/api/write';
import { AssociateTxWithUtxoIOs, } from '../../database/transactionModels/utxo/api/read';
import { AssociateTxWithAccountingIOs, } from '../../database/transactionModels/account/api/read';
import {
  CardanoByronAssociateTxWithIOs,
  CardanoShelleyAssociateTxWithIOs,
} from '../../database/transactionModels/multipart/api/read';
import { GetDerivationSpecific, } from '../../database/walletTypes/common/api/read';
import { rawGetAddressRowsForWallet } from '../traitUtils';
import { isCardanoHaskell } from '../../database/prepackaged/networks';
import {
  ModifyUtxoAtSafePoint,
  ModifyUtxoDiffToBestBlock,
} from '../../database/utxo/api/write';

export async function removePublicDeriver(request: {|
  publicDeriver: IPublicDeriver<>,
  /** removes parent if specified */
  conceptualWallet: void | IConceptualWallet,
|}): Promise<void> {
  const deps = Object.freeze({
    RemovePublicDeriver,
    ModifyConceptualWallet,
    GetPathWithSpecific,
    GetAddress,
    CardanoByronAssociateTxWithIOs,
    CardanoShelleyAssociateTxWithIOs,
    AssociateTxWithAccountingIOs,
    AssociateTxWithUtxoIOs,
    GetDerivationSpecific,
    DeleteAllTransactions,
    ModifyAddress,
    GetTransaction,
    FreeBlocks,
    GetCertificates,
    ModifyTokenList,
    ModifyUtxoAtSafePoint,
    ModifyUtxoDiffToBestBlock,
  });
  const db = request.publicDeriver.getDb();
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));

  return await raii<PromisslessReturnType<typeof removePublicDeriver>>(
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
              GetCertificates: deps.GetCertificates,
              ModifyTokenList: deps.ModifyTokenList,
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
          .map(row => row.address.AddressId);

        await deps.ModifyAddress.remove(
          db, dbTx,
          walletAddressIds
        );
      }

      // 3) remove utxos
      await ModifyUtxoAtSafePoint.remove(
        db, dbTx,
        request.publicDeriver.getPublicDeriverId()
      );
      await ModifyUtxoDiffToBestBlock.removeAll(
        db, dbTx,
        request.publicDeriver.getPublicDeriverId()
      );

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
