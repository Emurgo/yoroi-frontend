// @flow
import {
  observable,
  computed,
} from 'mobx';

import Store from './Store';
import Request from '../lib/LocalizedRequest';
import { getSelectedExplorer, getAllExplorers, saveSelectedExplorer, } from '../../api/ada/lib/storage/bridge/explorers';
import type {
  GetSelectedExplorerFunc,
  GetAllExplorersFunc, GetAllExplorersResponse,
  SaveSelectedExplorerFunc,
} from '../../api/ada/lib/storage/bridge/explorers';
import { prepackagedExplorers, } from '../../api/ada/lib/storage/database/prepackaged/explorers';
import type {
  ExplorerRow
} from '../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer, defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import { lf$Database } from 'lovefield';
import ExplorerActions from '../../actions/common/explorer-actions';

export default class BaseExplorerStore
  <
    TStores: {
      ...,
    },
    TActions: { +explorers: ExplorerActions, ... },
  > extends Store<TStores, TActions> {

  @observable getSelectedExplorerRequest: Request<GetSelectedExplorerFunc>
    = new Request<GetSelectedExplorerFunc>(getSelectedExplorer);

  @observable setSelectedExplorerRequest: Request<SaveSelectedExplorerFunc>
    = new Request<SaveSelectedExplorerFunc>(saveSelectedExplorer);

  @observable getAllExplorerRequest: Request<GetAllExplorersFunc>
    = new Request<GetAllExplorersFunc>(getAllExplorers);

  setup(): void {
    this.actions.explorers.updateSelectedExplorer.listen(this.setSelectedExplorer);
  }

  // ========== Selected Explorer ========== //

  @computed get selectedExplorer(): Map<number, SelectedExplorer> {
    /*
    const db = this.stores.loading.getDatabase();
    if (db == null) throw new Error(`${nameof(BaseExplorerStore)}::${nameof(this.selectedExplorer)} called before storage was initialized`);
    if (this.getSelectedExplorerRequest.result == null) {
      // when still loading, just return the defaults
      this.getSelectedExplorerRequest.execute({ db });
      return defaultToSelectedExplorer();
    }
    const { result } = this.getSelectedExplorerRequest;
    */
    const convertedMap: Map<number, SelectedExplorer> = new Map();
    /*
    for (const [networkId, v] of result.entries()) {
      convertedMap.set(networkId, new SelectedExplorer({ backup: v.backup, selected: v.selected }));
    }
    */
    return convertedMap;
  }

  @computed get allExplorers(): GetAllExplorersResponse {
    /*
    const db = this.stores.loading.getDatabase();
    if (db == null) throw new Error(`${nameof(BaseExplorerStore)}::${nameof(this.allExplorers)} called before storage was initialized`);
    if (this.getAllExplorerRequest.result == null) {
      // when still loading, just return the defaults
      this.getAllExplorerRequest.execute({ db });
    */
      return prepackagedExplorers;
    /*
    }
    return this.getAllExplorerRequest.result;
    */
  }

  setSelectedExplorer: {|
    explorer: $ReadOnly<ExplorerRow>,
  |} => Promise<void> = async (request): Promise<void> => {
    /*
    const db = this.stores.loading.getDatabase();
    if (db == null) throw new Error(`${nameof(BaseExplorerStore)}::${nameof(this.setSelectedExplorer)} called before storage was initialized`);
    await this.setSelectedExplorerRequest.execute({
      db,
      ...request
    });
    await this.getSelectedExplorerRequest.execute({ db }); // eagerly cache
    */
  };
}
