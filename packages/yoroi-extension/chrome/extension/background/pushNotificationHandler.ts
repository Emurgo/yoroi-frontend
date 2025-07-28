import appState from '../../../api/appState';
import { call, makeAccessorServer } from '../../../api/objectModel';

const broadcast = new BroadcastChannel('');

interface Event {
  data: {
    type: 'push-notification',
    title: string,
    body: string,
    fcmMessageId: string,
  } | {
    type: 'push-notification-close',
    data: {
      fcmMessageId: string,
    },
  }
}

broadcast.onmessage = (event: Event) => {
  if (event.data.type === 'push-notification') {
    call(appState.notifications.add, {
      title: event.data.title,
      body: event.data.body,
      fcmMessageId: event.data.fcmMessageId,
      read: false,
      time: (new Date()).toISOString(),
    });
  } else if (event.data.type === 'push-notification-close') {
    call(notifications.setRead, event.data.data.fcmMessageId);
  }
}

const { request } = makeAccessorServer(appState, (serverEvent) => {
  {
    type: 'yoroi-ng-server-event',
    serverEvent
  }

})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'yoroi-ng-client-request') {
    request(message.clientRequest).then(sendResponse);
  }
  return true;
});
