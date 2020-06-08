// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import * as Tables from '../tables';
import type { PriceDataRow, PriceDataInsert } from '../tables';
import { addOrReplaceRows, } from '../../utils';

export class ModifyPriceData {
  static ownTables: {|
    PriceData: typeof Tables.PriceDataSchema,
  |} = Object.freeze({
    [Tables.PriceDataSchema.name]: Tables.PriceDataSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsertPrices(
    db: lf$Database,
    dbTx: lf$Transaction,
    prices: $ReadOnlyArray<PriceDataInsert | PriceDataRow>,
  ): Promise<$ReadOnly<PriceDataRow>> {
    return await addOrReplaceRows<{ ...PriceDataInsert, ... }, PriceDataRow>(
      db, dbTx,
      prices,
      ModifyPriceData.ownTables[Tables.PriceDataSchema.name].name,
    );
  }
}
