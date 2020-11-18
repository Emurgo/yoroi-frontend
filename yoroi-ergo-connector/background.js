chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //alert("received from page: " + JSON.stringify(sender));
    if (request.type == "init_page_action") {
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "main.html"
        });
        chrome.pageAction.show(sender.tab.id);
    }
});