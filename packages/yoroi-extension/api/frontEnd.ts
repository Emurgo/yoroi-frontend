import type Notifications from './notifications';
import { getValue, listen, makeClientAccessor, cache } from './objectModel';


const { modelAccessor: notificationModel, onServerEvent } = makeClientAccessor<Notifications>((clientRequest) => {
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

const cachedNotifications = cache(notificationModel);

function use<T>(value: T): { loaded: false } | { loaded: true, value: T} {
  const [retVal, setRetVal] = useState({ loaded: false });

  useEffect(() => {
    getValue(value).then((v) => {
      setRetVal({ value: v, loaded: true });
    });
    return listen(value, (event) => {
      getValue(value).then((v) => {
        setRetVal({ value: v, loaded: true });
      });
    });
  }, []);
  return retVal;
}

export {
  use,
  notifications: cachedNotifications,
};
