
let portName = {
  name: 'YOROI-LEDGER-CONNECT'
};

// Make Extension and WebPage port to communicate over this channel
let browserPort = chrome.runtime.connect(portName);

// Passing messages from Extension ==> WebPage
browserPort.onMessage.addListener(msg => {
  window.postMessage(msg, window.location.origin);
});

// De-refer and close window when port is closed
browserPort.onDisconnect.addListener(d => {
  window.close();
  browserPort = null;
});

// Passing messages from WebPage ==> Extension
window.addEventListener('message', event => {
  console.log(JSON.stringify(event.data, null, 2));
  if (browserPort) {
    browserPort.postMessage(event.data)
  }
});
