// @flow
import { render } from 'react-dom';
import { action, configure } from 'mobx';
import { setupApi } from '../../app/api/index';
import createStores from '../../app/stores/index';
import { translations } from '../../app/i18n/translations';
import App from '../../app/App';
import BigNumber from 'bignumber.js';
import { addCloseListener, TabIdKeys } from '../../app/utils/tabManager';
import { Logger } from '../../app/utils/logging';
import { LazyLoadPromises } from '../../app/Routes';
import environment from '../../app/environment';
import { getCardanoHaskellBaseConfig, networks } from '../../app/api/ada/lib/storage/database/prepackaged/networks';
import TimeUtils from '../../app/api/ada/lib/storage/bridge/timeUtils';

// run MobX in strict mode
configure({ enforceActions: 'always' });

// Only throw on an invalid BigNumber value if BigNumber.DEBUG is true
// Since Yoroi handles money, it's better to error our than proceed if an error occurs
BigNumber.DEBUG = true;

type SlotsProps = {|
  [networkId: number]: number,
|};

// Entry point into our application
const initializeYoroi: void => Promise<void> = async () => {
  const api = await setupApi();
  const stores = await createStores(api);

  Logger.debug(`[yoroi] stores created`);

  // calculate the last slot for each network for notifications
  const appLoadedSlotPerNetwork: SlotsProps = Object.values(networks).reduce((acc: SlotsProps, network: any) => {
    const fullConfig = getCardanoHaskellBaseConfig(network);
    const absSlotNumber = new BigNumber(TimeUtils.timeToAbsoluteSlot(fullConfig, new Date()));
    acc[network.NetworkId] = absSlotNumber.toNumber();
    return acc;
  }, {});

  window.yoroi = {
    appLoadedSlotPerNetwork,
    api,
    translations,
    stores,
    reset: action(async () => {
      await createStores(api);
    }),
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
      promise();
    }
  }

  render(<App stores={stores}/>, root);
};

addCloseListener(TabIdKeys.Primary);

window.addEventListener('load', initializeYoroi);
