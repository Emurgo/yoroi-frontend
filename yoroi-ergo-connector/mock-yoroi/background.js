function handler(message, sender, sendResponse) {
    if (sender.id == "egflibcdkfhnhdpbdlbgopagfdbkghbo") {
        console.log("mock-yoroi received: " + JSON.stringify(message))
        if (message.type == "connector_rpc_request") {
            switch (message.function) {
                case "ergo_request_read_access":
                    sendResponse({
                        ok: true
                    });
                    break;
                case "get_balance":
                    if (message.params[0] == "ERG") {
                        sendResponse({
                            ok: 100
                        });
                    } else {
                        sendResponse({
                            ok: 5
                        });
                    }
                    break;
                case "sign_tx":
                    sendResponse({
                        err: {
                            code: 2,
                            info: "User rejected",
                        }
                    });
                case "ping":
                    sendResponse({
                        ok: true,
                    });
                default:
                    sendResponse({
                        err: "unknown RPC: " + message.function + "(" + message.params + ")"
                    })
                    break;
            }
        }
    } else {
        alert("received message \"" + message + "\" from other sender: " + sender.id);
    }
}

chrome.runtime.onMessageExternal.addListener(handler);