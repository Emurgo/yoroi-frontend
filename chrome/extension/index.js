import React from 'react';
import { render } from 'react-dom';
import { action, useStrict } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { hashHistory } from 'react-router';
import { setupApi } from '../../app/api/index';
import createStores from '../../app/stores/index';
import translations from '../../app/i18n/translations';
import actions from '../../app/actions/index';
import Action from '../../app/actions/lib/Action';
import App from '../../app/App';
import '../../app/themes/index.global.scss';

// run MobX in strict mode
useStrict(true);

const initializeIcarus = async () => {
  const api = setupApi();
  const router = new RouterStore();
  const history = syncHistoryWithStore(hashHistory, router);
  const stores = createStores(api, actions, router);

  window.icarus = {
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

window.addEventListener('load', initializeIcarus);
