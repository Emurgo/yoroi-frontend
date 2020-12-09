var signRpcRequest = null;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    //console.log("background.js message: " + JSON.stringify(request));
    if (request.type === "init_page_action") {
        chrome.pageAction.setPopup({
            tabId: sender.tab.id,
            popup: "main.html"
        });
        chrome.pageAction.show(sender.tab.id);
    } else if (request.type === "tx_sign_window_retrieve_data") {
        const ret = signRpcRequest;
        signRpcRequest = null;
        sendResponse(ret);
    } else if (request.type === "sign_tx_notification") {
        chrome.windows.create({
            url: "sign.html",
            width: 240,
            height: 400,
            focused: true,
            type: "popup"
        });
        signRpcRequest = request.rpcRequest;
    }
});
