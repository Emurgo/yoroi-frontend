// @flow

import { lf$Database } from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import type {
  ExplorerRow
} from '../database/explorers/tables';
import { GetExplorers } from '../database/explorers/api/read';
import { ModifyPreferredExplorer } from '../database/explorers/api/write';

// getSelectedExplorer

export type GetSelectedExplorerRequest = {|
  db: lf$Database,
|};
export type GetSelectedExplorerResponse = $ReadOnlyMap<number, {|
  backup: $ReadOnly<ExplorerRow>,
  selected: $ReadOnly<ExplorerRow>,
|}>;
export type GetSelectedExplorerFunc = (
  request: GetSelectedExplorerRequest
) => Promise<GetSelectedExplorerResponse>;

// getAllExplorers

export type GetAllExplorersRequest = {|
  db: lf$Database,
|};
export type GetAllExplorersResponse = $ReadOnlyMap<number, $ReadOnlyArray<$ReadOnly<ExplorerRow>>>;
export type GetAllExplorersFunc = (
  request: GetAllExplorersRequest
) => Promise<GetAllExplorersResponse>;


// saveSelectedExplorer

export type SaveSelectedExplorerRequest = {|
  db: lf$Database,
  explorer: $ReadOnly<ExplorerRow>,
|};
export type SaveSelectedExplorerResponse = void;
export type SaveSelectedExplorerFunc = (
  request: SaveSelectedExplorerRequest
) => Promise<SaveSelectedExplorerResponse>;


export async function getSelectedExplorer(
  request: GetSelectedExplorerRequest
): Promise<GetSelectedExplorerResponse> {
  const deps = Object.freeze({
    GetExplorers
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<GetSelectedExplorerResponse>(
    request.db,
    depTables,
    async tx => {
      const selectedExplorers = await deps.GetExplorers.getPreferredExplorer(
        request.db, tx,
      );
      const backups = await deps.GetExplorers.getBackups(
        request.db, tx,
      );
      if (selectedExplorers.size !== backups.length) {
        throw new Error(`${nameof(getSelectedExplorer)} size mismatch`);
      }
      const finalMap = new Map();
      for (const backup of backups) {
        const selected = selectedExplorers.get(backup.NetworkId);
        if (selected == null) {
          throw new Error(`${nameof(getSelectedExplorer)} key mismatch`);
        }
        finalMap.set(backup.NetworkId, {
          backup,
          selected
        });
      }
      return finalMap;
    }
  );
}

export async function getAllExplorers(
  request: GetAllExplorersRequest
): Promise<GetAllExplorersResponse> {
  const deps = Object.freeze({
    GetExplorers
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<GetAllExplorersResponse>(
    request.db,
    depTables,
    async tx => {
      const allExplorers = await deps.GetExplorers.getAll(
        request.db, tx,
      );
      const mapping = new Map<number, Array<$ReadOnly<ExplorerRow>>>();
      for (const explorer of allExplorers) {
        const existingEntry = mapping.get(explorer.NetworkId);
        if (existingEntry == null) {
          mapping.set(explorer.NetworkId, [explorer]);
        } else {
          existingEntry.push(explorer);
        }
      }
      return mapping;
    }
  );
}

export async function saveSelectedExplorer(
  request: SaveSelectedExplorerRequest
): Promise<SaveSelectedExplorerResponse> {
  const deps = Object.freeze({
    ModifyPreferredExplorer
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii<SaveSelectedExplorerResponse>(
    request.db,
    depTables,
    async tx => deps.ModifyPreferredExplorer.upsert(
      request.db, tx,
      {
        ExplorerId: request.explorer.ExplorerId,
        NetworkId: request.explorer.NetworkId,
      },
    )
  );
}
