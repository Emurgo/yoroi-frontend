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
import {
  asGetAllUtxos,
  asGetBalance,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';

/*::
declare var chrome;
*/

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

let db: ?lf$Database = null;
// rpc uid -> { request, openedWindow, resolve, reject } (TODO: add flow types to this)
const pendingSigns: Map<number, any> = new Map();

// for mocking out network delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(JSON.stringify(sender));
  //alert(`received event: ${JSON.stringify(request)}`);
  if (request.type === 'sign_confirmed') {
    const responseData = pendingSigns.get(request.uid);
    if (responseData) {
      switch (responseData.request.type) {
        case 'tx':
          {
            // mocked out signing
            const tx = request.tx;
            let mockSignedTx = tx;
            mockSignedTx.inputs = tx.inputs.map(input => {
              return {
                boxId: input.boxId,
                spendingProof: {
                  proofBytes: '0x267272632abddfb172',
                  extension: {}
                },
                extension: {}
              }
            });
            mockSignedTx.size = 0;
            responseData.resolve({ ok: mockSignedTx });
          }
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
    for (let [uid, responseData] of pendingSigns.entries()) {
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

async function confirmSign(request): Promise<any> {
  return new Promise((resolve, reject) => {
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
      resolve,
      reject
    });
    console.log(JSON.stringify(pendingSigns));
  });
}

chrome.runtime.onConnectExternal.addListener(port => {
  const connectorId = 'knfkinkbmgjefmeaddmkgpgmbggdllcp';
    if (port.sender.id === connectorId) {
    port.onMessage.addListener(async message => {
      async function firstWallet(): Promise<PublicDeriver<>> {
        if (db != null) {
          const wallets = await getWallets({ db });
          return Promise.resolve(wallets[0]);
        }
        throw Promise.reject(new Error('Database not loaded for connector RPCs'));
      }
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
          case 'get_balance':
            if (message.params[0] === 'ERG') {
              const wallet = await firstWallet();
              const canGetBalance = asGetBalance(wallet);
              if (canGetBalance != null) {
                const balance = await canGetBalance.getBalance();
                rpcResponse({ ok: balance });
              }
            } else {
              rpcResponse({ ok: 5 });
            }
            break;
          case 'get_utxos':
            {
              const wallet = await firstWallet();
              const canGetAllUtxos = await asGetAllUtxos(wallet);
              if (canGetAllUtxos != null) {
                let utxos = await canGetAllUtxos.getAllUtxos();
                // TODO: more intelligently choose values?
                const valueExpected = message.params[0];
                if (typeof valueExpected !== 'undefined') {
                  // TODO: use bigint/whatever yoroi uses for values
                  let valueAcc = 0;
                  let utxosToUse = [];
                  for (let i = 0; i < utxos.length && valueAcc < valueExpected; i += 1) {
                    const val = parseInt(utxos[i].output.UtxoTransactionOutput.Amount, 10);
                    console.log(`get_utxos[1]: at ${valueAcc} of ${valueExpected} requested - trying to add ${val}`);
                    valueAcc += val;
                    utxosToUse.push(utxos[i]);
                    console.log(`get_utxos[2]: at ${valueAcc} of ${valueExpected} requested`);
                  }
                  utxos = utxosToUse;
                }
                let utxosFormatted = utxos.map(utxo => {
                  let tx = utxo.output.Transaction;
                  let box = utxo.output.UtxoTransactionOutput;
                  return {
                    boxId: box.ErgoBoxId,
                    value: box.Amount,
                    ergoTree: box.ErgoTree,
                    assets: [],
                    additionalRegisters: {},
                    creationHeight: box.ErgoCreationHeight,
                    transactionId: tx.TransactionId,
                    index: box.OutputIndex
                  }
                });
                rpcResponse({
                  ok: utxosFormatted
                });
              }
            }
            break;
          case 'sign_tx_input':
            // const input = params[0];
            // mock signing
            rpcResponse({
              err: {
                code: 1,
                info: 'mock proof generation error - tx not signed',
              }
            });
            break;
          case 'sign_data':
            // mock signing
            rpcResponse({
              ok: '0x82cd23b432afab24343f'
            });
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
  }
});