// sets up RPC communication with the connector + access check/request functions
const initialInject = `
var timeout = 0;

var connectRequests = [];

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_connected") {
        if (event.data.err !== undefined) {
            connectRequests.forEach(promise => promise.reject(event.data.err));
        } else {
            connectRequests.forEach(promise => promise.resolve(event.data.success));
        }
    }
});

function ergo_request_read_access() {
    return new Promise(function(resolve, reject) {
        window.postMessage({
            type: "connector_connect_request",
        }, location.origin);
        connectRequests.push({ resolve: resolve, reject: reject });
    });
}

function ergo_check_read_access() {
    if (typeof ergo !== "undefined") {
        return ergo._ergo_rpc_call("ping", []);
    } else {
        return Promise.resolve(false);
    }
}
`

// client-facing ergo object API
const apiInject = `
// RPC set-up
var rpcUid = 0;
var rpcResolver = new Map();

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

class ErgoAPI {
    get_balance(token_id = 'ERG') {
        return this._ergo_rpc_call("get_balance", [token_id]);
    }

    get_utxos(amount = undefined, token_id = 'ERG', paginate = undefined) {
        return this._ergo_rpc_call("get_utxos", [amount, token_id, paginate]);
    }

    sign_tx(tx) {
        return this._ergo_rpc_call("sign_tx", [tx]);
    }

    get_used_addresses(paginate = undefined) {
        return this._ergo_rpc_call("get_used_addresses", [paginate]);
    }

    get_unused_addresses() {
        return this._ergo_rpc_call("get_unused_addresses", []);
    }

    get_change_address() {
        return this._ergo_rpc_call("get_change_address", []);
    }

    sign_tx(tx) {
        return this._ergo_rpc_call("sign_tx", [tx]);
    }

    sign_tx_input(tx, index) {
        return this._ergo_rpc_call("sign_tx_input", [tx, index]);
    }

    // This is unsupported by current version of Yoroi
    // and the details of it are not finalized yet in the EIP-012
    // dApp bridge spec.
    // sign_data(addr, message) {
    //     return this._ergo_rpc_call("sign_data", [addr, message]);
    // }

    submit_tx(tx) {
        return this._ergo_rpc_call("submit_tx", [tx]);
    }

    _ergo_rpc_call(func, params) {
        return new Promise(function(resolve, reject) {
            window.postMessage({
                type: "connector_rpc_request",
                uid: rpcUid,
                function: func,
                params: params
            }, location.origin);
            console.log("rpcUid = " + rpcUid);
            rpcResolver.set(rpcUid, { resolve: resolve, reject: reject });
            rpcUid += 1;
        });
    }
}

const ergo = Object.freeze(new ErgoAPI());
`
const API_INTERNAL_ERROR = -2;
const API_REFUSED = -3;

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

function shouldInject() {
    const documentElement = document.documentElement.nodeName
    const docElemCheck = documentElement ? documentElement.toLowerCase() === 'html' : true;
    const { docType } = window.document;
    const docTypeCheck = docType ? docType.name === 'html' : true;
    return docElemCheck && docTypeCheck;
}

let yoroiPort = null;
let fullApiInjected = false;

function disconnectWallet() {
    yoroiPort = null;
    window.dispatchEvent(new Event("ergo_wallet_disconnected"));
}

function createYoroiPort() {
    // events from Yoroi
    yoroiPort = chrome.runtime.connect(extensionId);
    yoroiPort.onMessage.addListener(message => {
        //alert("content script message: " + JSON.stringify(message));
        if (message.type == "connector_rpc_response") {
            window.postMessage(message, location.origin);
        } else if (message.type == "yoroi_connect_response") {
            if (message.success) {
                if (!fullApiInjected) {
                    // inject full API here
                    if (injectIntoPage(apiInject)) {
                        fullApiInjected = true;
                    } else {
                        console.error()
                        window.postMessage({
                            type: "connector_connected",
                            err: {
                                code: API_INTERNAL_ERROR,
                                info: "failed to inject Ergo API"
                            }
                        }, location.origin);
                    }
                }
            }
            window.postMessage({
                type: "connector_connected",
                success: message.success
            }, location.origin);
        }
    });

    yoroiPort.onDisconnect.addListener(event => {
        disconnectWallet();
    });
}

if (shouldInject()) {
    console.log(`content script injected into ${location.hostname}`);
    injectIntoPage(initialInject);

    // events from page (injected code)
    window.addEventListener("message", function(event) {
        if (event.data.type === "connector_rpc_request") {
            console.log("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
            if (yoroiPort) {
                try {
                    yoroiPort.postMessage(event.data);
                    return;
                } catch (e) {
                    console.error(`Could not send RPC to Yoroi: ${e}`);
                    window.postMessage({
                        type: "connector_rpc_response",
                        uid: event.data.uid,
                        return: {
                            err: {
                                code: API_INTERNAL_ERROR,
                                info: `Could not send RPC to Yoroi: ${e}`
                            }
                        }
                    }, location.origin);
                }
            } else {
                window.postMessage({
                    type: "connector_rpc_response",
                    uid: event.data.uid,
                    return: {
                        err: {
                            code: API_REFUSED,
                            info: 'Wallet disconnected'
                        }
                    }
                }, location.origin);
            }
        } else if (event.data.type == "connector_connect_request") {
            if (fullApiInjected) {
                if (yoroiPort) {
                    // we can skip communication - API injected + hasn't been disconnected
                    window.postMessage({
                        type: "connector_connected",
                        success: true
                    }, location.origin);
                    return;
                }
            }
            if (yoroiPort) {
                createYoroiPort();
            }
            // URL must be provided here as the url field of Tab is only available
            // with the "tabs" permission which Yoroi doesn't have
            yoroiPort.postMessage({
                type: "yoroi_connect_request",
                url: location.hostname,
            });
        }
    });
}
