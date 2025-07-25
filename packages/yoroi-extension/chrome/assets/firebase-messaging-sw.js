const broadcast = new BroadcastChannel('');
let currentNotificationId;

self.addEventListener('push', (event) => {
  if (event && event.data) {
    const data = event.data.json();
    /*
    {
      "data": {
        "gcm.n.e": "1",
        "google.c.a.ts": "1753344984",
        "google.c.a.udt": "0",
        "google.c.a.e": "1",
        "google.c.a.c_id": "2972676158623832449",
        "google.c.a.c_l": "this title"
      },
      "from": "290850618958",
      "priority": "high",
      "notification": {
        "title": "this title",
        "body": "wow text",
        "tag": "campaign_collapse_key_2972676158623832449"
      },
      "fcmMessageId": "6da3daea-c1e2-483a-a1ec-478c0c7fd285",
      "collapse_key": "campaign_collapse_key_2972676158623832449"
    }
    */
    event.waitUntil(
      broadcast.postMessage({
        type: 'push-notification',
        title: data.notification.title,
        body: data.notification.body,
        fcmMessageId: data.fcmMessageId,
      }),
      self.registration.showNotification(
        data.notification.title,
        {
          body: data.notification.body,
          actions: [
            {
              action: 'close',
              title: 'OK',
              type: 'button',
            },
          ],
          data: {
            fcmMessageId: data.fcmMessageId,
          },
        }
      )
    );
    currentNotificationId = data.fcmMessageId;
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // the `notificationclose` event will be fired
});

self.addEventListener('notificationclose', (event) => {
  if (event.notification.data.fcmMessageId !== currentNotificationId) {
    // this is the previous notification timed out and a new notification has come
    return;
  }
  broadcast.postMessage({
    data: {
      fcmMessageId: event.notification.data.fcmMessageId
    },
    type: 'push-notification-close',
  });
});
