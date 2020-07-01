// @flow

import type {
  lf$Database,
  lf$Transaction,
} from 'lovefield';
import * as Tables from '../tables';
import type { ExplorerRow, PreferredExplorerRow, } from '../tables';
import { getAll } from '../../utils';

export class GetExplorers {
  static ownTables: {|
    Explorer: typeof Tables.ExplorerSchema,
    PreferredExplorer: typeof Tables.PreferredExplorerSchema,
  |} = Object.freeze({
    [Tables.ExplorerSchema.name]: Tables.ExplorerSchema,
    [Tables.PreferredExplorerSchema.name]: Tables.PreferredExplorerSchema,
  });
  static depTables: {||} = Object.freeze({});

  static async getAll(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<$ReadOnly<ExplorerRow>>> {
    const rows = await getAll<ExplorerRow>(
      db, tx,
      GetExplorers.ownTables[Tables.ExplorerSchema.name].name,
    );
    return rows;
  }

  static async getBackups(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<$ReadOnlyArray<$ReadOnly<ExplorerRow>>> {
    const explorerSchema = GetExplorers.ownTables[Tables.ExplorerSchema.name];
    const explorerTable = db.getSchema().table(explorerSchema.name);

    const query = db
      .select()
      .from(explorerTable)
      .where(
        explorerTable[explorerSchema.properties.IsBackup].eq(true)
      );
    const result: $ReadOnlyArray<$ReadOnly<ExplorerRow>> = await tx.attach(query);
    return result;
  }

  static async getPreferredExplorer(
    db: lf$Database,
    tx: lf$Transaction,
  ): Promise<Map<number, $ReadOnly<ExplorerRow>>> {
    const explorerMap = new Map<number, $ReadOnly<ExplorerRow>>();

    // 1) get the backups as the default values
    const backups = await GetExplorers.getBackups(db, tx);
    for (const backup of backups) {
      explorerMap.set(backup.NetworkId, backup);
    }

    // 2) Get the user-preferred preferences

    const explorerSchema = GetExplorers.ownTables[Tables.ExplorerSchema.name];
    const explorerTable = db.getSchema().table(explorerSchema.name);

    const preferredExplorerSchema = GetExplorers.ownTables[Tables.PreferredExplorerSchema.name];
    const preferredExplorerTable = db.getSchema().table(preferredExplorerSchema.name);

    const query = db
      .select()
      .from(explorerTable)
      .innerJoin(
        preferredExplorerTable,
        preferredExplorerTable[preferredExplorerSchema.properties.ExplorerId].eq(
          explorerTable[explorerSchema.properties.ExplorerId]
        )
      );
    const preferredExplorers: $ReadOnlyArray<{|
      Explorer: $ReadOnly<ExplorerRow>,
      PreferredExplorer: $ReadOnly<PreferredExplorerRow>
    |}> = await tx.attach(query);

    // 3) override backup entries with user preference
    for (const preferred of preferredExplorers) {
      explorerMap.set(preferred.Explorer.NetworkId, preferred.Explorer);
    }
    return explorerMap;
  }
}
