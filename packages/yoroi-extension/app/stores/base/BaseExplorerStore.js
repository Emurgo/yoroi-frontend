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
import { SelectedExplorer, defaultToSelectedExplorer } from '../../domain/SelectedExplorer';

export default class BaseExplorerStore
  <
    TStores: {
      ...,
    }
  > extends Store<TStores> {

  @observable getSelectedExplorerRequest: Request<typeof getSelectedExplorer>
    = new Request(getSelectedExplorer);

  @observable setSelectedExplorerRequest: Request<typeof saveSelectedExplorer>
    = new Request(saveSelectedExplorer);

  @observable getAllExplorerRequest: Request<typeof getAllExplorers>
    = new Request(getAllExplorers);

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
    networkId: number, explorerId: string,
  |} => Promise<void> = async (request): Promise<void> => {
    const explorer = this.allExplorers.get(request.networkId)?.find(
      ({ ExplorerId }) => request.explorerId === ExplorerId
    );
    if (!explorer) {
      return;
    }
    await this.setSelectedExplorerRequest.execute({ explorer });
    await this.getSelectedExplorerRequest.execute(); // eagerly cache
  };
}
