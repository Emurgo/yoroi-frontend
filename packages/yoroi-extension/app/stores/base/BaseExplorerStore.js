// @flow
import {
  observable,
  computed,
} from 'mobx';

import Store from './Store';
import Request from '../lib/LocalizedRequest';
import { getSelectedExplorer, getAllExplorers, saveSelectedExplorer, } from '../../api/thunk';
import type { GetAllExplorersResponse } from '../../api/ada/lib/storage/bridge/explorers';
import { prepackagedExplorers, } from '../../api/ada/lib/storage/database/prepackaged/explorers';
import type {
  ExplorerRow
} from '../../api/ada/lib/storage/database/explorers/tables';
import { SelectedExplorer, defaultToSelectedExplorer } from '../../domain/SelectedExplorer';
import ExplorerActions from '../../actions/common/explorer-actions';

export default class BaseExplorerStore
  <
    TStores: {
      ...,
    },
    TActions: { +explorers: ExplorerActions, ... },
  > extends Store<TStores, TActions> {

  @observable getSelectedExplorerRequest: Request<typeof getSelectedExplorer>
    = new Request(getSelectedExplorer);

  @observable setSelectedExplorerRequest: Request<typeof saveSelectedExplorer>
    = new Request(saveSelectedExplorer);

  @observable getAllExplorerRequest: Request<typeof getAllExplorers>
    = new Request(getAllExplorers);

  setup(): void {
    this.actions.explorers.updateSelectedExplorer.listen(this.setSelectedExplorer);
  }

  // ========== Selected Explorer ========== //

  @computed get selectedExplorer(): Map<number, SelectedExplorer> {
    if (this.getSelectedExplorerRequest.result == null) {
      // when still loading, just return the defaults
      this.getSelectedExplorerRequest.execute();
      return defaultToSelectedExplorer();
    }
    const { result } = this.getSelectedExplorerRequest;
    const convertedMap: Map<number, SelectedExplorer> = new Map();
    for (const [networkId, v] of result.entries()) {
      convertedMap.set(networkId, new SelectedExplorer({ backup: v.backup, selected: v.selected }));
    }
    return convertedMap;
  }

  @computed get allExplorers(): GetAllExplorersResponse {
    if (this.getAllExplorerRequest.result == null) {
      // when still loading, just return the defaults
      this.getAllExplorerRequest.execute();
      return prepackagedExplorers;
    }
    return this.getAllExplorerRequest.result;
  }

  setSelectedExplorer: {|
    explorer: $ReadOnly<ExplorerRow>,
  |} => Promise<void> = async (request): Promise<void> => {
    await this.setSelectedExplorerRequest.execute(request);
    await this.getSelectedExplorerRequest.execute(); // eagerly cache
  };
}
