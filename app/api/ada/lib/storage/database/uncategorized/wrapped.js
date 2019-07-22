// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  KeyInsert, KeyRow,
  ConceptualWalletInsert, ConceptualWalletRow,
} from './tables';
import * as Tables from './tables';
import { addToTable, getRowFromKey } from '../utils';
import { Bip44WrapperSchema, } from '../genericBip44/tables';
import type { Bip44WrapperRow } from '../genericBip44/tables';

export class AddKey {
  static ownTables = {
    [Tables.KeySchema.name]: Tables.KeySchema.name,
  };
  static depTables = {};

  static func = async (
    db: lf$Database,
    tx: lf$Transaction,
    request: KeyInsert,
  ): Promise<KeyRow> => {
    return await addToTable<KeyInsert, KeyRow>(
      db, tx,
      request, Tables.KeySchema.name
    );
  }
}
