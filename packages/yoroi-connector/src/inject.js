// sets up RPC communication with the connector + access check/request functions
const WALLET_NAME = 'yoroi';
const API_VERSION = '0.3.0';
const YOROI_TYPE = '$YOROI_BUILD_TYPE_ENV$';
const INJECTED_TYPE_TAG_ID = '__yoroi_connector_api_injected_type'
const ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNjMiIHZpZXdCb3g9IjAgMCA3MiA2MyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExODRfODQyNDApIj4KPHBhdGggZD0iTTU1LjYyNzEgNDguOTEzNkw0OS45MjEgNTIuODcxMkw3LjkwMjMyIDIzLjg2MjNDNy45MDIzMiAyMy44MDU2IDcuOTAyMzIgMjMuNzQ4OCA3Ljg4NTYgMjMuNjkyVjIxLjEwMzdDNy44ODU2IDIwLjI2NDMgNy44ODU2IDE5LjQyNjEgNy44ODU2IDE4LjU4ODlWMTUuOTUzOUw1NS42MjcxIDQ4LjkxMzZaTTQzLjkwMDYgMTEuNDc1M0M0MS4zNjM1IDEzLjIxMTkgMzguODAyOSAxNC45MTUyIDM2LjI2NTggMTYuNjUxOUMzNi4xMzk2IDE2Ljc2NjYgMzUuOTc1MSAxNi44MzAyIDM1LjgwNDQgMTYuODMwMkMzNS42MzM4IDE2LjgzMDIgMzUuNDY5MyAxNi43NjY2IDM1LjM0MzEgMTYuNjUxOUMzMi4yMDc2IDE0LjQ3MSAyOS4wNTU0IDEyLjMxMDIgMjUuOTE2NSAxMC4xNDYxQzIyLjYxMzkgNy44NTUwMyAxOS4zMTM0IDUuNTU3MyAxNi4wMTUyIDMuMjUyODlMMTEuMzMyIDBIMEMwLjYwMTY5OSAwLjQyMDgwNSAxLjA5NjQzIDAuNzc0ODE2IDEuNTk0NSAxLjExODgxTDEwLjQ3NjMgNy4yNzA1OEMxMy40MDQ1IDkuMzA1NTkgMTYuMzMxNyAxMS4zNDA2IDE5LjI1NzcgMTMuMzc1NkMyMi4wMTIyIDE1LjI4OTMgMjQuNzU5OSAxNy4yMTI5IDI3LjUxNzcgMTkuMTIzM0MzMC4xMzUxIDIwLjkzNjcgMzIuNzU5MiAyMi43MzAyIDM1LjM3NjYgMjQuNTQ3QzM1LjQ4MjMgMjQuNjQyNyAzNS42MTk5IDI0LjY5NTggMzUuNzYyNyAyNC42OTU4QzM1LjkwNTQgMjQuNjk1OCAzNi4wNDMgMjQuNjQyNyAzNi4xNDg4IDI0LjU0N0MzOC4yNjE0IDIzLjEwMDkgNDAuMzk3NCAyMS42NzgyIDQyLjUgMjAuMjMyMUM0Ny43MzI2IDE2LjY0OTYgNTIuOTYwNyAxMy4wNjE3IDU4LjE4NDMgOS40NjgxMkw2OS42MDMyIDEuNjY5ODZDNzAuMzkyMSAxLjEzMjE3IDcxLjE3NzcgMC41ODQ0NTIgNzIgMEg2MC42MzQ2QzU1LjA1NDQgMy44MjI4NyA0OS40NzY0IDcuNjQ3OTcgNDMuOTAwNiAxMS40NzUzWk03Ljk0NTc3IDM1LjI0NzRDNy45MjA5NyAzNS4yOTU1IDcuOTAwODIgMzUuMzQ1OCA3Ljg4NTYgMzUuMzk3N1Y0MC4xNTM1QzcuODg1NiA0MS4xMDIgNy44ODU2IDQyLjA1MDUgNy44ODU2IDQyLjk5NTZDNy44ODgxNCA0My4wNTMzIDcuOTAxNzYgNDMuMTEgNy45MjU3MiA0My4xNjI2TDM1Ljk3MTYgNjIuNTMzSDM1Ljk5ODNMNDEuNzA0NCA1OC41Nzg4TDcuOTQ1NzcgMzUuMjQ3NFpNNjMuOTc0IDE1Ljk3MDZMNDMuMTAxNyAzMC4zOTE1QzQzLjE2NzYgMzAuNDgwNCA0My4yNDE1IDMwLjU2MzEgNDMuMzIyMyAzMC42Mzg2QzQ1LjA4NzMgMzEuODg3NyA0Ni44NTM0IDMzLjEzMTIgNDguNjIwNiAzNC4zNjkxQzQ4LjY3ODkgMzQuNDAwNCA0OC43NDU3IDM0LjQxMjEgNDguODExMiAzNC40MDI1TDYzLjkyMzkgMjMuOTQ5MkM2My45NDY2IDIzLjkwNDggNjMuOTYzNCAyMy44NTc2IDYzLjk3NCAyMy44MDg5VjE1Ljk3MDZaTTYzLjk5MDcgMzUuNTUxNEM2MS42MjA3IDM3LjE4NDUgNTkuMzM0MiAzOC43NjQyIDU3LjAyMSA0MC4zNjM5TDYyLjQ0MyA0NC4yMDQ2TDYzLjk5MDcgNDMuMTMyNVYzNS41NTE0WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzExODRfODQyNDApIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMTg0Xzg0MjQwIiB4MT0iOS4xNTU4NiIgeTE9IjQ0LjM4NDkiIHgyPSI2Mi43NDE3IiB5Mj0iLTkuMjQ5ODQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzFBNDRCNyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0NzYwRkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMTg0Xzg0MjQwIj4KPHJlY3Qgd2lkdGg9IjcyIiBoZWlnaHQ9IjYyLjUyNjMiIGZpbGw9IndoaXRlIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';

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
                    promise.reject({ code: -3, info: 'User Rejected' });
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
  
  function cardano_rpc_call(func, params, returnType) {
    return new Promise(function(resolve, reject) {
      window.postMessage({
        type: "connector_rpc_request",
        protocol: "cardano",
        url: location.hostname,
        uid: cardanoRpcUid,
        function: func,
        params,
        returnType: returnType || "cbor",
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
            const authWrapper = auth == null ? null : Object.freeze({
              walletId: auth.walletId,
              pubkey: auth.pubkey,
            });
            resolve(Object.freeze(new CardanoAPI(authWrapper, cardano_rpc_call)));
        },
        reject: reject
      });
    });
  }

  function cardano_check_read_access() {
    return cardano_rpc_call("is_enabled/cardano", []);
  }
  
  function exec_hello() {
    return cardano_rpc_call("hello", []);
  }

  window.cardano = {
    ...(window.cardano||{}),
    '${WALLET_NAME}': {
      hello: exec_hello,
      icon: '${ICON_URL}',
      enable: cardano_request_read_access,
      isEnabled: cardano_check_read_access,
      apiVersion: '${API_VERSION}',
      name: '${WALLET_NAME}',
    }
  };
})();
`;

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
      const self = this;
      function rpcWrapper(func, params) {
        return rpc(func, params, self._returnType[0]);
      }
      this._auth = new CardanoAuth(auth, rpcWrapper);
      this._cardano_rpc_call = rpcWrapper;
      this._disconnection = [false];
      this._returnType = ["cbor"];
      window.addEventListener('yoroi_wallet_disconnected', function() {
          if (!self._disconnection[0]) {
              self._disconnection[0] = true;
              self._disconnection.slice(1).forEach(f => f());
          }
      });
    }
    
    getPubDRepKey = () => {
        return 'hello world';
    }
    
    experimental = Object.freeze({
    
      setReturnType: (returnType) => {
        if (returnType !== 'cbor' && returnType !== 'json') {
          throw new Error('Possible return type values are: "cbor" or "json"');
        }
        this._returnType[0] = returnType;
      },
      
      auth: () => {
        return this._auth;
      },
      
      createTx: (req) => {
        return this._cardano_rpc_call("create_tx/cardano", [req]);
      },

      listNFTs: () => {
        return this._cardano_rpc_call("list_nfts/cardano", []);
      },
      
      onDisconnect: (callback) => {
        if (this._disconnection[0]) {
          throw new Error('Cardano API instance is already disconnected!');
        }
        this._disconnection.push(callback);
      },
      
    }) 
    
    getNetworkId() {
      return this._cardano_rpc_call("get_network_id", []);
    }
    
    getBalance(token_id = '*') {
      return this._cardano_rpc_call("get_balance", [token_id]);
    }
    
    getUsedAddresses(paginate = undefined) {
      return this._cardano_rpc_call("get_used_addresses", [paginate]);
    }
    
    getUnusedAddresses() {
      return this._cardano_rpc_call("get_unused_addresses", []);
    }
    
    getRewardAddresses() {
      return this._cardano_rpc_call("get_reward_addresses/cardano", []);
    }
    
    getChangeAddress() {
      return this._cardano_rpc_call("get_change_address", []);
    }
    
    getUtxos(amount = undefined, paginate = undefined) {
      return this._cardano_rpc_call("get_utxos/cardano", [amount, paginate]);
    }
    
    submitTx(tx) {
      return this._cardano_rpc_call('submit_tx', [tx]);
    }
    
    signTx(param, _partialSign = false) {
      if (param == null) {
        throw new Error('.signTx argument cannot be null!');
      }
      let tx = param;
      let partialSign = _partialSign;
      let returnTx = false;
      if (typeof param === 'object') {
        tx = param.tx;
        partialSign = param.partialSign;
        returnTx = param.returnTx;
      } else if (typeof param !== 'string') {
        throw new Error('.signTx argument is expected to be an object or a string!')
      }
      return this._cardano_rpc_call('sign_tx/cardano', [{ tx, partialSign, returnTx }]);
    }
    
    signData(address, payload) {
      return this._cardano_rpc_call("sign_data", [address, payload]);
    }

    // DEPRECATED
    getCollateralUtxos(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
    }

    getCollateral(requiredAmount) {
      return this._cardano_rpc_call("get_collateral_utxos", [requiredAmount]);
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

function checkInjectionInDocument() {
    const el = document.getElementById(INJECTED_TYPE_TAG_ID);
    return el ? el.value : 'nothing';
}

function markInjectionInDocument(container) {
    const inp = document.createElement('input');
    inp.setAttribute('type', 'hidden');
    inp.setAttribute('id', INJECTED_TYPE_TAG_ID);
    inp.setAttribute('value', YOROI_TYPE);
    container.appendChild(inp);
}

function injectIntoPage(code) {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute("async", "false");
        scriptTag.textContent = code;
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);
        console.log(`[yoroi/${YOROI_TYPE}] dapp-connector is successfully injected into ${location.hostname}`);
        markInjectionInDocument(container);
        return true;
    } catch (e) {
        console.error(`[yoroi/${YOROI_TYPE}] injection failed!`, e);
        return false;
    }
}

function buildTypePrecedence(buildType) {
    switch (buildType) {
        case 'dev': return 2;
        case 'nightly': return 1;
        case 'prod': return 0;
        default: return -1;
    }
}

function shouldInject() {
    const documentElement = document.documentElement.nodeName
    const docElemCheck = documentElement ? documentElement.toLowerCase() === 'html' : true;
    const { docType } = window.document;
    const docTypeCheck = docType ? docType.name === 'html' : true;
    if (docElemCheck && docTypeCheck) {
        console.debug(`[yoroi/${YOROI_TYPE}] checking if should inject dapp-connector api`);
        const existingBuildType = checkInjectionInDocument();
        if (buildTypePrecedence(YOROI_TYPE) >= buildTypePrecedence(existingBuildType)) {
            console.debug(`[yoroi/${YOROI_TYPE}] injecting over '${existingBuildType}'`);
            return true
        }
    }
    return false;
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

function handleConnectorConnectRequest(event, protocol) {
    const requestIdentification = event.data.requestIdentification;
    if ((ergoApiInjected || (cardanoApiInjected && !requestIdentification)) && yoroiPort) {
        // we can skip communication - API injected + hasn't been disconnected
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

function handleConnectorRpcRequest(event) {
    console.debug("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
    if (event.data.function === 'is_enabled/cardano' && yoroiPort == null) {
      createYoroiPort();
    }
    if (!yoroiPort) {
        // No active wallet connection
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
        return;
    }
    try {
        yoroiPort.postMessage(event.data);
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
}

function connectorEventListener(event) {
    const dataType = event.data.type;
    if (dataType === "connector_rpc_request") {
        handleConnectorRpcRequest(event);
    } else if (dataType === "connector_connect_request/ergo" || dataType === 'connector_connect_request/cardano') {
        const protocol = dataType.split('/')[1];
        handleConnectorConnectRequest(event, protocol);
    }
}

if (shouldInject()) {
    if (injectIntoPage(initialInject)) {
        // events from page (injected code)
        window.addEventListener("message", connectorEventListener);
    }
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
            // throw e;
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

