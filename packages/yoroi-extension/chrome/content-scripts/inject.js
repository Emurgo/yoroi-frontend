// sets up RPC communication with the connector + access check/request functions

const INJECTED_TYPE_TAG_ID = '__yoroi_connector_api_injected_type'
const YOROI_TYPE = '$YOROI_BUILD_TYPE_ENV$';

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

let resolveScriptedInject;

// <TODO:IMPROVEMENT>
// The function been changed to async, but it's still used to return a boolean flag
// Ideally it needs to be updated to use proper reject
// But all callers then need to update to use proper `then`, or `onSuccess` and `onFailure`
async function injectIntoPage(code) {
  return new Promise((resolve, reject) => {
    try {
        const container = document.head || document.documentElement;
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute("async", "false");
        scriptTag.src = chrome.runtime.getURL(`js/${code}.js`);
        resolveScriptedInject = () => resolve(true);
        container.insertBefore(scriptTag, container.children[0]);
        container.removeChild(scriptTag);
        console.log(`[yoroi/${YOROI_TYPE}] dapp-connector is successfully injected into ${location.hostname}`);
        markInjectionInDocument(container);
    } catch (e) {
        console.error(`[yoroi/${YOROI_TYPE}] injection failed!`, e);
        resolve(false);
    }
  });
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

let connected = false;
let cardanoApiInjected = false;

function disconnectWallet(protocol) {
    connected = false;
    window.dispatchEvent(new Event("yoroi_wallet_disconnected"));
}

function listenToBackgroundServiceWorker() {
    const connectedProtocolHolder = [];
    chrome.runtime.onMessage.addListener(async (message) => {
        // alert("content script message: " + JSON.stringify(message));
        if (message.type === "connector_rpc_response") {
            window.postMessage(message, location.origin);
        } else if (message.type === "yoroi_connect_response/cardano") {
            if (message.success) {
                connectedProtocolHolder[0] = 'cardano';
                if (!cardanoApiInjected) {
                    // inject full API here
                    if (await injectIntoPage('cardanoApiInject')) {
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
        } else if (message.type === 'disconnect') {
            disconnectWallet(connectedProtocolHolder[0]);
        }
    });
    connected = true;
}

async function handleConnectorConnectRequest(event, protocol) {
    const requestIdentification = event.data.requestIdentification;
    if ((cardanoApiInjected && !requestIdentification) && connected) {
        // we can skip communication - API injected + hasn't been disconnected
        window.postMessage({
            type: "connector_connected",
            success: true
        }, location.origin);
    } else {
        if (!connected) {
            listenToBackgroundServiceWorker();
        }
        // note: content scripts are subject to the same CORS policy as the website they are embedded in
        // but since we are querying the website this script is injected into, it should be fine
        convertImgToBase64(location.origin, getFavicons(location.origin))
          .then(imgBase64Url => {
              const message = {
                  imgBase64Url,
                  // <TODO:PENDING_REMOVAL> Protocol
                  type: `yoroi_connect_request/${protocol}`,
                  connectParameters: {
                      url: location.hostname,
                      requestIdentification,
                      onlySilent: event.data.onlySilent,
                  },
                  protocol,
              };
              chrome.runtime.sendMessage(message);
          });
    }
}

async function handleConnectorRpcRequest(event) {
    console.debug("connector received from page: " + JSON.stringify(event.data) + " with source = " + event.source + " and origin = " + event.origin);
    if (event.data.function === 'is_enabled/cardano' && !connected) {
        listenToBackgroundServiceWorker();
    }
    try {
        await chrome.runtime.sendMessage(event.data);
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

async function connectorEventListener(event) {
    const dataType = event.data.type;
    if (dataType === "connector_rpc_request") {
        await handleConnectorRpcRequest(event);
    } else if (dataType === 'connector_connect_request/cardano') {
        const protocol = dataType.split('/')[1];
        await handleConnectorConnectRequest(event, protocol);
    } else if (dataType === 'scripted_injected') {
        resolveScriptedInject();
    }
}

if (shouldInject()) {
    injectIntoPage('bringInject');
    if (injectIntoPage('initialInject')) {
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

// relay Banxa/Encryptus callback to the extension tab
window.addEventListener('message', function (event) {
  if (
    event.source === window &&
      /https:\/\/([a-z-]+\.)?yoroi-?wallet\.com/.test(event.origin) &&
      event.data?.type === 'exchange callback'
  ) {
    chrome.runtime.sendMessage(event.data);
  }
});
