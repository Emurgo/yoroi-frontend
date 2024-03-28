// @flow

import { schema } from 'lovefield';
import { loadLovefieldDBFromDump } from './ada/lib/storage/database';
import type { lf$Database, } from 'lovefield';

function callBackground<T, R>(message: T): Promise<R> {
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(message, response => {
      if (window.chrome.runtime.lastError) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(`Error when calling the background with: ${JSON.stringify(message) ?? 'undefined'}`);
        return;
      }
      resolve(response);
    });
  });
}

const DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;

export async function getDb(): Promise<lf$Database> {
  const dataStr = await callBackground({ type: 'get-db' });
  const data = JSON.parse(dataStr, (key, value) => {
    if (typeof value === 'string' && DATE_REGEX.exec(value)) {
      return new Date(value);
    }
    return value;
  });
  return await loadLovefieldDBFromDump(schema.DataStoreType.MEMORY, data);
}
