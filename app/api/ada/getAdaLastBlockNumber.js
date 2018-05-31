// @flow
import {
  getFromStorage,
  saveInStorage
} from './lib/utils';

const LAST_BLOCK_NUMBER_KEY = 'LAST_BLOCK_NUMBER'; // stores de last block number

export function getLastBlockNumber() {
  return getFromStorage(LAST_BLOCK_NUMBER_KEY);
}

export function saveLastBlockNumber(blockNumber: number): void {
  saveInStorage(LAST_BLOCK_NUMBER_KEY, blockNumber);
}
