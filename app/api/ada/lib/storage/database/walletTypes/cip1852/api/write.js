// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';

import type {
  Cip1852WrapperInsert, Cip1852WrapperRow,
} from '../tables';
import * as Cip1852Tables from '../tables';

import { addNewRowToTable, } from '../../../utils';

export class AddCip1852Wrapper {
  static ownTables = Object.freeze({
    [Cip1852Tables.Cip1852WrapperSchema.name]: Cip1852Tables.Cip1852WrapperSchema,
  });
  static depTables = Object.freeze({});

  static async add(
    db: lf$Database,
    tx: lf$Transaction,
    request: Cip1852WrapperInsert,
  ): Promise<$ReadOnly<Cip1852WrapperRow>> {
    return await addNewRowToTable<Cip1852WrapperInsert, Cip1852WrapperRow>(
      db, tx,
      request,
      AddCip1852Wrapper.ownTables[Cip1852Tables.Cip1852WrapperSchema.name].name,
    );
  }
}
