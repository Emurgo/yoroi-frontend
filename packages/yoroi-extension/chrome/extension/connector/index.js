// @flow

import ReactDOM from 'react-dom/client';
import { action, configure } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createHashHistory } from 'history';
import { setupApi } from '../../../app/api/index';
import createStores from '../../../app/connector/stores/index';
import { translations } from '../../../app/i18n/translations';
import actions from '../../../app/connector/actions/index';
import { Action } from '../../../app/actions/lib/Action';
import App from '../../../app/connector/App';
import BigNumber from 'bignumber.js';
import { addCloseListener, TabIdKeys } from '../../../app/utils/tabManager';

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

  const rootElement = document.querySelector('#root-ergo');
  if (rootElement == null) {
    throw new Error('Root element not found.');
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(<App stores={stores} actions={actions} history={history} />, root);
};

addCloseListener(TabIdKeys.ErgoConnector);

window.addEventListener('load', initializeErgoConnector);
