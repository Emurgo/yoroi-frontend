
chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.sendMessage(extensionId, { type: "open_browseraction_menu" });
});