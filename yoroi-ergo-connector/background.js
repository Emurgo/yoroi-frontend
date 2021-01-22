

chrome.browserAction.onClicked.addListener(function() {
    const yoroiExtensionId = "bgihpbbhciffmelcfbccneidnnmkcdhl";
    chrome.runtime.sendMessage(yoroiExtensionId, { type: "open_browseraction_menu" });
});