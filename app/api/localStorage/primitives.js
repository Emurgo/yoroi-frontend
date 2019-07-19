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

const getStorageItemInExtension = (key: ?string) => new Promise((resolve, reject) => {
  chrome.storage.local.get(key, (data, error) => {
    if (error) reject(error);
    if (!key) resolve(data);
    const value = data[key];
    if (value === undefined) resolve('');
    resolve(value);
  });
});

const getStorageItemInWeb = (key: ?string) => new Promise((resolve, reject) => {
  try {
    if (!key) return resolve(JSON.stringify(localStorage));
    const value = localStorage.getItem(key);
    if (!value) return resolve('');
    resolve(value);
  } catch (error) {
    return reject(error);
  }
});

export async function getLocalItem(key: ?string): Promise<string> {
  const isExtention = environment.userAgentInfo.isExtension;
  if (isExtention) return getStorageItemInExtension(key);
  return getStorageItemInWeb(key);
}

// =====
//  set
// =====

export async function setLocalItem(key: string, value: string): Promise<void> {
  const isExtention = environment.userAgentInfo.isExtension;
  return new Promise((resolve, reject) => {
    try {
      if (isExtention) chrome.storage.local.set({ [key]: value });
      else localStorage.setItem(key, value);
      resolve();
    } catch (error) {
      return reject(error);
    }
  });
}

// ========
//  remove
// ========

export async function removeLocalItem(key: string): Promise<void> {
  const isExtention = environment.userAgentInfo.isExtension;
  return new Promise((resolve) => {
    try {
      if (isExtention) chrome.storage.local.remove(key);
      else localStorage.removeItem(key);
      resolve();
    } catch (error) {} // eslint-disable-line
  });
}

// =======
//  utils
// =======

export async function isEmptyStorage(): Promise<boolean> {
  return new Promise(async (resolve) => {
    const isExtention = environment.userAgentInfo.isExtension;
    if (isExtention) {
      const isEmpty = await getStorageItemInExtension().then(
        (data: Object) => Object.keys(data).length === 0
      );
      resolve(isEmpty);
    }
    try {
      resolve(localStorage.length === 0);
    } catch (error) {} // eslint-disable-line  
  });
}
