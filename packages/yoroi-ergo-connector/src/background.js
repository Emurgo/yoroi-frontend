
// note: we send a message instead of a browser action because the UI is managed by the Yoroi extension -- not be the connector
chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.sendMessage(extensionId, { type: "open_browseraction_menu" });
});