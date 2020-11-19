// @flow
import debounce from 'lodash/debounce';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

function connectHandler(message, sender, sendResponse) {
  if (sender.id == "egflibcdkfhnhdpbdlbgopagfdbkghbo") {
      console.log("REAL(background.js)-yoroi received: " + JSON.stringify(message))
      if (message.type == "yoroi_connect_request") {
          chrome.tabs.create({ url: 'main_window.html', active: true });
          sendResponse(true);
      }
  } else {
      console.log("received message \"" + message + "\" from other sender: " + sender.id);
  }
}

chrome.runtime.onMessageExternal.addListener(connectHandler);

