
chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.sendMessage(yoroiExtensionId, { type: "open_browseraction_menu" });
});