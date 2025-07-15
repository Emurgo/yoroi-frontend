self.addEventListener('push', function (event) {
  if (event && event.data) {
    const data = event.data.json();
    event.waitUntil(self.registration.showNotification(data.notification.title, {
      body: data.notification.body,
      //icon:
    }));
  }
});
