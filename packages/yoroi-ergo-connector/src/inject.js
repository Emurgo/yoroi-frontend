// sets up RPC communication with the connector + access check/request functions
const initialInject = `
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
            type: "connector_connect_request/ergo",
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

function cardano_request_read_access() {
    return new Promise(function(resolve, reject) {
        window.postMessage({
            type: "connector_connect_request/cardano",
        }, location.origin);
        connectRequests.push({ resolve: resolve, reject: reject });
    });
}

// @todo
function cardano_check_read_access() {
    if (typeof cardano !== "undefined") {
        return cardano._cardano_rpc_call("ping", []);
    } else {
        return Promise.resolve(false);
    }
}
`

// client-facing ergo object API
const ergoApiInject = `
// RPC set-up
var ergoRpcUid = 0;
var ergoRpcResolver = new Map();

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "ergo") {
        console.log("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        const rpcPromise = ergoRpcResolver.get(event.data.uid);
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
                protocol: "ergo",
                uid: ergoRpcUid,
                function: func,
                params: params
            }, location.origin);
            console.log("ergoRpcUid = " + ergoRpcUid);
            ergoRpcResolver.set(ergoRpcUid, { resolve: resolve, reject: reject });
            ergoRpcUid += 1;
        });
    }
}

const ergo = Object.freeze(new ErgoAPI());
`

const cardanoApiInject = `

// RPC setup
var cardanoRpcUid = 0;
var cardanoRpcResolver = new Map();

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "cardano") {
        console.log("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
        const rpcPromise = cardanoRpcResolver.get(event.data.uid);
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

class CardanoAPI {
    constructor(){
        this.initTimestamp = Date.now()
    }

    getInitTimestamp(){
        return this.initTimestamp
    }

    get_balance(token_id = 'ADA') {
        return this._cardano_rpc_call("get_balance", [token_id]);
    }

    get_used_addresses(paginate = undefined) {
        return this._cardano_rpc_call("get_used_addresses", [paginate]);
    }

    get_unused_addresses() {
        return this._cardano_rpc_call("get_unused_addresses", []);
    }

    get_change_address() {
        return this._cardano_rpc_call("get_change_address", []);
    }

    get_utxos(amount = undefined, token_id = 'ADA', paginate = undefined) {
        return this._cardano_rpc_call("get_utxos", [amount, token_id, paginate]);
    }

    submit_tx(tx) {
        return this._cardano_rpc_call('submit_tx', [tx]);
    }

    sign_tx(tx) {
        return this._cardano_rpc_call('sign_tx', [tx]);
    }

    _cardano_rpc_call(func, params) {
        return new Promise(function(resolve, reject) {
            window.postMessage({
                type: "connector_rpc_request",
                protocol: "cardano",
                uid: cardanoRpcUid,
                function: func,
                params: params
            }, location.origin);
            console.log("cardanoRpcUid = " + cardanoRpcUid);
            cardanoRpcResolver.set(cardanoRpcUid, { resolve: resolve, reject: reject });
            cardanoRpcUid += 1;
        });
    }
}

const cardano = Object.freeze(new CardanoAPI())
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

/**
 * We can't get the favicon using the Chrome extension API
 * because getting the favicon for the current tab requires the "tabs" permission
 * which we don't use in the connector
 * So instead, we use this heuristic
 */
function getFavicon(url) {
    let faviconURL = '';
    // sometimes the favicon is specified at the top of the HTML
    const favicon = document.querySelector("link[rel~='icon']");
    if(favicon) {
        faviconURL = favicon.href;
    } else {
        // if not in the HTML, check the domain root
        faviconURL = `${url}/favicon.ico`;
    }
    return faviconURL;
}
let yoroiPort = null;
let ergoApiInjected = false;
let cardanoApiInjected = false;

function disconnectWallet() {
    yoroiPort = null;
    window.dispatchEvent(new Event("ergo_wallet_disconnected"));
}

function createYoroiPort() {
    // events from Yoroi
    yoroiPort = chrome.runtime.connect(extensionId);
    yoroiPort.onMessage.addListener(message => {
        // alert("content script message: " + JSON.stringify(message));
        if (message.type === "connector_rpc_response") {
            window.postMessage(message, location.origin);
        } else if (message.type === "yoroi_connect_response/ergo") {
            if (message.success) {
                if (!ergoApiInjected) {
                    // inject full API here
                    if (injectIntoPage(ergoApiInject)) {
                        ergoApiInjected = true;
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
        } else if (message.type === "yoroi_connect_response/cardano") {
            if (message.success) {
                if (!cardanoApiInjected) {
                    // inject full API here
                    if (injectIntoPage(cardanoApiInject)) {
                        cardanoApiInjected = true;
                    } else {
                        console.error()
                        window.postMessage({
                            type: "connector_connected",
                            err: {
                                code: API_INTERNAL_ERROR,
                                info: "failed to inject Cardano API"
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
        const dataType = event.data.type;
        if (dataType === "connector_rpc_request") {
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
        } else if (dataType === "connector_connect_request/ergo" || dataType === 'connector_connect_request/cardano') {
            if ((ergoApiInjected || cardanoApiInjected) && yoroiPort) {
                // we can skip communication - API injected + hasn't been disconnected
                console.log('you are already connected')
                window.postMessage({
                    type: "connector_connected",
                    success: true
                }, location.origin);
            } else {
                if (yoroiPort == null) {
                    createYoroiPort();
                }
                // note: content scripts are subject to the same CORS policy as the website they are embedded in
                // but since we are querying the website this script is injected into, it should be fine
                convertImgToBase64(getFavicon(location.origin))
                    .then(imgBase64Url => {
                        yoroiPort.postMessage({
                            imgBase64Url,
                            type: `yoroi_connect_request/${dataType.split('/')[1]}`,
                            url: location.hostname
                        });
                    });
            }
        }
    });
}

/**
 * Returns a PNG base64 encoding of the favicon
 * but returns empty string if no favicon is set for the page
 */
async function convertImgToBase64(url, outputFormat) {
    // as a safety precaution, we only load the favicon if it's the same origin as the website
    // if we don't do this, we might get a CORS error anyway
    // I don't know if any websites set their favicon to external websites, so it should not be a problem
    const response = await fetch(url, {mode: 'same-origin'});
    const blob = await response.blob();

    const reader = new FileReader();
    await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
    });
    return reader.result;
}
