// @flow

import type {
  ExplorerRow, LinkType
} from '../api/ada/lib/storage/database/explorers/tables';
import { prepackagedDefaultExplorers } from '../api/ada/lib/storage/database/prepackaged/explorers';

export class SelectedExplorer {
  selected: $ReadOnly<ExplorerRow>;
  backup: $ReadOnly<ExplorerRow>;

  constructor(data: {|
    selected?: $ReadOnly<ExplorerRow>,
    backup: $ReadOnly<ExplorerRow>,
  |}) {
    this.selected = data.selected ?? data.backup;
    this.backup = data.backup;
  }

  getOrDefault: LinkType => {|
    name: string,
    baseUrl: string,
  |} = (type) => {
    const selectedLink = this.selected.Endpoints[type];
    if (selectedLink != null) {
      return {
        name: this.selected.Name,
        baseUrl: selectedLink,
      };
    }
    const backupLink = this.backup.Endpoints[type];
    if (backupLink != null) {
      return {
        name: this.backup.Name,
        baseUrl: backupLink,
      };
    }
    throw new Error(`Endpoint ${type} not in either selected or backup`);
  }
}

export function defaultToSelectedExplorer(): Map<number, SelectedExplorer> {
  const convertedMap: Map<number, SelectedExplorer> = new Map();
  for (const [networkId, backup] of prepackagedDefaultExplorers.entries()) {
    convertedMap.set(networkId, new SelectedExplorer({ backup }));
  }
  return convertedMap;
}
