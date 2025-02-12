import { App } from '@yoroi/types';

type Props = {
  path: string;
}

type Parse<T> = (item: string | null) => T | null;

const defaultParse = <T>(item: string | null): T | null => {
  if (item == null) return null;
  return JSON.parse(item);
}

export const mountLocalStorage = ({ path }: Props): App.Storage => {
  const withPath = (key: string) => `${path}${key}`;
  const withoutPath = (value: string) => value.slice(path.length);


  async function getItem<U>(key: string, parse: Parse<U> = defaultParse): Promise<U | null> {
    const item = localStorage.getItem(withPath(key));
    return parse(item);
  }

  async function multiGet<U, K>(_keys: ReadonlyArray<string>, _parse: Parse<U> = defaultParse): Promise<ReadonlyArray<[K, U | null]>> {
    throw new Error('Not implemented');
  }

  async function setItem<U>(key: string, value: U, stringify: (data: U) => string = JSON.stringify): Promise<void> {
    localStorage.setItem(withPath(key), stringify(value));
  }

  async function multiSet<U>(_tuples: ReadonlyArray<[string, U]>, _stringify: (data: U) => string = JSON.stringify): Promise<void> {
    throw new Error('Not implemented');
  }

  async function removeItem(key: string): Promise<void> {
    localStorage.removeItem(withPath(key));
  }

  async function removeFolder(folderName: string): Promise<void> {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(path) && withoutPath(key).startsWith(folderName)) {
        localStorage.removeItem(key);
      }
    });
  }

  async function multiRemove(keys: ReadonlyArray<string>): Promise<void> {
    keys.forEach((key) => localStorage.removeItem(withPath(key)));
  }

  async function getAllKeys(): Promise<ReadonlyArray<any>> {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(path))
      .map(withoutPath);
  }

  async function clear(): Promise<void> {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(path)) localStorage.removeItem(key);
    });
  }

  return {
    join: (folderName: string) => mountLocalStorage({ path: `${path}${folderName}` }),

    getItem,
    multiGet,
    setItem,
    multiSet,
    removeItem,
    removeFolder,
    multiRemove,
    getAllKeys,
    clear,
  };
};
