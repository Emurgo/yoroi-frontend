// @flow

import type {
  lf$Database,
} from 'lovefield';

import {
  ConceptualWallet, refreshConceptualWalletFunctionality,
} from '../ConceptualWallet/index';
import type {
  IConceptualWalletConstructor,
} from '../ConceptualWallet/interfaces';

import type {
  IBip44Wallet,
} from './interfaces';
import type {
  IHasPrivateDeriver,
  IHasLevels,
  IHasSign,
} from '../common/wrapper/interfaces';
import {
  PublicFromPrivate,
  GetPrivateDeriverKey,
  AdhocPublicDeriver,
} from '../common/wrapper/traits';

import type {
  Bip44WrapperRow,
} from '../../database/walletTypes/bip44/tables';
import {
  Bip44TableMap,
} from '../../database/walletTypes/bip44/api/utils';

/** Snapshot of a Bip44Wallet in the database */
export class Bip44Wallet
  extends ConceptualWallet
  implements IBip44Wallet, IHasPrivateDeriver, IHasLevels, IHasSign {
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
    row: $ReadOnly<Bip44WrapperRow>,
    privateDeriverLevel: number | null,
    privateDeriverKeyDerivationId: number | null,
    protocolMagic: number,
  ): Bip44Wallet {
    super(conceptualWalletCtorData);
    this.#bip44WrapperId = row.Bip44WrapperId;
    this.#publicDeriverLevel = row.PublicDeriverLevel;
    this.#signingLevel = row.SignerLevel;
    this.#privateDeriverLevel = privateDeriverLevel;
    this.#privateDeriverKeyDerivationId = privateDeriverKeyDerivationId;
    this.#protocolMagic = protocolMagic;
    return this;
  }

  getDerivationTables: void => Map<number, string> = () => {
    return Bip44TableMap;
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

  static async createBip44Wallet(
    db: lf$Database,
    row: $ReadOnly<Bip44WrapperRow>,
    protocolMagic: number,
  ): Promise<Bip44Wallet> {
    return await refreshBip44WalletFunctionality(
      db,
      row,
      protocolMagic
    );
  }
}

export async function refreshBip44WalletFunctionality(
  db: lf$Database,
  row: $ReadOnly<Bip44WrapperRow>,
  protocolMagic: number, // TODO: should be stored in a table somewhere in the future
): Promise<IBip44Wallet> {
  const conceptualWalletCtorData = await refreshConceptualWalletFunctionality(
    db,
    row.ConceptualWalletId,
  );

  let privateDeriverLevel = null;
  let privateDeriverKeyDerivationId = null;

  let currClass = Bip44Wallet;

  if (row.PrivateDeriverLevel != null && row.PrivateDeriverKeyDerivationId != null) {
    currClass = PublicFromPrivate(currClass);
    currClass = GetPrivateDeriverKey(currClass);
    privateDeriverLevel = row.PrivateDeriverLevel;
    privateDeriverKeyDerivationId = row.PrivateDeriverKeyDerivationId;
  } else {
    currClass = AdhocPublicDeriver(currClass);
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
