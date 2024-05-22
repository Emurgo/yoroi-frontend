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
import { Bip44Wallet, } from './Bip44Wallet/wrapper';
import { Cip1852Wallet } from './Cip1852Wallet/wrapper';
import {
  GetAllBip44Wallets,
} from '../database/walletTypes/bip44/api/read';
import { GetAllCip1852Wallets } from '../database/walletTypes/cip1852/api/read';
import { isSupportedBip44CoinType } from './PublicDeriver/traits';

export async function loadWalletsFromStorage(
  db: lf$Database,
): Promise<Array<PublicDeriver<>>> {
  const result = [];
  const deps = Object.freeze({
    GetAllBip44Wallets,
    GetAllCip1852Wallets,
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(db, table));
  const walletsInStorage = await raii(
    db,
    depTables,
    async tx => ({
      bip44: await deps.GetAllBip44Wallets.get(db, tx),
      cip1852: await deps.GetAllCip1852Wallets.get(db, tx),
    })
  );
  // Bip44
  {
    const bip44Map = new Map<number, Bip44Wallet>();
    for (const entry of walletsInStorage.bip44) {
      let bip44Wallet = bip44Map.get(entry.Bip44Wrapper.ConceptualWalletId);
      if (bip44Wallet == null) {
        bip44Wallet = await Bip44Wallet.createBip44Wallet(
          db,
          entry.Bip44Wrapper,
        );
        const bip44CoinType = bip44Wallet.networkInfo.CoinType.toString();
        if (!isSupportedBip44CoinType(bip44CoinType)) {
          // skip for ergo
          continue;
        }
        bip44Map.set(entry.Bip44Wrapper.ConceptualWalletId, bip44Wallet);
      }
      try {
        const publicDeriver = await PublicDeriver.createPublicDeriver(
          entry.PublicDeriver,
          bip44Wallet,
        );
        result.push(publicDeriver);
      } catch (e) {
        console.error('Failed to load a BIP44 wallet', e);
      }
    }
  }
  // Cip1852
  {
    const cip1852Map = new Map<number, Cip1852Wallet>();
    for (const entry of walletsInStorage.cip1852) {
      let cip1852Wallet = cip1852Map.get(entry.Cip1852Wrapper.ConceptualWalletId);
      if (cip1852Wallet == null) {
        cip1852Wallet = await Cip1852Wallet.createCip1852Wallet(
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
