// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import * as Tables from '../tables';
import type {
  KeyInsert, KeyRow,
  ConceptualWalletInsert, ConceptualWalletRow,
} from '../tables';

import { addToTable, } from '../../utils';

export class AddKey {
  static ownTables = Object.freeze({
    [Tables.KeySchema.name]: Tables.KeySchema.name,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    request: KeyInsert,
  ): Promise<KeyRow> {
    return await addToTable<KeyInsert, KeyRow>(
      db, tx,
      request,
      AddKey.ownTables[Tables.KeySchema.name],
    );
  }
}

export class AddConceptualWallet {
  static ownTables = Object.freeze({
    [Tables.ConceptualWalletSchema.name]: Tables.ConceptualWalletSchema.name,
  });
  static depTables = Object.freeze({});

  static async func(
    db: lf$Database,
    tx: lf$Transaction,
    request: ConceptualWalletInsert,
  ): Promise<KeyRow> {
    return await addToTable<ConceptualWalletInsert, ConceptualWalletRow>(
      db, tx,
      request,
      AddConceptualWallet.ownTables[Tables.ConceptualWalletSchema.name],
    );
  }
}
