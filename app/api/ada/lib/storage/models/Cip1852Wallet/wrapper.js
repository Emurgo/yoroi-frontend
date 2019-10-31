// @flow

import type {
  lf$Database,
} from 'lovefield';

import type { IConceptualWalletConstructor, } from '../ConceptualWallet/interfaces';
import {
  ConceptualWallet, refreshConceptualWalletFunctionality,
} from '../ConceptualWallet/index';
import type { ICip1852Wallet } from './interfaces';
import type { Cip1852WrapperRow } from '../../database/walletTypes/cip1852/tables';

/** Snapshot of a Cip1852Wallet in the database */
export class Cip1852Wallet extends ConceptualWallet implements ICip1852Wallet {
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

  getDb(): lf$Database {
    return this.db;
  }

  getWrapperId(): number {
    return this.#bip44WrapperId;
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

  getProtocolMagic(): number {
    return this.#protocolMagic;
  }

  static async createCip1852Wallet(
    db: lf$Database,
    row: $ReadOnly<Cip1852WrapperRow>,
    protocolMagic: number,
  ): Promise<Cip1852Wallet> {
    return await refreshCip1852WalletFunctionality(
      db,
      row,
      protocolMagic
    );
  }
}

export async function refreshCip1852WalletFunctionality(
  db: lf$Database,
  row: $ReadOnly<Cip1852WrapperRow>,
  protocolMagic: number, // TODO: should be stored in a table somewhere in the future
): Promise<ICip1852Wallet> {
  const conceptualWalletCtorData = await refreshConceptualWalletFunctionality(
    db,
    row.ConceptualWalletId,
  );

  let privateDeriverLevel = null;
  let privateDeriverKeyDerivationId = null;

  let currClass = Cip1852Wallet;

  if (row.PrivateDeriverLevel != null && row.PrivateDeriverKeyDerivationId != null) {
    // currClass = PublicFromPrivate(currClass);
    // currClass = GetPrivateDeriverKey(currClass);
    privateDeriverLevel = row.PrivateDeriverLevel;
    privateDeriverKeyDerivationId = row.PrivateDeriverKeyDerivationId;
  } else {
    // currClass = AdhocPublicDeriver(currClass);
  }

  const instance = new currClass(
    db,
    conceptualWalletCtorData,
    row,
    privateDeriverLevel,
    privateDeriverKeyDerivationId,
    protocolMagic,
  );
  return instance;
}
