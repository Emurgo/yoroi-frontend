// @flow
import type { HandlerType } from './type';
import type {
  ExplorerRow,
  PreferredExplorerRow,
} from '../../../../../app/api/ada/lib/storage/database/explorers/tables';
import { getDb } from '../../state';
import {
  getAllExplorers,
  getSelectedExplorer,
  saveSelectedExplorer,
} from '../../../../../app/api/ada/lib/storage/bridge/explorers';

export const  GetAllExplorers: HandlerType<
  void,
  Array<[number , $ReadOnlyArray<$ReadOnly<ExplorerRow>>]>
> = Object.freeze({
  typeTag: 'get-all-explorers',

  handle: async () => {
    const db = await getDb();
    const result = await getAllExplorers({ db });
    return [...result.entries()];
  },
});

export const  GetSelectedExplorer: HandlerType<
  void,
  Array<[number, {|
    backup: $ReadOnly<ExplorerRow>,
    selected: $ReadOnly<ExplorerRow>,
  |}]>
> = Object.freeze({
  typeTag: 'get-selected-explorer',

  handle: async () => {
    const db = await getDb();
    const result = await getSelectedExplorer({ db });
    return [...result.entries()];
  },
});

export const  SaveSelectedExplorer: HandlerType<
  {| explorer: $ReadOnly<ExplorerRow> |},
  $ReadOnlyArray<$ReadOnly<PreferredExplorerRow>>
> = Object.freeze({
  typeTag: 'save-selected-explorer',

  handle: async (request) => {
    const db = await getDb();
    return await saveSelectedExplorer({ db, explorer: request.explorer });
  },
});
