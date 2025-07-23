// @flow

import type {
  lf$Database,
} from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import {
  PublicDeriver,
} from './PublicDeriver/index';
import { GetAllCip1852Wallets } from '../database/walletTypes/cip1852/api/read';
import { createAndRefreshCip1852Wallet } from './ConceptualWallet/traits';
import { ConceptualWallet } from './ConceptualWallet';

export async function loadWalletsFromStorage(
  db: lf$Database,
): Promise<Array<PublicDeriver<>>> {
  const result = [];
  const depTables = getAllSchemaTables(db, GetAllCip1852Wallets);
  const cip1852WalletsInStorage = await raii(
    db,
    depTables,
    async tx => await GetAllCip1852Wallets.get(db, tx),
  );
  // Cip1852
  {
    const cip1852Map = new Map<number, ConceptualWallet>();
    for (const entry of cip1852WalletsInStorage) {
      let cip1852Wallet = cip1852Map.get(entry.Cip1852Wrapper.ConceptualWalletId);
      if (cip1852Wallet == null) {
        cip1852Wallet = await createAndRefreshCip1852Wallet(
          db,
          entry.Cip1852Wrapper,
        );
        cip1852Map.set(entry.Cip1852Wrapper.ConceptualWalletId, cip1852Wallet);
      }
      const publicDeriver = await PublicDeriver.createPublicDeriver(
        entry.PublicDeriver,
        cip1852Wallet,
      );
      result.push(publicDeriver);
    }
  }
  return result;
}
