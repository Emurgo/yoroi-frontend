// sets up RPC communication with the connector + access check/request functions
const initialInject = `

var rpcUid = 0;
var rpcResolver = new Map();
var timeout = 0;

function _ergo_rpc_call(func, params) {
    return new Promise(function(resolve, reject) {
        window.postMessage({
            type: "connector_rpc_request",
            uid: rpcUid,
            function: func,
            params: params
        }, location.origin);
        rpcResolver.set(rpcUid, { resolve: resolve, reject: reject });
        rpcUid += 1;
    });
}

function ergo_request_read_access() {
    return _ergo_rpc_call("ergo_request_read_access", []);
}

// RPC set-up
window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response") {
        console.log("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        const rpcPromise = rpcResolver.get(event.data.uid);
        if (rpcPromise !== undefined) {
            const ret = event.data.return;
            if (ret.err !== undefined) {
                rpcPromise.reject(ret.err);
            } else {
                rpcPromise.resolve(ret.ok);
            }
        }
    }
});

// disconnect detector
setInterval(function() {
    if (timeout == 20) {
        window.dispatchEvent(new Event("ergo_wallet_disconnected"));
    }
    if (timeout == 25) {
        rpcResolver.forEach(function(rpc) {
            rpc.reject("timed out");
        });
    }
    timeout += 1;
}, 1000);

// ping sender
setInterval(function() {
    _ergo_rpc_call("ping", []).then(function() {
        timeout = 0;
    });
}, 10000);
`

// client-facing ergo object API
const apiInject = `
class ErgoAPI {
    get_balance(token_id = 'ERG') {
        return _ergo_rpc_call("get_balance", [token_id]);
    }

    sign_tx(tx) {
        return _ergo_rpc_call("sign_tx", [tx]);
    }
}

const ergo = Object.freeze(new ErgoAPI());
`

function injectIntoPage(code) {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute("async", "false");
        scriptTag.textContent = code;
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);
        console.log("injection succeeded");
        return true;
    } catch (e) {
        console.log("injection failed: " + e);
        return false;
    }
}

injectIntoPage(initialInject);

window.addEventListener("message", function(event) {
    function sendRpcToYoroi(injectApiOnSuccess) {
        chrome.runtime.sendMessage(
            "eegbdfmlofnpgiiilnlboaamccblbobe",
            event.data,
            {},
            function(response) {
                if (injectApiOnSuccess) {
                    // inject full API here
                    if (response.ok === true) {
                        if (injectIntoPage(apiInject)) {
                            chrome.runtime.sendMessage(
                                {type:"init_page_action"});
                        } else {
                            alert("failed to inject Ergo API");
                            // TODO: return an error instead here if injection fails?
                        }
                    } else {
                        // ???
                    }
                }
                window.postMessage({
                    type: "connector_rpc_response",
                    uid: event.data.uid,
                    return: response
                }, location.origin);
            });
    }
    
    if (event.data.type == "connector_rpc_request") {
        console.log("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        if (event.data.function == "ergo_request_read_access") {
            chrome.storage.local.get("whitelist", function(result) {
                alert(JSON.stringify(result));
                let whitelist = Object.keys(result).length === 0 ? [] : result.whitelist;
                if (!whitelist.includes(location.hostname)) {
                    if (confirm(`Allow access of ${location.hostname} to Ergo-Yoroi connector?`)) {
                        if (confirm(`Save ${location.hostname} to whitelist?`)) {
                            whitelist.push(location.hostname);
                            chrome.storage.local.set({whitelist:whitelist});
                        }
                        sendRpcToYoroi(true);
                    } else {
                        // user refused - skip communication with Yoroi
                        window.postMessage({
                            type: "connector_rpc_response",
                            uid: event.data.uid,
                            return: {ok: false}
                        }, location.origin);
                    }
                } else {
                    // already in whitelist
                    sendRpcToYoroi(true);
                }
            });
        } else {
            sendRpcToYoroi(false);
        }
    }
});