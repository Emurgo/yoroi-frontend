// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Cip1852WrapperRow,
} from '../tables';
import * as Tables from '../tables';

import {
  getRowFromKey,
} from '../../../utils';
import { PublicDeriverSchema, } from '../../core/tables';
import type { PublicDeriverRow, } from '../../core/tables';

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
    [PublicDeriverSchema.name]: PublicDeriverSchema,
  });
  static depTables = Object.freeze({});

  static async get(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<{|
    Cip1852Wrapper: $ReadOnly<Cip1852WrapperRow>,
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
  |}>> {
    const publicDeriverTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[PublicDeriverSchema.name].name
    );
    const Cip1852WrapperTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[Tables.Cip1852WrapperSchema.name].name
    );
    const query = db
      .select()
      .from(Cip1852WrapperTable)
      .innerJoin(
        publicDeriverTable,
        publicDeriverTable[PublicDeriverSchema.properties.ConceptualWalletId].eq(
          Cip1852WrapperTable[PublicDeriverSchema.properties.ConceptualWalletId]
        )
      );

    return await tx.attach(query);
  }

  static async forCip1852Wallet(
    db: lf$Database,
    tx: lf$Transaction,
    Cip1852WrapperId: number,
  ): Promise<$ReadOnlyArray<{|
    PublicDeriver: $ReadOnly<PublicDeriverRow>,
  |}>> {
    const publicDeriverTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[PublicDeriverSchema.name].name
    );
    const Cip1852WrapperTable = db.getSchema().table(
      GetAllCip1852Wallets.ownTables[Tables.Cip1852WrapperSchema.name].name
    );
    const query = db
      .select()
      .from(Cip1852WrapperTable)
      .where(
        Cip1852WrapperTable[Tables.Cip1852WrapperSchema.properties.Cip1852WrapperId].eq(
          Cip1852WrapperId
        )
      )
      .innerJoin(
        publicDeriverTable,
        publicDeriverTable[PublicDeriverSchema.properties.ConceptualWalletId].eq(
          Cip1852WrapperTable[PublicDeriverSchema.properties.ConceptualWalletId]
        )
      );

    return await tx.attach(query);
  }
}
