// @flow
import debounce from 'lodash/debounce';
import { handleInjectorMessage } from './handlers/content';
import { getHandler } from './handlers/yoroi';
import { init } from './state';
import { startMonitorServerStatus } from './serverStatus';
import { startPoll } from './coinPrice';
import { environment } from '../../../app/environment';
import axios from 'axios';
import fetchAdapter from '@vespaiach/axios-fetch-adapter';

axios.defaults.adapter = fetchAdapter;

/*::
declare var chrome;
*/

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
    console.debug(`get message ${JSON.stringify(message)} from ${sender.tab.id}`);
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
