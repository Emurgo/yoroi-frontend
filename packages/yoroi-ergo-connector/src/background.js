import debounce from 'lodash/debounce';

const onConnectorIconClicked = () => {
  // note: we send a message instead of a browser action because the UI is managed by the Yoroi extension -- not be the connector
  chrome.runtime.sendMessage(extensionId, { type: "open_browseraction_menu" });
};

chrome.browserAction.onClicked.addListener(debounce(onConnectorIconClicked, 500, { leading: true }));
