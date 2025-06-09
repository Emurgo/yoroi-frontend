// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  ConceptualWallet, rawRemoveConceptualWallet,
} from '../ConceptualWallet/index';
import type {
  IConceptualWalletConstructor,
} from '../ConceptualWallet/interfaces';
import { refreshBip44WalletFunctionality } from '../ConceptualWallet/traits';

import type {
  IBip44Wallet,
} from './interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import { ModifyBip44Wrapper } from '../../database/walletTypes/bip44/api/write';

// <TODO:PENDING_REMOVAL> bip44
/** Snapshot of a Bip44Wallet in the database */
export class Bip44Wallet
  extends ConceptualWallet
  implements IBip44Wallet {

  /**
   * This constructor it will NOT populate functionality from db
   */
  constructor(
    db: lf$Database,
    conceptualWalletCtorData: IConceptualWalletConstructor,
    row: $ReadOnly<Bip44WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
  ): Bip44Wallet {
    super(conceptualWalletCtorData, row.PublicDeriverLevel, row.SignerLevel, privateDeriverLevel, privateDeriverKeyDerivationId);
    return this;
  }

  // <TODO:PENDING_REMOVAL> bip44
  static async createBip44Wallet(
    db: lf$Database,
    row: $ReadOnly<Bip44WrapperRow>,
  ): Promise<Bip44Wallet> {
    return await refreshBip44WalletFunctionality(
      db,
      row,
      Bip44Wallet,
    );
  }

  rawRemove: (lf$Database, lf$Transaction) => Promise<void> = async (db, tx) => {
    await ModifyBip44Wrapper.remove(
      db, tx,
      this.getConceptualWalletId()
    );
    await rawRemoveConceptualWallet(db, tx, this.getConceptualWalletId());
  }
}
