// sets up RPC communication with the connector + access check/request functions
const WALLET_NAME = 'yoroi';
const API_VERSION = '0.2.0';

const initialInject = `
(() => {
  var connectRequests = [];

  window.addEventListener("message", function(event) {
    if (event.data.type == "connector_connected") {
      if (event.data.err !== undefined) {
        connectRequests.forEach(promise => promise.reject(event.data.err));
      } else {
        const isSuccess = event.data.success;
        connectRequests.forEach(promise => {
            if (promise.protocol === 'cardano') {
                if (isSuccess) {
                    promise.resolve(event.data.auth);
                } else {
                    promise.reject(new Error('user reject'));
                }
            } else {
                promise.resolve(isSuccess);
            }
        });
      }
    }
  });

  window.ergo_request_read_access = function() {
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_connect_request/ergo",
      }, location.origin);
      connectRequests.push({ resolve: resolve, reject: reject });
    });
  };

  window.ergo_check_read_access = function() {
    if (typeof ergo !== "undefined") {
      return ergo._ergo_rpc_call("ping", []);
    } else {
      return Promise.resolve(false);
    }
  };

  // RPC setup
  var cardanoRpcUid = 0;
  var cardanoRpcResolver = new Map();

  window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "cardano") {
      console.debug("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
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
  
  function cardano_rpc_call(func, params) {
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_rpc_request",
        protocol: "cardano",
        uid: cardanoRpcUid,
        function: func,
        params: params
      }, location.origin);
      console.debug("cardanoRpcUid = " + cardanoRpcUid);
      cardanoRpcResolver.set(cardanoRpcUid, { resolve: resolve, reject: reject });
      cardanoRpcUid += 1;
    });
  }

  function cardano_request_read_access(cardanoAccessRequest) {
    const { requestIdentification, onlySilent } = (cardanoAccessRequest || {});
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_connect_request/cardano",
        requestIdentification,
        onlySilent,
      }, location.origin);
      connectRequests.push({
        protocol: 'cardano',
        resolve: (auth) => {
            resolve(Object.freeze(new CardanoAPI(auth, cardano_rpc_call)));
        },
        reject: reject
      });
    });
  }

  function cardano_check_read_access() {
    if (typeof cardano !== "undefined") {
      return cardano._cardano_rpc_call("ping", []);
    } else {
      return Promise.resolve(false);
    }
  }
  
  window.cardano = {
    ...(window.cardano||{}),
    '${WALLET_NAME}': {
      enable: cardano_request_read_access,
      isEnabled: cardano_check_read_access,
      apiVersion: '${API_VERSION}',
      name: '${WALLET_NAME}',
    }
  };
})();
`

const cardanoApiInject = `
class CardanoAuth {
    constructor(auth, rpc) {
      this._auth = auth;
      this._cardano_rpc_call = rpc;
    }
    
    isEnabled() {
      return this._auth != null;
    }
    
    getWalletId() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.walletId;
    }
    
    getWalletPubkey() {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._auth.pubkey;
    }
    
    signHexPayload(payload_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_sign_hex_payload/cardano", [payload_hex_string]);
    }
    
    checkHexPayload(payload_hex_string, signature_hex_string) {
      if (!this._auth) {
        throw new Error('This connection does not have auth enabled!');
      }
      return this._cardano_rpc_call("auth_check_hex_payload/cardano", [payload_hex_string, signature_hex_string]);
    }
}
class CardanoAPI {
  
    constructor(auth, rpc) {
      this._auth = new CardanoAuth(auth, rpc);
      this._cardano_rpc_call = rpc;
      this._disconnection = [false];
      const self = this;
      window.addEventListener('yoroi_wallet_disconnected', function() {
          if (!self._disconnection[0]) {
              self._disconnection[0] = true;
              self._disconnection.slice(1).forEach(f => f());
          }
      });
    }
    
    getNetworkId() {
      // TODO
      throw new Error('Not implemented yet');
    }
    
    auth() {
      return this._auth;
    }
    
    getBalance(token_id = 'ADA') {
      return this._cardano_rpc_call("get_balance", [token_id]);
    }
    
    getUsedAddresses(paginate = undefined) {
      return this._cardano_rpc_call("get_used_addresses", [paginate]);
    }
    
    getUnusedAddresses() {
      return this._cardano_rpc_call("get_unused_addresses", []);
    }
    
    getRewardAddresses() {
      // TODO
      throw new Error('Not implemented yet');
    }
    
    getChangeAddress() {
      return this._cardano_rpc_call("get_change_address", []);
    }
    
    getUtxos(amount = undefined, token_id = 'ADA', paginate = undefined) {
      return this._cardano_rpc_call("get_utxos", [amount, token_id, paginate]);
    }
    
    submitTx(tx) {
      return this._cardano_rpc_call('submit_tx', [tx]);
    }
    
    signTx(tx, partialSign = false) {
      return this._cardano_rpc_call('sign_tx/cardano', [{ tx, partialSign }]);
    }
    
    signData(address, sigStructure) {
      // TODO
      throw new Error('Not implemented yet');
    }
    
    createTx(req) {
      return this._cardano_rpc_call("create_tx/cardano", [req]);
    }
    
    onDisconnect(callback) {
      if (this._disconnection[0]) {
        throw new Error('Cardano API instance is already disconnected!');
      }
      this._disconnection.push(callback);
    }
}
`

