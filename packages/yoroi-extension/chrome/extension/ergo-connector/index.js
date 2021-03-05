// @flow

import React from 'react';
import { render } from 'react-dom';
import { action, configure } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createHashHistory } from 'history';
import { setupApi } from '../../../app/api/index';
import createStores from '../../../app/ergo-connector/stores/index';
import { translations } from '../../../app/i18n/translations';
import actions from '../../../app/ergo-connector/actions/index';
import { Action } from '../../../app/actions/lib/Action';
import App from '../../../app/ergo-connector/App';
import '../../../app/themes/index.global.scss';
import BigNumber from 'bignumber.js';
import { addCloseListener } from '../../../app/utils/tabManager';

// run MobX in strict mode
configure({ enforceActions: 'always' });

BigNumber.DEBUG = true;

// Entry point into our application
const initializeErgoConnector: void => Promise<void> = async () => {
  const api = await setupApi();
  const router = new RouterStore();
  const hashHistory = createHashHistory();
  const history = syncHistoryWithStore(hashHistory, router);
  const stores = createStores(api, actions);

  window.ergo = {
    api,
    actions,
    translations,
    stores,
    reset: action(() => {
      Action.resetAllActions();
      createStores(api, actions);
    }),
  };

  const root = document.querySelector('#root-ergo');
  if (root == null) {
    throw new Error('Root element not found.');
  }

  render(<App stores={stores} actions={actions} history={history} />, root);
};

addCloseListener();

window.addEventListener('load', initializeErgoConnector);
