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
  asGetBalance,
} from '../../app/api/ada/lib/storage/models/PublicDeriver/traits';

/*::
declare var chrome;
*/

const connectorId = 'knfkinkbmgjefmeaddmkgpgmbggdllcp';

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

let db: ?lf$Database = null;

async function connectHandler(message, sender, sendResponse) {
  async function firstWallet(): Promise<PublicDeriver<>> {
    if (db != null) {
      const wallets = await getWallets({ db });
      return new Promise.resolve(wallets[0]);
    }
    throw Promise.reject(new Error('Database not loaded for connector RPCs'));
  }
  if (sender.id === connectorId) {
    if (message.type === 'yoroi_connect_request') {
      db = await loadLovefieldDB(schema.DataStoreType.INDEXED_DB);
      chrome.runtime.sendMessage(
		    connectorId,
		    { type: 'yoroi_connected' },
		  );
		  sendResponse(true);
    }
  } if (message.type === 'connector_rpc_request') {
    switch (message.function) {
      case 'get_balance':
        if (message.params[0] === 'ERG') {
          const wallet = await firstWallet();
          const canGetBalance = asGetBalance(wallet);
          if (canGetBalance != null) {
            const balance = await canGetBalance.getBalance();
            sendResponse({
              ok: balance
            });
          }
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
      case 'sign_tx':
        sendResponse({
          err: {
            code: 2,
            info: 'User rejected',
          }
        });
        break;
      case 'ping':
        sendResponse({
          ok: true,
        });
        break;
      default:
        sendResponse({
          err: `unknown RPC: ${message.function}(${message.params})`
        })
        break;
    }
  }
}

chrome.runtime.onMessageExternal.addListener(connectHandler);

