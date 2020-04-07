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

// Entry point into our application
const initializeYoroi = async () => {
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

  const root = document.querySelector('#root');
  if (root == null) {
    throw new Error('Root element not found.');
  }
  render(
    <App stores={stores} actions={actions} history={history} />,
    root
  );
};

addCloseListener();

window.addEventListener('load', initializeYoroi);
