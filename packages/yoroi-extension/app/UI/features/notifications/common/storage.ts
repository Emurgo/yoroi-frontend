import {App} from '@yoroi/types';

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

  return {
    join: (folderName: string) => mountLocalStorage({ path: `${path}${folderName}` }),

    getItem,
    multiGet,
    setItem: async <T>(key: string, value: T, stringify: (data: T) => string = JSON.stringify) => {
      localStorage.setItem(withPath(key), stringify(value));
    },
    multiSet: async <T>(tuples: ReadonlyArray<[string, T]>, stringify: (data: T) => string = JSON.stringify) => {
      tuples.forEach(([key, value]) => {
        localStorage.setItem(withPath(key), stringify(value));
      });
    },
    removeItem: async (key: string) => {
      localStorage.removeItem(withPath(key));
    },
    removeFolder: async (folderName: string) => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(path) && withoutPath(key).startsWith(folderName)) {
          localStorage.removeItem(key);
        }
      });
    },
    multiRemove: async (keys: ReadonlyArray<string>) => {
      keys.forEach((key) => localStorage.removeItem(withPath(key)));
    },
    getAllKeys: async (): Promise<ReadonlyArray<any>> => {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(path))
        .map(withoutPath);
    },
    clear: async () => {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(path)) localStorage.removeItem(key);
      });
    },
  };
};
