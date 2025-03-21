// @flow
declare var chrome;

// We pass the RPC call inject.js and have it relay the request and reponse messages to the background,
// instead of directly calling the background with chrome.runtime.sendMessage, so that this lib can also
// be used in the web page process.
const callbacks: Map<number, (Object) => void> = new Map();
let uid_counter = 0;

window.addEventListener('message', (event) => {
  if (event.data.type === 'bring_rpc_response') {
    const callback = callbacks.get(event.data.uid);
    if (callback) {
      callbacks.delete(event.data.uid);
      callback(event.data);
    }
  }
});

function callBackground(functionName: string, params: any): Promise<any> {
  const uid = uid_counter++;
  return new Promise((resolve, reject) => {
    callbacks.set(uid, (msg) => {
      if (msg.return.err) {
        reject(new Error(msg.return.err));
      } else {
        resolve(msg.return.ok);
      }
    });

    window.postMessage({
      type: 'bring_rpc_request',
      url: location.hostname,
      uid,
      function: functionName,
      params,
    });
  });
}

export async function getFirstAddress(): Promise<string | typeof undefined> {
  return await callBackground('get-address');
}

export function getTheme(): Promise<'light' | 'dark'> {
  return callBackground('get-theme-mode');
}

export function popUpWalletCreation(): void {
  callBackground('pop-up-wallet-creation');
}

export function popUpCashbackWalletSelection(): void {
  callBackground('pop-up-cashback-wallet-selection');
}

export async function promptCreationOrSelection(): Promise<void> {
  const address = await getFirstAddress();
  if (address === null) {
    return await popUpWalletCreation();
  } else {
    return await popUpCashbackWalletSelection();
  }
}

export function listenForCashbackWalletChange(callback: () => void): void {
  // todo: verify sender extension id
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === 'cashback-wallet-change') {
      callback();
    }
  });
}

export async function getWallets(): Promise<Array<{| id: number, name: string, address: string, |}>> {
  return callBackground('get-wallets');
}

export async function setCashbackWallet(id: number): Promise<void> {
  return callBackground('set-cashback-wallet', id);
}
