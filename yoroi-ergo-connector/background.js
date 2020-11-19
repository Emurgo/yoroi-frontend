// TODO: put this somewhere common?
const yoroiExtensionId = "bgihpbbhciffmelcfbccneidnnmkcdhl";

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //alert("background message: " + JSON.stringify(sender));
    if (request.type == "init_page_action") {
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "main.html"
        });
        chrome.pageAction.show(sender.tab.id);
    }
});

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    //alert("background external message: " + JSON.stringify(message));
    if (sender.id == yoroiExtensionId) {
        if (message.type == "yoroi_connected") {
            chrome.tabs.query({active: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {type: "yoroi_connected"});
            });
        }
    }
});