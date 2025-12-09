import appState from '../../../api/appState';
import { call } from '../../../api/objectModel';
import LocalStorageApi from '../../../app/api/localStorage';
import { ROUTES } from '../../../app/routes-config';

const localStorageApi = new LocalStorageApi();

let currentNotificationId;

type Screen = 'wallet' | 'staking_center' | 'swap' | 'cashback' | 'governance';
interface EventData {
  data: {
    action?: 'open_screen' | 'open_url';
    screen?: Screen;
    url?: string;
  };
  notification: {
    title: string;
    body: string;
  };
  fcmMessageId: string;
}

const REDIRECTIONS: { id: Screen; route: string }[] = [
  {
    id: 'wallet',
    route: ROUTES.WALLETS.ROOT,
  },
  {
    id: 'staking_center',
    route: ROUTES.STAKING,
  },
  {
    id: 'swap',
    route: ROUTES.SWAP.ROOT,
  },
  {
    id: 'cashback',
    route: ROUTES.CASHBACK.ROOT,
  },
  {
    id: 'governance',
    route: ROUTES.GOVERNANCE.ROOT,
  },
];

interface NotificationData {
  fcmMessageId: string;
  route: null | string;
  url: null | string;
}

// missing builtin
interface NotificationEvent<DataType> {
  notification: {
    close: () => void;
    data: DataType;
  };
}

// @ts-ignore
self.addEventListener('notificationclick', (event: NotificationEvent<NotificationData>) => {
  if (event.notification.data.url) {
    chrome.tabs.create({ url: event.notification.data.url });
  } else if (event.notification.data.route) {
    chrome.tabs.create({ url: `main_window.html#${event.notification.data.route}` });
  }
  event.notification.close();
  // the `notificationclose` event will be fired
});

// @ts-ignore
self.addEventListener('notificationclose', (event: NotificationEvent<NotificationData>) => {
  if (event.notification.data.fcmMessageId !== currentNotificationId) {
    // this is the previous notification timed out and a new notification has come
    return;
  }

  call(appState.notifications.setRead, event.notification.data.fcmMessageId);
});

async function pushHandler(eventData) {
  const locale = (await localStorageApi.getUserLocale()) ?? 'en-US';

  let redirectionRoute: null | string = null;
  let externalUrl: null | string = null;
  const isExternalUrl = eventData.data.action === 'open_url' && eventData.data.url && typeof eventData.data.url === 'string';

  if (isExternalUrl) {
    externalUrl = eventData.data.url;
  } else {
    const redirection =
      eventData.data.action === 'open_screen' ? REDIRECTIONS.find(({ id }) => id === eventData.data.screen) : null;
    if (redirection) {
      redirectionRoute = redirection.route;
    }
  }

  const title = eventData.data['title-' + locale] ?? eventData.notification.title;
  const body = eventData.data['body-' + locale] ?? eventData.notification.body;
  if (typeof title !== 'string' || typeof body !== 'string') {
    return;
  }
  // @ts-ignore
  self.registration.showNotification(title, {
    body,
    actions: [],
    data: {
      fcmMessageId: eventData.fcmMessageId,
      route: redirectionRoute,
      url: externalUrl,
    },
  });

  call(appState.notifications.add, {
    title: title,
    body: body,
    fcmMessageId: eventData.fcmMessageId,
    read: false,
    time: new Date().toISOString(),
    isExternalUrl: isExternalUrl,
    redirection: isExternalUrl ? externalUrl : redirectionRoute,
  });

  currentNotificationId = eventData.fcmMessageId;
}

declare var pushNotificationEventData: EventData | null;
declare var pushNotificationEventHandler: (_: EventData) => void | Promise<void>;

if (typeof pushNotificationEventData !== 'undefined') {
  pushNotificationEventHandler = pushHandler;

  if (pushNotificationEventData) {
    pushHandler(pushNotificationEventData);
    pushNotificationEventData = null;
  }
} else {
  // dev mode
  self.addEventListener('push', (event: any) => {
    if (event && event.data) {
      pushHandler(event.data.json());
    }
  });
}
