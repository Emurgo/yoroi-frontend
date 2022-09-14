// @flow

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
import BigNumber from 'bignumber.js';
import { addCloseListener, TabIdKeys } from '../../app/utils/tabManager';
import { Logger } from '../../app/utils/logging';
import { LazyLoadPromises } from '../../app/Routes';
import environment from '../../app/environment';
import { trackStartup } from '../../app/api/analytics';

// run MobX in strict mode
configure({ enforceActions: 'always' });

// Only throw on an invalid BigNumber value if BigNumber.DEBUG is true
// Since Yoroi handles money, it's better to error our than proceed if an error occurs
BigNumber.DEBUG = true;

// Entry point into our application
const initializeYoroi: void => Promise<void> = async () => {
  const api = await setupApi();
  const router = new RouterStore();
  const hashHistory = createHashHistory();
  const history = syncHistoryWithStore(hashHistory, router);
  const stores = createStores(api, actions, router);
  await trackStartup(stores);

  Logger.debug(`[yoroi] stores created`);

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
  Logger.debug(`[yoroi] root located`);

  // eagerly cache
  await stores.profile.getProfileLocaleRequest.execute();

  // lazy loading breaks e2e tests, so eagerly load the pages
  if (environment.isTest()) {
    for (const promise of LazyLoadPromises) {
      promise()
    }
  }

  render(
    <App stores={stores} actions={actions} history={history} />,
    root
  );
};

addCloseListener(TabIdKeys.Primary);

window.addEventListener('load', initializeYoroi);
