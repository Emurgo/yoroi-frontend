// @flow
import debounce from 'lodash/debounce';
import { handleInjectorMessage } from './handlers/content';
import { getHandler } from './handlers/yoroi';
import { init } from './state';
import { startMonitorServerStatus } from './serverStatus';
import { startPoll } from './coinPrice';
import { environment } from '../../../app/environment';
import { bringInitBackground } from '@emurgo/bringweb3-chrome-extension-kit';
import { sanitizeForLog } from '../../../app/coreUtils';
import LocalStorageApi from '../../../app/api/localStorage/index';
import type { ConfigType } from '../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

/*::
declare var chrome;
declare var browser;
*/

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
  if (environment.isDev()) {
    console.debug(`get message ${JSON.stringify(sanitizeForLog(message))} from ${sender.tab.id}`);
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

if (environment.isFirefox()) {
  browser.runtime.onInstalled.addListener(async () => {
    const analyticsFlag = await new LocalStorageApi().loadIsAnalyticsAllowed();
    if (analyticsFlag == null) {
      onYoroiIconClicked();
    }
  });
}

self.addEventListener('push', (event) => {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data?.json() ?? {};
  const title = data.title || 'Something Has Happened';
  const message =
    data.message || 'Here\'s something you might want to check out.';

  self.registration.showNotification(title, { body: message });
});
