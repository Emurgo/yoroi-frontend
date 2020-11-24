// @flow
import debounce from 'lodash/debounce';

import { setupApi } from '../../app/api/index';
import { schema } from 'lovefield';
import {
  loadLovefieldDB,
} from '../../app/api/ada/lib/storage/database/index';
import {
  getWallets
} from '../../app/api/common/index';

/*::
declare var chrome;
*/

const connectorId = "knfkinkbmgjefmeaddmkgpgmbggdllcp";

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

let db = undefined

async function connectHandler(message, sender, sendResponse) {
  // TODO: make this only loaded when needed
  async function firstWallet() {
    //const api = await setupApi();
    const wallets = await getWallets({db: db});
    return wallets[0];
  }
  if (sender.id == connectorId) {
    console.log("REAL(background.js)-yoroi received: " + JSON.stringify(message))
    if (message.type == "yoroi_connect_request") {
      //chrome.tabs.create({ url: 'main_window.html', active: true });
      db = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
      chrome.runtime.sendMessage(
		    connectorId,
		    {type: "yoroi_connected"},
		  );
		  sendResponse(true);
    }
  } if (message.type == "connector_rpc_request") {
    switch (message.function) {
      case "get_balance":
        if (message.params[0] == "ERG") {
          const wallet = await firstWallet();
          wallet.getBalance().then(x => {
            sendResponse({
              ok: x
            });
          });
        } else {
          sendResponse({
              ok: 5
          });
        }
        break;
      // case "get_utxos":
      //   const wallet = await firstWallet();
      //   wallet.getAllUtxos().then(x => {
      //     sendResponse({
      //       ok: x
      //     });
      //   });
      //   break;
      case "sign_tx":
        sendResponse({
          err: {
            code: 2,
            info: "User rejected",
          }
        });
      case "ping":
        sendResponse({
          ok: true,
        });
      default:
        sendResponse({
          err: "unknown RPC: " + message.function + "(" + message.params + ")"
        })
        break;
    }
  } else {
      console.log("received message \"" + message + "\" from other sender: " + sender.id);
  }
}

chrome.runtime.onMessageExternal.addListener(connectHandler);

