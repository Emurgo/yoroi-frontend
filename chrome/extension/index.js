import React from 'react';
import { render } from 'react-dom';
import { action, useStrict } from 'mobx';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { loadRustModule } from 'rust-cardano-crypto';
import { hashHistory } from 'react-router';
import { setupApi } from '../../app/api/index';
import { loadLovefieldDB } from '../../app/api/ada/lib/lovefieldDatabase';
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

  // FIXME: Create an AsyncLibrariesStore ?) in order to initialize these
  try {
    await Promise.all([loadRustModule(), loadLovefieldDB()]);
    console.debug('index::initializeIcarus Async modules loaded');
  } catch (error) {
    console.error('index::initializeIcarus Unable to load async modules', error);
  }

  render(
    <App stores={stores} actions={actions} history={history} />,
    document.querySelector('#root')
  );
};

window.addEventListener('load', initializeIcarus);
