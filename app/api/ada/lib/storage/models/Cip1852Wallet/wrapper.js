// @flow

import type {
  lf$Database,
} from 'lovefield';

import type {
  IConceptualWalletConstructor,
  IHasPrivateDeriver, IHasLevels, IHasSign,
} from '../ConceptualWallet/interfaces';
import {
  ConceptualWallet,
} from '../ConceptualWallet/index';
import { refreshCip1852WalletFunctionality } from '../ConceptualWallet/traits';
import type { ICip1852Wallet } from './interfaces';
import type { Cip1852WrapperRow } from '../../database/walletTypes/cip1852/tables';
import {
  Bip44TableMap,
} from '../../database/walletTypes/bip44/api/utils';

/** Snapshot of a Cip1852Wallet in the database */
export class Cip1852Wallet
  extends ConceptualWallet
  implements ICip1852Wallet, IHasPrivateDeriver, IHasLevels, IHasSign {
  /**
   * Should only cache information we know will never change
   */

  #bip44WrapperId: number;
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
    row: $ReadOnly<Cip1852WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
    protocolMagic: number,
  ): Cip1852Wallet {
    super(conceptualWalletCtorData);
    this.#bip44WrapperId = row.Cip1852WrapperId;
    this.#publicDeriverLevel = row.PublicDeriverLevel;
    this.#signingLevel = row.SignerLevel;
    this.#privateDeriverLevel = privateDeriverLevel;
    this.#privateDeriverKeyDerivationId = privateDeriverKeyDerivationId;
    this.#protocolMagic = protocolMagic;
    return this;
  }

  getWrapperId(): number {
    return this.#bip44WrapperId;
  }

  getDerivationTables: void => Map<number, string> = () => {
    // recall: cip1852 is an extension of bip44 so the tables are the same
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

  static async createCip1852Wallet(
    db: lf$Database,
    row: $ReadOnly<Cip1852WrapperRow>,
    protocolMagic: number,
  ): Promise<Cip1852Wallet> {
    return await refreshCip1852WalletFunctionality(
      db,
      row,
      Cip1852Wallet,
      protocolMagic
    );
  }
}
