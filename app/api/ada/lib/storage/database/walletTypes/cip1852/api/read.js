// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Cip1852WrapperRow,
  Cip1852ToPublicDeriverRow,
} from '../tables';
import * as Tables from '../tables';

import {
  GetCip1852Tables,
} from './utils';
import {
  getRowIn,
  getRowFromKey,
} from '../../../utils';
import {
  KeyDerivationSchema,
} from '../../../primitives/tables';
import { PublicDeriverSchema, } from '../../core/tables';
import type { PublicDeriverRow, } from '../../core/tables';

export class GetCip1852DerivationSpecific {
  static ownTables = Object.freeze({
    [KeyDerivationSchema.name]: KeyDerivationSchema,
  });
  static depTables = Object.freeze({
    GetCip1852Tables
  });

  static async get<Row>(
    db: lf$Database,
    tx: lf$Transaction,
    derivationIds: Array<number>,
    level: number,
  ): Promise<$ReadOnlyArray<$ReadOnly<Row>>> {
    const cip1852Tables = GetCip1852DerivationSpecific.depTables.GetCip1852Tables.get();
    const tableName = cip1852Tables.get(level);
    if (tableName == null) {
      throw new Error('GetCip1852DerivationSpecific::get Unknown table queried');
    }
    return await getRowIn<Row>(
      db, tx,
      tableName,
      GetCip1852DerivationSpecific.ownTables[KeyDerivationSchema.name].properties.KeyDerivationId,
      derivationIds,
    );
  }
}

export class GetCip1852Wrapper {
  static ownTables = Object.freeze({
    [Tables.Cip1852WrapperSchema.name]: Tables.Cip1852WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
    key: number,
  ): Promise<$ReadOnly<Cip1852WrapperRow> | void> {
    return await getRowFromKey<Cip1852WrapperRow>(
      db, tx,
      key,
      GetCip1852Wrapper.ownTables[Tables.Cip1852WrapperSchema.name].name,
      GetCip1852Wrapper.ownTables[Tables.Cip1852WrapperSchema.name].properties.Cip1852WrapperId,
    );
  }
}

export class GetAllCip1852Wallets {
  static ownTables = Object.freeze({
    [Tables.Cip1852WrapperSchema.name]: Tables.Cip1852WrapperSchema,
    [Tables.Cip1852ToPublicDeriverSchema.name]: Tables.Cip1852ToPublicDeriverSchema,
    [PublicDeriverSchema.name]: PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<{
    Cip1852Wrapper: $ReadOnly<Cip1852WrapperRow>,
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
    Cip1852ToPublicDeriver: $ReadOnly<Cip1852ToPublicDeriverRow>,
  }>> {
    const Cip1852ToPublicDeriverTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[Tables.Cip1852ToPublicDeriverSchema.name].name
    );
    const publicDeriverTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[PublicDeriverSchema.name].name
    );
    const Cip1852WrapperTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[Tables.Cip1852WrapperSchema.name].name
    );
    const properties = Tables.Cip1852ToPublicDeriverSchema.properties;
    const query = db
      .select()
      .from(Cip1852ToPublicDeriverTable)
      .innerJoin(
        publicDeriverTable,
        publicDeriverTable[PublicDeriverSchema.properties.PublicDeriverId].eq(
          Cip1852ToPublicDeriverTable[properties.PublicDeriverId]
        )
      )
      .innerJoin(
        Cip1852WrapperTable,
        Cip1852WrapperTable[Tables.Cip1852WrapperSchema.properties.Cip1852WrapperId].eq(
          Cip1852ToPublicDeriverTable[properties.Cip1852WrapperId]
        )
      );

    return await tx.attach(query);
  }

  static async forCip1852Wallet(
    db: lf$Database,
    tx: lf$Transaction,
    Cip1852WrapperId: number,
  ): Promise<$ReadOnlyArray<{
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
  }>> {
    const Cip1852ToPublicDeriverTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[Tables.Cip1852ToPublicDeriverSchema.name].name
    );
    const properties = Tables.Cip1852ToPublicDeriverSchema.properties;
    const query = db
      .select()
      .from(Cip1852ToPublicDeriverTable)
      .where(
        Cip1852ToPublicDeriverTable[properties.Cip1852WrapperId].eq(
          Cip1852WrapperId
        )
      );
    return await tx.attach(query);
  }
}
