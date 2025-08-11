import appState from '../../../api/appState';
import { call } from '../../../api/objectModel';
import TRANSLATIONS from './i18n';
import LocalStorageApi from '../../../app/api/localStorage';
import { ROUTES } from '../../../app/routes-config';

const localStorageApi = new LocalStorageApi();

const broadcast = new BroadcastChannel('');
let currentNotificationId;

type Screen = 'wallet' | 'staking_center' | 'swap' | 'cashback' | 'governance';

interface EventData {
  data:
    | {
        action: 'open_screen';
        screen: Screen;
      }
    | {};
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

const REDIRECTIONS: { id: Screen, messageId: string, route: string }[] = [
  {
    id: 'wallet',
    messageId: 'notification.button.wallet',
    route: ROUTES.WALLETS.ROOT,
  },
  {
    id: 'staking_center',
    messageId: 'notification.button.stakingCenter',
    route: ROUTES.STAKING,
  },
  {
    id: 'swap',
    messageId: 'notification.button.swap',
    route: ROUTES.SWAP_REVAMP,
  },
  {
    id: 'cashback',
    messageId: 'notification.button.cashback',
    route: ROUTES.CASHBACK.ROOT,
  },
  {
    id: 'governance',
    messageId: 'notification.button.governance',
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

    let actionButtonTitle = 'OK';
    let route: null | string  = null;
    // @ts-ignore
    const redirection = (eventData.data.action === 'open_screen') ?
      // @ts-ignore
      REDIRECTIONS.find(({ id }) => id === eventData.data.screen) : null;
    if (redirection) {
      const locale = await localStorageApi.getUserLocale() ?? 'en-US';
      const translation = TRANSLATIONS[locale] ?? TRANSLATIONS['en-US'];
      actionButtonTitle = translation[redirection.messageId];
      route = redirection.route;
    }

    // @ts-ignore
    self.registration.showNotification(eventData.notification.title, {
      body: eventData.notification.body,
      actions: [
        {
          action: 'close', // placeholder value, not used anywhere
          title: actionButtonTitle,
          type: 'button',
        },
      ],
      data: {
        fcmMessageId: eventData.fcmMessageId,
        route,
      },
    });

    call(appState.notifications.add, {
      title: eventData.notification.title,
      body: eventData.notification.body,
      fcmMessageId: eventData.fcmMessageId,
      read: false,
      time: new Date().toISOString(),
    });

    currentNotificationId = eventData.fcmMessageId;
  }
};
