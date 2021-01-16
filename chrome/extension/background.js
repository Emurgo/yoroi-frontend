// @flow
import debounce from 'lodash/debounce';

import { schema } from 'lovefield';
import type {
  lf$Database,
} from 'lovefield';
import {
  loadLovefieldDB,
} from '../../app/api/ada/lib/storage/database/index';
import {
  getWallets
} from '../../app/api/common/index';
import {
  PublicDeriver,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/index';
import type {
  Address,
  Tx
} from './ergo-connector/types';
import {
  connectorGetBalance,
  connectorGetUtxos,
  connectorSignTx
} from './ergo-connector/api';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

type PendingSign = {|
  // data needed to complete the request
  request: PendingSignData,
  // if an opened window has been created for this request to show the user
  openedWindow: boolean,
  // resolve function from signRequest's Promise
  resolve: any
|}

type RpcUid = number;

type PendingSignData = {|
  type: 'tx',
  uid: RpcUid,
  tx: Tx
|} | {|
  type: 'tx_input',
  uid: RpcUid,
  tx: Tx,
  index: number,
|} | {|
  type: 'data',
  uid: RpcUid,
  address: Address,
  bytes: string
|}

let db: ?lf$Database = null;

const pendingSigns: Map<RpcUid, PendingSign> = new Map();

// for mocking out network delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function firstWallet(): Promise<PublicDeriver<>> {
  if (db != null) {
    const wallets = await getWallets({ db });
    return Promise.resolve(wallets[0]);
  }
  throw Promise.reject(new Error('Database not loaded for connector RPCs'));
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  async function signTxInputs(tx, indices: number[]): Promise<any> {
    const wallet = await firstWallet();
    const canGetAllUtxos = await asGetAllUtxos(wallet);
    if (canGetAllUtxos == null) {
      throw new Error('could not get all utxos');
    }
    let utxos = await canGetAllUtxos.getAllUtxos();
    const password = 'spending pw goes here';
    return connectorSignTx(wallet, password, utxos, tx, indices);
  }
  console.log(JSON.stringify(sender));
  // alert(`received event: ${JSON.stringify(request)}`);
  if (request.type === 'sign_confirmed') {
    const responseData = pendingSigns.get(request.uid);
    if (responseData) {
      switch (responseData.request.type) {
        case 'tx':
          {
            const wallet = await firstWallet();
            const utxos = await connectorGetUtxos(wallet);
            const txToSign = request.tx;
            let allIndices = [];
            for (let i = 0; i < txToSign.inputs.length; i += 1) {
              allIndices.push(i);
            }
            const signedTx = await signTxInputs(txToSign, allIndices);
            responseData.resolve({ ok: signedTx });
          }
          break;
        case 'tx_input':
          {
            const txToSign = request.tx;
            const signedTx = await signTxInputs(txToSign, [request.index]);
            responseData.resolve({ ok: signedTx.inputs[request.index] });
          }
          break;
        case 'data':
          // mocked data sign
          responseData.resolve({ ok: '0x82cd23b432afab24343f' });
          break;
        default:
          // log?
          break;
      }
      pendingSigns.delete(request.uid);
    }
  } else if (request.type === 'sign_rejected') {
    const responseData = pendingSigns.get(request.uid);
    if (responseData) {
      responseData.resolve({
        err: {
          code: 2,
          info: 'User rejected'
        }
      });
      pendingSigns.delete(request.uid);
    }
  } else if (request.type === 'tx_sign_window_retrieve_data') {
    console.log(`retrive data!? ${JSON.stringify(request)}`);
    for (const [/* uid */, responseData] of pendingSigns.entries()) {
      if (!responseData.openedWindow) {
        console.log(`responseData: ${JSON.stringify(responseData)}`);
        responseData.openedWindow = true;
        console.log(JSON.stringify(pendingSigns));
        sendResponse(responseData.request);
        return;
      }
    }
    // not sure if this should happen - close window if we can't find a tx to sign
    sendResponse(null);
  }
});

async function confirmSign(request: PendingSignData): Promise<any> {
  return new Promise(resolve => {
    chrome.windows.create({
      url: 'sign.html',
      width: 240,
      height: 400,
      focused: true,
      type: 'popup'
    });
    pendingSigns.set(request.uid, {
      request,
      openedWindow: false,
      resolve
    });
    console.log(JSON.stringify(pendingSigns));
  });
}

chrome.runtime.onConnectExternal.addListener(port => {
  const connectorId = 'knfkinkbmgjefmeaddmkgpgmbggdllcp';
    if (port.sender.id === connectorId) {
    port.onMessage.addListener(async message => {
      function rpcResponse(response) {
        port.postMessage({
          type: 'connector_rpc_response',
          uid: message.uid,
          return: response
        });
      }
      if (message.type === 'yoroi_connect_request') {
        if (db == null) {
          db = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
        }
        port.postMessage(
          { type: 'yoroi_connected' },
        );
      } else if (message.type === 'connector_rpc_request') {
        switch (message.function) {
          case 'sign_tx':
            {
              const resp = await confirmSign({
                type: 'tx',
                tx: message.params[0],
                uid: message.uid
              });
              console.log(`sign_tx resp: ${JSON.stringify(resp)}`);
              rpcResponse(resp);
            }
            break;
          case 'sign_tx_input':
            {
              const resp = await confirmSign({
                type: 'tx_input',
                tx: message.params[0],
                index: message.params[1],
                uid: message.uid
              });
              rpcResponse(resp);
            }
            break;
          case 'sign_data':
            {
              const resp = await confirmSign({
                type: 'data',
                address: message.params[0],
                bytes: message.params[1],
                uid: message.uid
              });
              rpcResponse(resp);
            }
            break;
          case 'get_balance':
            {
              const wallet = await firstWallet();
              const balance = await connectorGetBalance(wallet, message.params[0]);
              rpcResponse({ ok: balance});
            }
            break;
          case 'get_utxos':
            {
              const wallet = await firstWallet();
              const utxos = await connectorGetUtxos(wallet, message.params[0]);
              if (utxos != null) {
                rpcResponse({
                  ok: utxos
                });
              }/* else {
                // err
              } */
            }
            break;
          case 'get_used_addresses':
            rpcResponse({
              ok: ['mockUsedAddress1', 'mockUsedAddress2']
            });
            break;
          case `get_unused_addresses`:
            rpcResponse({
              ok: ['mockUnusedAddress1']
            });
            break;
          case 'submit_tx':
            // mock send
            await sleep(2000);
            rpcResponse({
              ok: message.params[0].id
            });
            break;
          case 'add_external_box':
            rpcResponse({
              ok: true
            });
            break;
          case 'ping':
            rpcResponse({
              ok: true,
            });
            break;
          default:
            rpcResponse({
              err: `unknown RPC: ${message.function}(${message.params})`
            })
            break;
        }
      }
    });
  } else {
    // disconnect?
  }
});