const ergoApiInject = `
// RPC set-up
var ergoRpcUid = 0;
var ergoRpcResolver = new Map();

window.addEventListener("message", function(event) {
    if (event.data.type == "connector_rpc_response" && event.data.protocol === "ergo") {
        console.debug("page received from connector: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
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
            console.debug("ergoRpcUid = " + ergoRpcUid);
            ergoRpcResolver.set(ergoRpcUid, { resolve: resolve, reject: reject });
            ergoRpcUid += 1;
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
    if (true) {
        // <TODO:CONNECTOR_202201>
        return false;
    }
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
function getFavicons(url) {
    const defaultFavicon = `${url}/favicon.ico`;
    // sometimes the favicon is specified at the top of the HTML
    const optionalFavicon = document.querySelector("link[rel~='icon']");
    if(optionalFavicon) {
        return [defaultFavicon, optionalFavicon.href]
    }
    return [defaultFavicon];
}
let yoroiPort = null;
let ergoApiInjected = false;
let cardanoApiInjected = false;

function disconnectWallet(protocol) {
    yoroiPort = null;
    if (protocol === 'ergo') {
        window.dispatchEvent(new Event("ergo_wallet_disconnected"));
    } else {
        window.dispatchEvent(new Event("yoroi_wallet_disconnected"));
    }
}

function createYoroiPort() {
    const connectedProtocolHolder = [];
    // events from Yoroi
    if (extensionId === 'self') {
      // this is part of Yoroi extension
      yoroiPort = chrome.runtime.connect();    
    } else {
      // this is the seperate connector extension
      yoroiPort = chrome.runtime.connect(extensionId);
    }
    yoroiPort.onMessage.addListener(message => {
        // alert("content script message: " + JSON.stringify(message));
        if (message.type === "connector_rpc_response") {
            window.postMessage(message, location.origin);
        } else if (message.type === "yoroi_connect_response/ergo") {
            if (message.success) {
                connectedProtocolHolder[0] = 'ergo';
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
                connectedProtocolHolder[0] = 'cardano';
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
                success: message.success,
                auth: message.auth,
                err: message.err,
            }, location.origin);
        }
    });

    yoroiPort.onDisconnect.addListener(event => {
        disconnectWallet(connectedProtocolHolder[0]);
    });
}

if (shouldInject()) {
    console.log(`content script injected into ${location.hostname}`);
    injectIntoPage(initialInject);

    // events from page (injected code)
    window.addEventListener("message", function(event) {
        const dataType = event.data.type;
        if (dataType === "connector_rpc_request") {
            console.debug("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
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
            const requestIdentification = event.data.requestIdentification;
            if ((ergoApiInjected || (cardanoApiInjected && !requestIdentification)) && yoroiPort) {
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
                const protocol = dataType.split('/')[1];
                convertImgToBase64(location.origin, getFavicons(location.origin))
                    .then(imgBase64Url => {
                        const message = {
                            imgBase64Url,
                            type: `yoroi_connect_request/${protocol}`,
                            connectParameters: {
                                url: location.hostname,
                                requestIdentification,
                                onlySilent: event.data.onlySilent,
                            },
                            protocol,
                        };
                        yoroiPort.postMessage(message);
                    });
            }
        }
    });
}

/**
 * Returns a PNG base64 encoding of the favicon
 * but returns empty string if no favicon is set for the page
 */
async function convertImgToBase64(origin, urls) {
    let response;
    for (url of urls) {
        try {
            const mode = url.includes(origin) ? 'same-origin' : 'no-cors';
            response = await fetch(url, { mode });
            break;
        } catch (e) {
            if (String(e).includes('Failed to fetch')) {
                console.warn(`[yoroi-connector] Failed to fetch favicon at '${url}'`);
                continue;
            }
            console.error(`[yoroi-connector] Failed to fetch favicon at '${url}'`, e);
            throw e;
        }
    }
    if (!response) {
        console.warn(`[yoroi-connector] No downloadable favicon found `);
        return '';
    }
    const blob = await response.blob();

    const reader = new FileReader();
    await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = () => resolve('');
        reader.readAsDataURL(blob);
    });
    return reader.result;
}
