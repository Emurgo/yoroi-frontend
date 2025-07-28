import { useState, useEffect } from 'react';
import type Notifications from './notifications';
import { getValue, listen, makeClientAccessor, cache } from './objectModel';


const { modelAccessor: notificationModel, onServerEvent } = makeClientAccessor<typeof Notifications>((clientRequest) => {
  const msg = {
    type: 'yoroi-ng-client-request',
    clientRequest,
  };
  return new Promise((resolve, reject) => {
    window.chrome.runtime.sendMessage(msg, response => {
      if (window.chrome.runtime.lastError) {
        reject(`Error ${window.chrome.runtime.lastError} when calling the background`);
        return;
      }
      resolve(response);
    });
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'yoroi-ng-server-event') {
    onServerEvent(msg.serverEvent);
  }
});

export const cachedNotifications = cache(notificationModel);

type RetT<T> = { loaded: false } | { loaded: true, value: T}
export function use<T>(value: T extends (...args: any) => any ? never : T): RetT<T> {
  const [retVal, setRetVal] = useState<RetT<T>>({ loaded: false });

  useEffect(() => {
    getValue(value).then((v) => {
      setRetVal({ value: v, loaded: true });
    });
    return listen(value, (event) => {
      if (event.type === 'change') {
        getValue(value).then((v) => {
          setRetVal({ value: v, loaded: true });
        });
      }
    });
  }, []);
  return retVal;
}
