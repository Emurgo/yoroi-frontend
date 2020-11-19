// @flow

import React from 'react';
import { render } from 'react-dom';
import { action, configure } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createHashHistory } from 'history';
import { setupApi } from '../../app/api/index';
import createStores from '../../app/stores/index';
import { translations } from '../../app/i18n/translations';
import actions from '../../app/actions/index';
import { Action } from '../../app/actions/lib/Action';
import App from '../../app/App';
import '../../app/themes/index.global.scss';
import BigNumber from 'bignumber.js';
import { addCloseListener } from '../../app/utils/tabManager';

// run MobX in strict mode
configure({ enforceActions: 'always' });

// Only throw on an invalid BigNumber value if BigNumber.DEBUG is true
// Since Yoroi handles money, it's better to error our than proceed if an error occurs
BigNumber.DEBUG = true;

function getMethods(obj) {
var result = [];
    for (var id in obj) {
      try {
        if (typeof(obj[id]) == "function") {
          result.push(id + ": " + obj[id].toString());
        }
      } catch (err) {
        result.push(id + ": inaccessible");
      }
    }
    return result;
  }

// Entry point into our application
const initializeYoroi: void => Promise<void> = async () => {
  const api = await setupApi();
  const router = new RouterStore();
  const hashHistory = createHashHistory();
  const history = syncHistoryWithStore(hashHistory, router);
  const stores = createStores(api, actions, router);

  window.yoroi = {
    api,
    actions,
    translations,
    stores,
    reset: action(() => {
      Action.resetAllActions();
      createStores(api, actions, router);
    })
  };
  //alert("yoroi.api = " + JSON.stringify(window.yoroi.stores.wallets));

  const root = document.querySelector('#root');
  if (root == null) {
    throw new Error('Root element not found.');
  }
  render(
    <App stores={stores} actions={actions} history={history} />,
    root
  );

  chrome.runtime.sendMessage(
    "egflibcdkfhnhdpbdlbgopagfdbkghbo",
    {type: "yoroi_connected"},
  );
};

addCloseListener();

window.addEventListener('load', initializeYoroi);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function rpcHandler(message, sender, sendResponse) {
  alert(`received ${JSON.stringify(message)} from rpcHandler`);
  if (sender.id == "egflibcdkfhnhdpbdlbgopagfdbkghbo") {
      console.log("REAL(index.js)-yoroi received: " + JSON.stringify(message))
      if (message.type == "connector_rpc_request") {
          switch (message.function) {
              case "get_balance":
                  if (message.params[0] == "ERG") {
                      //sleep(5000).then(() => {
                        //window.yoroi.api.?.
                        const wallets = window.yoroi.stores.wallets;
                        console.log("wallets: " + wallets.publicDerivers);
                        const publicDeriver = wallets.first;
                        //alert();
                        //const getBalance = asGetBalance(publicDeriver);
                        publicDeriver.getBalance().then(x => { 
                        sendResponse({
                            //ok: publicDeriver.getBalance()
                            ok: x
                        });
                        });
                      //});
                  } else {
                      sendResponse({
                          ok: 5
                      });
                  }
                  break;
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
      }
  } else {
      alert("received message \"" + message + "\" from other sender: " + sender.id);
  }
}

chrome.runtime.onMessageExternal.addListener(rpcHandler);
