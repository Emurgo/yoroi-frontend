// @flow
import debounce from 'lodash/debounce';
import { handleInjectorMessage } from './handlers/content';
import { isYoroiMessage, yoroiMessageHandler } from './handlers/yoroi';

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


chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {
    if (isYoroiMessage(message)) {
      // Returning `true` is required by Firefox, see:
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
      yoroiMessageHandler(message, sender, sendResponse);
      return true;
    }
    return handleInjectorMessage(message, sender);
  }
);
