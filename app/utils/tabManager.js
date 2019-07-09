// @flow

declare var chrome; // TODO: no type for chrome

/**
 * We may run into bugs if the user has two copies of Yoroi running on the same localstorage
 * Since Yoroi data process is not transactional.
 *
 * To avoid these bugs, we only allow one tab open at a time.
 *
 * Since all copies of Yoroi running use the same localstorage instance,
 * we use a localstorage listener on a specific key to detect new tabs being opened.
 *
 * Note: you can only listen on localstorage and not session storage
 * Note: listener only fires for localstorage changes made by OTHER Yoroi tabs
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Responding_to_storage_changes_with_the_StorageEvent
*/

/**
 * Name of key we use in localstorage
 */
const OPEN_TAB_ID_KEY = 'openTabId';

/**
 * It's possible to have two copies of Yoroi loading at the same time by going to the URL directly
 * Therefore it's important that we add this listener BEFORE we modify the localstorage
 * This avoids the race condition where both update localstorage but neither are listening
 *
 * Note: this may cause two copies of Yoroi loading at the same time close each other
 */
export function addCloseListener(yoroiWindow: typeof window) {
  yoroiWindow.onstorage = (e: StorageEvent) => {
    // if another Yoroi tab open, close this tab
    if (e.key === OPEN_TAB_ID_KEY) {
      // note: we don't need "tabs" permission to get or remove our own tab
      // $FlowFixMe
      chrome.tabs.getCurrent(id => chrome.tabs.remove(id.id));
    }
  };
}

/**
 * Notify any other Yoroi tabs to close before we initialize
 * Note: for the listner to fire, the key much change values
 * To generate a new value every time, we use the current time
 *
 * The precision of the clock may be of concern. Let's look at two scenarios:
 *
 * 1) Opening Yoroi by pressing the Yoroi icon
 * In this case, Chrome & Firefox only allows you to load one copy of Yoroi at the same time.
 * This restriction applies even across multiple copies of Chrome running at the same time
 * (however this restriction can probabilistically fail if you mash the Yoroi logo very fast)
 * Since Yoroi takes more than a millisecond to open, the time should bee unique.
 *
 * 2) Manually entering the Yoroi URL into a page multiple times
 * This bypasses above-mentioned restriction of only one copy loading at once
 * Emperically, this doesn't seem to be an issue though.
 *
 * WARNING: You should only call this AFTER the wasm bindings have loaded
 * closing a different copy of Yoroi while loading WASM causes the load to hang
 * This bug only exists in Chrome (verified still occurs in Chrome v75)
 *
 * WARNING: You should call this function BEFORE making any other changes to localstorage
*/
export function closeOtherInstances() {
  localStorage.setItem(OPEN_TAB_ID_KEY, Date.now().toString());
}

export const handlersSettingUrl: string = 'chrome://settings/handlers';

/** To open special URLs like chrome://settings you need to use the Chrome API */
export function openSandboxedTab(url: string) {
  chrome.tabs.create({ url });
}
