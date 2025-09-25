// @flow
// This module tracks the list of open tabs (current only 1) and their active wallets.
import { MAX_MESSAGE_LENGTH } from './constants';
import { sendLongMessage } from './utils';

type SubscriptionEntry = {|
  tabId: number,
  // null if no active wallet open
  activeWalletId: ?number,
|};
type Callback = {|
  type: 'subscriptionChange',
|};

const subscriptions: Array<SubscriptionEntry> = [];
const callbacks: Array<(Callback) => void> = [];

function dispatchCallbacks(param: Callback) {
  callbacks.forEach(cb => cb(param));
}

function findSubscriptionByTabId(tabId: number): ?SubscriptionEntry {
  return subscriptions.find(subscription => subscription.tabId === tabId);
}

function deleteSubscription(subscription: SubscriptionEntry): void {
  const index = subscriptions.findIndex(({ tabId, activeWalletId }) =>
    tabId === subscription.tabId && activeWalletId === subscription.activeWalletId
  );
  if (index !== -1) {
    subscriptions.splice(index, 1);
    dispatchCallbacks({ type: 'subscriptionChange' });
  }
}

function addSubscription(tabId: number, activeWalletId: ?number) {
  subscriptions.push({ tabId, activeWalletId });
  dispatchCallbacks({ type: 'subscriptionChange' });
}

// we know that the frontend always opens
export function subscribe(tabId: number, activeWalletId: ?number) {
  const subscription = findSubscriptionByTabId(tabId);
  if (subscription) {
    deleteSubscription(subscription);
  }
  addSubscription(tabId, activeWalletId);
}

/*::
declare var chrome;
*/
chrome.tabs.onRemoved.addListener((tabId: number, _info) => {
  const subscription = findSubscriptionByTabId(tabId);
  if (subscription) {
    deleteSubscription(subscription);
  }
});

export function getSubscriptions(): Array<SubscriptionEntry> {
  return subscriptions;
}

export function registerCallback(callback: (Callback) => void) {
  callbacks.push(callback);
}

/*::
declare var chrome;
*/
const STATE_UPDATE_MESSAGE_TYPE = 'yoroi-emit-update';
let messageId = 0;
export function emitUpdateToSubscriptions(data: Object): void {
  for (const { tabId } of getSubscriptions()) {
    const message = JSON.stringify(data);
    if (message.length <= MAX_MESSAGE_LENGTH) {
      chrome.tabs.sendMessage(tabId, { type: STATE_UPDATE_MESSAGE_TYPE, data: message });
    } else {
      sendLongMessage(tabId, message, STATE_UPDATE_MESSAGE_TYPE, String(messageId++), MAX_MESSAGE_LENGTH);
    }
  }
}
