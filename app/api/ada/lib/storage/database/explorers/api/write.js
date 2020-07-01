// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import * as Tables from '../tables';
import type {
  ExplorerInsert, ExplorerRow,
  PreferredExplorerInsert, PreferredExplorerRow,
} from '../tables';
import { removeFromTableBatch, addOrReplaceRows } from '../../utils';

export class ModifyExplorers {
  static ownTables: {|
    Explorer: typeof Tables.ExplorerSchema,
  |} = Object.freeze({
    [Tables.ExplorerSchema.name]: Tables.ExplorerSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    rows: $ReadOnlyArray<$ReadOnly<ExplorerInsert>>,
  ): Promise<void> {
    const result = await addOrReplaceRows<ExplorerInsert, ExplorerRow>(
      db, tx,
      rows,
      ModifyExplorers.ownTables[Tables.ExplorerSchema.name].name,
    );

    return result;
  }
}
export class ModifyPreferredExplorer {
  static ownTables: {|
    PreferredExplorer: typeof Tables.PreferredExplorerSchema,
  |} = Object.freeze({
    [Tables.PreferredExplorerSchema.name]: Tables.PreferredExplorerSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async upsert(
    db: lf$Database,
    tx: lf$Transaction,
    row: PreferredExplorerInsert,
  ): Promise<void> {
    // we can't upsert based off networkId
    // since lovefield tables all need their own primary key (not just foreign)
    // so instead, we delete any row that might already exist, then add a new row
    await removeFromTableBatch(
      db, tx,
      ModifyPreferredExplorer.ownTables[Tables.PreferredExplorerSchema.name].name,
      ModifyPreferredExplorer.ownTables[Tables.PreferredExplorerSchema.name].properties.NetworkId,
      ([row.NetworkId]: Array<number>),
    );
    const result = await addOrReplaceRows<PreferredExplorerInsert, PreferredExplorerRow>(
      db, tx,
      [row],
      ModifyPreferredExplorer.ownTables[Tables.PreferredExplorerSchema.name].name,
    );

    return result;
  }
}
