// @flow
declare var chrome;

// We pass the RPC call inject.js and have it relay the request and reponse messages to the background,
// instead of directly calling the background with chrome.runtime.sendMessage, so that this lib can also
// be used in the web page process.
const callbacks = [];

window.addEventListener('message', (event) => {
  if (event.data.type === 'bring_rpc_response') {
    const callback = callbacks.splice(event.data.uid, 1)[0];
    if (callback) {
      callback(event.data);
    }
  }
});

function callBackground(functionName: string, params: any): Promise<any> {
  console.log('>>>bring call', functionName, params);
  return new Promise((resolve, reject) => {
    callbacks.push((msg) => {
      console.log('>>>bring return', msg.return);
      if (msg.return.ok) {
        resolve(msg.return.ok);
      } else {
        reject(new Error(msg.return.err));
      }
    });
  
    window.postMessage({
      type: 'bring_rpc_request',
      url: location.hostname,
      uid: callbacks.length - 1,
      function: functionName,
      params,
    });
  });
}

export async function getFirstAddress(): Promise<string | typeof undefined> {
  return await callBackground('get_addresses', [undefined]);
}

export function getTheme(): Promise<'light' | 'dark'> {
  return callBackground('get-theme-mode', [undefined]);
}

export function popUpWalletCreation(): void {
  callBackground('pop-up-wallet-creation');
}

export function listenForActiveWalletOpen(callback: () => void): void {
  // todo: verify sender extension id
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'active-wallet-open') {
      callback();
    }
  });
}
