// @flow

import environment from '../../environment';

/**
 * The `chrome` variable refers to the JavaScript APIs for WebExtensions that can be accessed
 * by Firefox and Chrome. As its name says, this can be accessed only by the WebExtension.
 * so the WebPage will use the `localStorage`.
 */

declare var chrome;

// =====
//  get
// =====

const getStorageItemInExtension = async (
  key: string | void
): Promise<?string> => new Promise((resolve, reject) => {
  chrome.storage.local.get(key, (data: {}, error) => {
    if (error) reject(error);
    if (key === undefined) {
      resolve(JSON.stringify(data));
    } else {
      const value: any = data[key];
      // need to ensure type is string to match localStorage API
      if (value == null) {
        resolve(value);
      } else if (typeof value === 'string') {
        resolve(value);
      } else {
        reject(new Error('getStorageItemInExtension cannot get non-string value'));
      }
    }
  });
});

const getStorageItemInWeb = async (
  key: string | void
): Promise<?string> => {
  if (!key) return Promise.resolve(JSON.stringify(localStorage));
  // careful: getItem returns null on missing key. Indexer returns undefined
  return Promise.resolve(localStorage[key]);
};

/** passing undefined gives you the whole storage as a JSON string */
export async function getLocalItem(key: string | void): Promise<?string> {
  const isExtension = environment.userAgentInfo.isExtension;
  if (isExtension) {
    return await getStorageItemInExtension(key);
  }
  return await getStorageItemInWeb(key);
}

// =====
//  set
// =====

export async function setLocalItem(key: string, value: string): Promise<void> {
  const isExtension = environment.userAgentInfo.isExtension;
  if (isExtension) {
    await chrome.storage.local.set({ [key]: value });
  } else {
    localStorage.setItem(key, value);
  }
}

// ========
//  remove
// ========

export async function removeLocalItem(key: string): Promise<void> {
  const isExtension = environment.userAgentInfo.isExtension;

  if (isExtension) {
    await chrome.storage.local.remove(key);
  } else {
    localStorage.removeItem(key);
  }
}

export async function clear(): Promise<void> {
  const isExtension = environment.userAgentInfo.isExtension;
  if (isExtension) {
    await chrome.storage.local.clear();
  } else {
    localStorage.clear();
  }
}

// ==========
//  listener
// ==========

type StorageChange = {
  [key: string]: {
    +oldValue?: any,
    +newValue?: any,
  }
}
/**
 * Warning!
 * There are a lof of differences between localStorage and storage.local listeners
 * This API makes localStorage behave more like storage.local
 * but some subtle parts can't be mapped to storage.local behavior
 *
 * When running as a webpage
 * the listener is only called if storage is modified by a separate tab
 *
 * When running as an extension
 * the listener is called even if even if it comes from the same tab
 */
export function addListener(
  listener: StorageChange => void,
): void {
  const isExtension = environment.userAgentInfo.isExtension;
  if (isExtension) {
    chrome.storage.onChanged.addListener((changes, _area) => {
      listener(changes);
    });
  } else {
    window.addEventListener('storage', (e: StorageEvent) => {
      // can't map behavior when key is null  (happens when .clear() is called)
      if (e.key == null) {
        return;
      }
      const oldValue = e.oldValue
        ? { oldValue: JSON.parse(e.oldValue) }
        : {};
      const newValue = e.newValue
        ? { newValue: JSON.parse(e.newValue) }
        : {};
      listener({
        [e.key]: {
          ...oldValue,
          ...newValue,
        }
      });
    });
  }
}

// =======
//  utils
// =======

export async function isEmptyStorage(): Promise<boolean> {
  const isExtension = environment.userAgentInfo.isExtension;
  if (isExtension) {
    const isEmpty = await getStorageItemInExtension().then(
      (data: Object) => Object.keys(data).length === 0
    );
    return isEmpty;
  }

  return localStorage.length === 0;
}
