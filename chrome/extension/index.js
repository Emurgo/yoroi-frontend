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


window.addEventListener('load', initializeYoroi);
/**
 * To avoid bugs that may occur when multiple copies of Yoroi are running at the same time
 * we only allow one tab open at a time.
 *
 * Since all copies of Yoroi running use the same localstorage instance,
 * we use a localstorage listener on a specific key to detect new tabs being opened.
 *
 * Note: you can only listen on localstorage and not session storage
 * Note: listener only fires for localstorage changes made by OTHER Yoroi tabs
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Responding_to_storage_changes_with_the_StorageEvent
*/

const OPEN_TAB_ID_KEY = 'openTabId';

/**
 * It's possible to have two copies of Yoroi loading at the same time by going to the URL directly
 * Therefore it's important that we add this listener BEFORE we modify the localstorage
 * This avoids the race condition where both update localstorage but neither are listening
 *
 * Note: this may cause two copies of Yoroi loading at the same time close each other
 */
window.onstorage = (e: StorageEvent) => {
  // if another Yoroi tab open, close this tab
  if (e.key === OPEN_TAB_ID_KEY) {
    // note: we don't need "tabs" permission to get or remove our own tab
    chrome.tabs.getCurrent(id => chrome.tabs.remove(id.id));
  }
};

/**
 * Notify any other Yoroi tabs to close before we initialize
 * Note: for the listner to fire, the key much change values
 * To generate a new value every time, we use the current time
 *
 * The precision of the clock may be of concern. Let's look at two scenarios:
 *
 * 1) Opening Yoroi by pressing the Yoroi icon
 * In this case, Chrome only allows you to load one copy of Yoroi at the same time.
 * This restriction applies even across multiple copies of Chrome running at the same time
 * Since Yoroi takes more than a millisecond to open, the time will always be unique.
 *
 * 2) Manually entering the Yoroi URL into a page multiple times
 * This bypasses above-mentioned restriction of only one copy loading at once
 * Emperically, this doesn't seem to be an issue though.
*/
localStorage.setItem(OPEN_TAB_ID_KEY, Date.now());

window.addEventListener('load', async () => {
  /**
   * Only initialize Yoroi once we know we're the only tab left
   * Note: we can't reliable know how long it takes for the other tab to close
   * so there may be a brief overlap
  */
  initializeYoroi();
});
