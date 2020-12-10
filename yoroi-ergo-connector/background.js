var signRpcRequest = null;

chrome.runtime.onMessage.addListener(function(request, sender) {
    //console.log("background.js message: " + JSON.stringify(request));
    if (request.type === "init_page_action") {
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "main.html"
        });
        chrome.pageAction.show(sender.tab.id);
    }
});
