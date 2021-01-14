// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import * as Tables from '../tables';
import type { PriceDataRow } from '../tables';
import { getAll, } from '../../utils';

export class GetPriceData {
  static ownTables: {|
    PriceData: typeof Tables.PriceDataSchema,
  |} = Object.freeze({
    [Tables.PriceDataSchema.name]: Tables.PriceDataSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async getAllPrices(
    db: lf$Database,
    dbTx: lf$Transaction,
  ): Promise<$ReadOnlyArray<$ReadOnly<PriceDataRow>>> {
    return await getAll<PriceDataRow>(
      db, dbTx,
      GetPriceData.ownTables[Tables.PriceDataSchema.name].name,
    );
  }
}
