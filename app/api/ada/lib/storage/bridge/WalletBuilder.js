// @flow

import type {
  lf$Transaction,
  lf$Database,
  lf$schema$Table,
} from 'lovefield';

import type { ConceptualWalletRow } from '../database/uncategorized/tables';
import type { PrivateDeriverRow } from '../database/genericBip44/tables';

export class WalletBuilder {
  db: lf$Database;
  tx: lf$Transaction;

  tables: Array<lf$schema$Table>;

  constructor(db: lf$Database) {
    this.db = db;
    this.tx = db.createTransaction();
    this.tables = [];
  }

  // static start(db: lf$Database): WalletBuilder<$Shape<{||}>> {
  //   return new WalletBuilder(db, {});
  // }

  commit = async (): Promise<void> => {
    await this.tx.commit();
  }

  static addConceptual<T>(
    builder: T
  ): T & { asdf: number} {
    return Object.assign(
      { asdf: 5 },
      builder,
    );
  }

  static addAsdf<T>(
    builder: { asdf: number } & T
  ): T & { zxcv: number} {
    return {
      ...{ zxcv: 5, },
      ...builder,
    };
  }

  static addZxcv<T>(
    builder: { asdf: number, zxcv: number } & T
  ): T & { qwer: number} {
    return {
      ...{ qwer: builder.asdf },
      ...builder,
    };
  }
}
