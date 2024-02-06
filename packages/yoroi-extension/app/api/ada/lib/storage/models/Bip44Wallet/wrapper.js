// @flow

import type {
  lf$Database, lf$Transaction,
} from 'lovefield';

import {
  ConceptualWallet, rawRemoveConceptualWallet,
} from '../ConceptualWallet/index';
import type {
  IConceptualWalletConstructor,
  IHasPrivateDeriver,
  IHasLevels,
  IHasSign,
} from '../ConceptualWallet/interfaces';
import { refreshBip44WalletFunctionality } from '../ConceptualWallet/traits';

import type {
  IBip44Wallet,
} from './interfaces';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import { ModifyBip44Wrapper } from '../../database/walletTypes/bip44/api/write';
import {
  Bip44TableMap,
} from '../../database/walletTypes/bip44/api/utils';

// <TODO:PENDING_REMOVAL> bip44
/** Snapshot of a Bip44Wallet in the database */
export class Bip44Wallet
  extends ConceptualWallet
  implements IBip44Wallet, IHasPrivateDeriver, IHasLevels, IHasSign {
  /**
   * Should only cache information we know will never change
   */

  #publicDeriverLevel: number;
  #signingLevel: number | null;
  #privateDeriverLevel: number | null;
  #privateDeriverKeyDerivationId: number | null;
  #protocolMagic: number;

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
    super(conceptualWalletCtorData);
    this.#publicDeriverLevel = row.PublicDeriverLevel;
    this.#signingLevel = row.SignerLevel;
    this.#privateDeriverLevel = privateDeriverLevel;
    this.#privateDeriverKeyDerivationId = privateDeriverKeyDerivationId;
    return this;
  }

  getDerivationTables: void => Map<number, string> = () => {
    return Bip44TableMap;
  }

  getPublicDeriverLevel(): number {
    return this.#publicDeriverLevel;
  }

  getSigningLevel(): number | null {
    return this.#signingLevel;
  }

  getPrivateDeriverLevel(): number | null {
    return this.#privateDeriverLevel;
  }

  getPrivateDeriverKeyDerivationId(): number | null {
    return this.#privateDeriverKeyDerivationId;
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
