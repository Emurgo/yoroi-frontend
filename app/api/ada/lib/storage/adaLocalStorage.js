// @flow

// Wrapper API to Save&Load localstorage using JSON

import type { ExplorerType } from '../../../../domain/Explorer';
import { getDefaultExplorer } from '../../../../domain/Explorer';
import { getLocalItem, setLocalItem } from '../../../localStorage/primitives';

// Use constant keys to store/load localstorage
const storageKeys = {
  SELECTED_EXPLORER_KEY: 'SELECTED_EXPLORER',
};

/* Selected explorer storage */

export async function saveSelectedExplorer(explorer: ExplorerType): Promise<void> {
  await _saveInStorage(storageKeys.SELECTED_EXPLORER_KEY, explorer);
}

export async function getSelectedExplorer(): Promise<ExplorerType> {
  const explorer = await _getFromStorage<ExplorerType>(storageKeys.SELECTED_EXPLORER_KEY);
  return explorer || getDefaultExplorer();
}

/* Util functions */
export async function _saveInStorage(key: string, toSave: any): Promise<void> {
  await setLocalItem(key, JSON.stringify(toSave));
}

export async function _getFromStorage<T>(key: string): Promise<T | void> {
  return await getLocalItem(key).then((result) => {
    if (result == null) {
      return result;
    }
    return JSON.parse(result);
  });
}
