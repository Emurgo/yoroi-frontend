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

const connectorId = 'knfkinkbmgjefmeaddmkgpgmbggdllcp';

const onYoroiIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(debounce(onYoroiIconClicked, 500, { leading: true }));

let db: ?lf$Database = null;

chrome.runtime.onConnectExternal.addListener(port => {
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
        case "get_utxos":
          const wallet = await firstWallet();
          const canGetAllUtxos = asGetAllUtxos(wallet);
          if (canGetAllUtxos != null) {
            canGetAllUtxos.getAllUtxos().then(utxos => {
              // TODO: more intelligently choose values?
              const valueExpected = message.params[0];
              if (typeof valueExpected !== 'undefined') {
                // TODO: use bigint/whatever yoroi uses for values
                let valueAcc = 0;
                let utxosToUse = [];
                for (let i = 0; i < utxos.length && valueAcc < valueExpected; i += 1) {
                  const val = parseInt(utxos[i].output.UtxoTransactionOutput.Amount);
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
            });
          }
          break;
        case 'sign_tx':
          rpcResponse({
            err: {
              code: 2,
              info: 'User rejected',
            }
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
});