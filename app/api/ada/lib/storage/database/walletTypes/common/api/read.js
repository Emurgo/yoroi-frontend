// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import {
  getRowIn,
} from '../../../utils';
import {
  KeyDerivationSchema,
} from '../../../primitives/tables';

export class GetDerivationSpecific {
  static ownTables = Object.freeze({
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({});

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    derivationIds: Array<number>,
    level: number,
    derivationTables: Map<number, string>,
  ): Promise<$ReadOnlyArray<$ReadOnly<Row>>> {
    const tableName = derivationTables.get(level);
    if (tableName == null) {
      throw new Error('GetDerivationSpecific::get Unknown table queried');
    }
    return await getRowIn<Row>(
      db, tx,
      tableName,
      GetDerivationSpecific.ownTables[KeyDerivationSchema.name].properties.KeyDerivationId,
      derivationIds,
    );
  }
}
