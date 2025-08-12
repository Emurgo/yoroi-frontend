import appState from '../../../api/appState';
import { call } from '../../../api/objectModel';
import LocalStorageApi from '../../../app/api/localStorage';
import { ROUTES } from '../../../app/routes-config';

const localStorageApi = new LocalStorageApi();

const broadcast = new BroadcastChannel('');
let currentNotificationId;

type Screen = 'wallet' | 'staking_center' | 'swap' | 'cashback' | 'governance';
interface EventData {
  data: {
    action?: 'open_screen';
    screen?: Screen;
  };
  notification: {
    title: string;
    body: string;
  };
  fcmMessageId: string;
}

interface Event {
  data: {
    type: 'push-notification';
    eventData: EventData;
  };
}

const REDIRECTIONS: { id: Screen, route: string }[] = [
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
    route: ROUTES.SWAP_REVAMP,
  },
  {
    id: 'cashback',
    route: ROUTES.CASHBACK.ROOT,
  },
  {
    id: 'governance',
    route: ROUTES.Governance.ROOT,
  }
];

interface NotificationData {
  fcmMessageId: string,
  route: null | string,
}

// missing builtin
interface NotificationEvent<DataType> {
  notification: {
    close: () => void,
    data: DataType,
  },
}

// @ts-ignore
self.addEventListener('notificationclick', (event: NotificationEvent<NotificationData>) => {
  if (event.notification.data.route) {
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

broadcast.onmessage = async (event: Event) => {
  if (event.data.type === 'push-notification') {
    const { eventData } = event.data;
    const locale = await localStorageApi.getUserLocale() ?? 'en-US';;

    let redirectionRoute: null | string  = null;

    const redirection = (eventData.data.action === 'open_screen') ?
      REDIRECTIONS.find(({ id }) => id === eventData.data.screen) : null;
    if (redirection) {
      redirectionRoute = redirection.route;
    }

    const title = (eventData.data['title-' + locale]) ?? eventData.notification.title;
    const body = (eventData.data['body-' + locale]) ?? eventData.notification.body;
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
      },
    });

    call(appState.notifications.add, {
      title: title,
      body: body,
      fcmMessageId: eventData.fcmMessageId,
      read: false,
      time: new Date().toISOString(),
    });

    currentNotificationId = eventData.fcmMessageId;
  }
};
