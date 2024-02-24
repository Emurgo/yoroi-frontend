// @flow

import { render } from 'react-dom';
// eslint-disable-next-line no-unused-vars
import { action, configure } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { createHashHistory } from 'history';
import { setupApi } from '../../../app/api/index';
import createStores from '../../../app/connector/stores/index';
// eslint-disable-next-line no-unused-vars
import { translations } from '../../../app/i18n/translations';
import actions from '../../../app/connector/actions/index';
// eslint-disable-next-line no-unused-vars
import { Action } from '../../../app/actions/lib/Action';
import App from '../../../app/connector/App';
import BigNumber from 'bignumber.js';
import { addCloseListener, TabIdKeys } from '../../../app/utils/tabManager';
import environment from '../../../app/environment';
import { ampli } from '../../../ampli/index';
import type { LoadOptionsWithEnvironment } from '../../../ampli/index';
import LocalStorageApi from '../../../app/api/localStorage';

// run MobX in strict mode
configure({ enforceActions: 'always' });

BigNumber.DEBUG = true;

// Entry point into our application
const initializeDappConnector: void => Promise<void> = async () => {
  const api = await setupApi();
  const router = new RouterStore();
  const hashHistory = createHashHistory();
  const history = syncHistoryWithStore(hashHistory, router);
  const stores = createStores(api, actions);

  window.yoroi = {
    api,
    actions,
    translations,
    stores,
    reset: action(() => {
      Action.resetAllActions();
      createStores(api, actions);
    }),
  };

  const root = document.querySelector('#root-yoroi-connector');
  if (root == null) {
    throw new Error('Root element not found.');
  }
  const AMPLI_FLUSH_INTERVAL_MS = 5000;
  const isAnalyticsAllowd = (new LocalStorageApi()).loadIsAnalyticsAllowed();
  await ampli.load(({
    environment: environment.isProduction() ? 'production' : 'development',
    client: {
      configuration: {
        optOut: !isAnalyticsAllowd,
        flushIntervalMillis: AMPLI_FLUSH_INTERVAL_MS,
        trackingOptions: {
          ipAddress: false,
        },
        defaultTracking: false,
      },
    },
  }: LoadOptionsWithEnvironment)).promise;

  render(<App stores={stores} actions={actions} history={history} />, root);
};

addCloseListener(TabIdKeys.YoroiConnector);

window.addEventListener('load', initializeDappConnector);
