// @flow

import type {
  lf$Database, lf$Transaction
} from 'lovefield';

import type {
  IConceptualWalletConstructor,
} from '../ConceptualWallet/interfaces';
import {
  ConceptualWallet, rawRemoveConceptualWallet,
} from '../ConceptualWallet/index';
import { refreshCip1852WalletFunctionality } from '../ConceptualWallet/traits';
import type { Cip1852WrapperRow } from '../../database/walletTypes/cip1852/tables';
import { ModifyCip1852Wrapper } from '../../database/walletTypes/cip1852/api/write';

/** Snapshot of a Cip1852Wallet in the database */
export class Cip1852Wallet extends ConceptualWallet {

  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Cip1852WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
  ): Cip1852Wallet {
    super(conceptualWalletCtorData, row.PublicDeriverLevel, row.SignerLevel, privateDeriverLevel, privateDeriverKeyDerivationId);
    return this;
  }

  static async createCip1852Wallet(
    db: lf$Database,
    row: $ReadOnly<Cip1852WrapperRow>,
  ): Promise<Cip1852Wallet> {
    return await refreshCip1852WalletFunctionality(
      db,
      row,
      Cip1852Wallet,
    );
  }

  rawRemove: (lf$Database, lf$Transaction) => Promise<void> = async (db, tx) => {
    await ModifyCip1852Wrapper.remove(
      db, tx,
      this.getConceptualWalletId()
    );
    await rawRemoveConceptualWallet(db, tx, this.getConceptualWalletId());
  }
}
