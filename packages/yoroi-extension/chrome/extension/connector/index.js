// @flow

import { createRoot } from 'react-dom/client';
// eslint-disable-next-line no-unused-vars
import { action, configure } from 'mobx';
import { setupApi } from '../../../app/api/index';
import createStores from '../../../app/connector/stores/index';
// eslint-disable-next-line no-unused-vars
import { translations } from '../../../app/i18n/translations';
// eslint-disable-next-line no-unused-vars
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
  const stores = await createStores(api);

  window.yoroi = {
    api,
    translations,
    stores,
    reset: action(() => {
      createStores(api);
    }),
  };

  const container = document.querySelector('#root-yoroi-connector');
  if (container == null) {
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

  const root = createRoot(container);
  root.render(<App stores={stores} />);
};

addCloseListener(TabIdKeys.YoroiConnector);

window.addEventListener('load', initializeDappConnector);
