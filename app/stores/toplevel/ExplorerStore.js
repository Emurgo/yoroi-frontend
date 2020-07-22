// @flow
import {
  observable,
  computed
} from 'mobx';

import Store from '../base/Store';
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

export default class ExplorerStore extends Store {

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
    const db = this.stores.loading.loadPersistentDbRequest.result;
    if (db == null) throw new Error(`${nameof(ExplorerStore)}::${nameof(this.selectedExplorer)} called before storage was initialized`);
    const { result } = this.getSelectedExplorerRequest.execute({ db });
    if (result == null) {
      // when still loading, just return the defaults
      return defaultToSelectedExplorer();
    }
    const convertedMap: Map<number, SelectedExplorer> = new Map();
    for (const [networkId, v] of result.entries()) {
      convertedMap.set(networkId, new SelectedExplorer({ backup: v.backup, selected: v.selected }));
    }
    return convertedMap;
  }

  @computed get allExplorers(): GetAllExplorersResponse {
    const db = this.stores.loading.loadPersistentDbRequest.result;
    if (db == null) throw new Error(`${nameof(ExplorerStore)}::${nameof(this.allExplorers)} called before storage was initialized`);
    const { result } = this.getAllExplorerRequest.execute({ db });
    if (result == null) {
      // when still loading, just return the defaults
      return prepackagedExplorers;
    }
    return result;
  }

  setSelectedExplorer: {|
    explorer: $ReadOnly<ExplorerRow>,
  |} => Promise<void> = async (request): Promise<void> => {
    const db = this.stores.loading.loadPersistentDbRequest.result;
    if (db == null) throw new Error(`${nameof(ExplorerStore)}::${nameof(this.setSelectedExplorer)} called before storage was initialized`);
    await this.setSelectedExplorerRequest.execute({
      db,
      ...request
    });
    await this.getSelectedExplorerRequest.execute({ db }); // eagerly cache
  };
}
