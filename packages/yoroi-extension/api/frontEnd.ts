import { useState, useEffect } from 'react';
import type AppStateType from './appState';
import { getValue, listen, makeClientAccessor, cache, call } from './objectModel';

const { modelAccessor, onServerEvent } = makeClientAccessor<typeof AppStateType>(clientRequest => {
  const msg = {
    type: 'yoroi-ng-client-request',
    clientRequest,
  };
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(msg, response => {
      if (window.chrome.runtime.lastError) {
        reject(`Error ${window.chrome.runtime.lastError.message} when calling the background`);
        return;
      }
      resolve(response);
    });
  });
});

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'yoroi-ng-server-event') {
    onServerEvent(msg.serverEvent);
  }
});

// @ts-ignore
export const appState = cache(modelAccessor);

type RetT<T> = { loaded: false; value: undefined } | { loaded: true; value: T };
export function useModelValue<T>(value: T extends (...args: any) => any ? never : T): RetT<T> {
  const [retVal, setRetVal] = useState<RetT<T>>({ loaded: false, value: undefined });

  useEffect(() => {
    getValue(value).then(v => {
      setRetVal({ value: v, loaded: true });
    });
    return listen(value, event => {
      if (event.type === 'change') {
        getValue(value).then(v => {
          setRetVal({ value: v, loaded: true });
        });
      }
    });
  }, []);
  return retVal;
}

export { call };
