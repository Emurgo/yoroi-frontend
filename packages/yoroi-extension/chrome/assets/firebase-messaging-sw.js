const broadcast = new BroadcastChannel('');

self.addEventListener('push', event => {
  if (event && event.data) {
    const eventData = event.data.json();
    event.waitUntil(
      broadcast.postMessage({
        type: 'push-notification',
        eventData
      })
    );
  }
});
