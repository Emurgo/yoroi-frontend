import React from 'react';
import { render } from 'react-dom';
import { action, useStrict } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createHashHistory } from 'history';
import { setupApi } from '../../app/api/index';
import createStores from '../../app/stores/index';
import translations from '../../app/i18n/translations';
import actions from '../../app/actions/index';
import Action from '../../app/actions/lib/Action';
import App from '../../app/App';
import '../../app/themes/index.global.scss';
import { addCloseListener } from '../../app/utils/tabManager';

// run MobX in strict mode
useStrict(true);

// Entry point into our application
const initializeYoroi = async () => {
  const api = setupApi();
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

  render(
    <App stores={stores} actions={actions} history={history} />,
    document.querySelector('#root')
  );
};

addCloseListener(window);

window.addEventListener('load', initializeYoroi);
