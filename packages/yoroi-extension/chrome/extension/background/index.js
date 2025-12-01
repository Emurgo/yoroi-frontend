// @flow
// $FlowIgnore
import './pushNotificationHandler';
import debounce from 'lodash/debounce';
import { handleInjectorMessage } from './handlers/content';
import { getHandler } from './handlers/yoroi';
import { init } from './state';
import { startMonitorServerStatus } from './serverStatus';
import { startPoll } from './coinPrice';
import { bringInitBackground } from '@emurgo/bringweb3-chrome-extension-kit';
import type { ConfigType } from '../../../config/config-types';
// $FlowIgnore
import { makeAccessorServer } from '../../../api/objectModel';
// $FlowIgnore
import appState from '../../../api/appState';
import { storeLog, createLogEntry } from '../../../app/utils/logStorage';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

/*::
declare var chrome;
declare var browser;
*/

// Intercept console methods to store logs
(function setupConsoleLogging() {
  const originalConsole = {
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

 

  // $FlowFixMe[cannot-write] - We need to override console methods for logging
  console.info = (...args: Array<any>) => {
    originalConsole.info(...args);
    storeLog('background', createLogEntry('info', ...args)).catch(() => {
      // Ignore storage errors
    });
  };

  // $FlowFixMe[cannot-write] - We need to override console methods for logging
  console.warn = (...args: Array<any>) => {
    originalConsole.warn(...args);
    storeLog('background', createLogEntry('warn', ...args)).catch(() => {
      // Ignore storage errors
    });
  };

  // $FlowFixMe[cannot-write] - We need to override console methods for logging
  console.error = (...args: Array<any>) => {
    originalConsole.error(...args);
    storeLog('background', createLogEntry('error', ...args)).catch(() => {
      // Ignore storage errors
    });
  };
})();

// noinspection JSIgnoredPromiseFromCall
bringInitBackground({
  identifier: CONFIG.bring.identifier,
  apiEndpoint: CONFIG.bring.apiEndpoint,
  cashbackPagePath: '/main_window.html#/cashback',
  whitelistEndpoint: 'https://raw.githubusercontent.com/Emurgo/bring-chromeExtension/refs/heads/main/bring-cashback-redirect-whitelist.json',
});

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

if (chrome.action) {
  // manifest v3
  chrome.action.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));
} else {
  // manifest v2
  chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //fixme: verify sender.id === extension id
  /*if (environment.isDev()) {
    console.debug(`get message ${JSON.stringify(sanitizeForLog(message))} from ${sender.tab.id}`);
  }*/
  
  // Handle log messages from content scripts (connector)
  if (message.type === 'yoroi-log-entry') {
    storeLog('connector', message.logEntry).catch(() => {
      // Ignore storage errors
    });
    return false; // No response needed
  }
  
  const handler = getHandler(message.type);
  if (handler) {
    const deserializedMessage = {
      type: message.type,
      request: JSON.parse(message.request),
    };
    handler(deserializedMessage, sender, sendResponse);
    // Returning `true` is required by Firefox, see:
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
    return true;
  }
  return handleInjectorMessage(message, sender);
});
init().catch(console.error);
startMonitorServerStatus();
startPoll();

const { request } = makeAccessorServer(appState, async (serverEvent) => {
  const tabs = await chrome.tabs.query({});
  for (let tab of tabs) {
    if (tab.url.startsWith(location.origin)) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'yoroi-ng-server-event',
          serverEvent
        }
      );
    }
  }
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'yoroi-ng-client-request') {
    request(message.clientRequest).then(sendResponse).catch(console.error);
  }
  return true;
});
