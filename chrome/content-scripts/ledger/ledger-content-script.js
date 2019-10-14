console.debug('[CS-LEDGER] Loading');
(function init () {
  console.debug('[CS-LEDGER] Execution begins');

  const YOROI_LEDGER_CONNECT_TARGET_NAME = 'YOROI-LEDGER-CONNECT';
  const ORIGIN = 'https://emurgo.github.io';
  const closeWindowMsg = {
    target: YOROI_LEDGER_CONNECT_TARGET_NAME,
    action: 'close-window'
  }
  const portName = {
    name: YOROI_LEDGER_CONNECT_TARGET_NAME
  };
  
  // Make Extension and WebPage port to communicate over this channel
  let browserPort = chrome.runtime.connect(portName);
  
  // Passing messages from Extension ==> WebPage
  browserPort.onMessage.addListener(msg => {
    window.postMessage(msg, window.location.origin);
  });
  
  // Close WebPage window when port is closed
  browserPort.onDisconnect.addListener(d => {
    console.debug(`[CS-LEDGER] Closing WebPage window!!`);
    window.postMessage(closeWindowMsg, window.location.origin);
  });
  
  // Passing messages from WebPage ==> Extension
  window.addEventListener('message', event => {
    if(event.origin === ORIGIN && event.data) {
      const { data } = event;
      // As this listener, listens to events that needs to be passed to WebPage as well,
      // but here we are only intersted in passing result to the Extension
      if (data.action && data.action.endsWith('-reply') && browserPort) {
        browserPort.postMessage(event.data)
      }
    } else {
      console.debug(`[CS-LEDGER] Wrong origin or no data object: ${event.origin}`);
    }
  });
}());