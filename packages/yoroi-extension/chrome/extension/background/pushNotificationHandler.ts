import appState from '../../../api/appState';
import { call } from '../../../api/objectModel';

const broadcast = new BroadcastChannel('');
let currentNotificationId;

interface EventData {
  data: {
    action: 'open_screen',
    screen: 'wallet' | 'stacking_center' | 'swap' | 'cashback' | 'governance',
  } | {
  },
  notification: {
    title: string,
    body: string,
  },
  fcmMessageId: string,
}

interface Event {
  data:
    | {
        type: 'push-notification';
        eventData: EventData;
      }
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // the `notificationclose` event will be fired
});

self.addEventListener('notificationclose', event => {
  if (event.notification.data.fcmMessageId !== currentNotificationId) {
    // this is the previous notification timed out and a new notification has come
    return;
  }

  call(appState.notifications.setRead, event.notification.data.fcmMessageId);
});

broadcast.onmessage = (event: Event) => {
  if (event.data.type === 'push-notification') {
    const { eventData } = event.data;
    self.registration.showNotification(eventData.notification.title, {
      body: eventData.notification.body,
      actions: [
        {
          action: 'close',
          title: 'OK',
          type: 'button',
        },
      ],
      data: {
        fcmMessageId: eventData.fcmMessageId,
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
