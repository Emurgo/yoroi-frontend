var signRpcRequest = null;
var contentSignTabId = null;

chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (notifId === "sign-tx") {
        if (btnIdx === 0) {
            chrome.tabs.sendMessage(contentSignTabId, { type: "sign_tx_confirm", rpcRequest: signRpcRequest });
        } else if (btnIdx === 1) {
            // handle error
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
    //alert("background message: " + JSON.stringify(sender));
    if (request.type === "init_page_action") {
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "main.html"
        });
        chrome.pageAction.show(sender.tab.id);
    } else if (request.type === "sign_tx_notification") {
        signRpcRequest = request.rpcRequest;
        contentSignTabId = sender.tab.id;
        chrome.notifications.create(
            "sign-tx",
            {
                type: "basic",
                iconUrl: "yoroi.svg",
                title: "Sign TX Request",
                message: JSON.stringify(request.rpcRequest.params[0]),
                buttons: [
                    { title: "Sign" },
                    { title: "Cancel" }
                ]
                //requireInteraction: true
            });
    }
});
