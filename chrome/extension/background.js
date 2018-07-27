const bluebird = require('bluebird');
const _ = require('lodash');

global.Promise = bluebird;

function promisifier(method) {
  // return a function
  return function promisified(...args) {
    // which returns a promise
    return new Promise(resolve => {
      args.push(resolve);
      method.apply(this, args);
    });
  };
}

function promisifyAll(obj, list) {
  list.forEach(api => bluebird.promisifyAll(obj[api], { promisifier }));
}

// let chrome extension api support Promise
promisifyAll(chrome, ['tabs', 'windows', 'browserAction', 'contextMenus']);
promisifyAll(chrome.storage, ['local']);


function getBaseUrl(url) {
  return url.split("#")[0];
}

let currentTab;

chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === currentTab.id) currentTab = undefined;
});

const selectWindow = (windowId) => chrome.windows.update(windowId, { focused: true });

const onIconClicked = () => {
  if (currentTab) {
    chrome.tabs.update(currentTab.id, { active: true }, () => selectWindow(currentTab.windowId));
  } else {
    chrome.tabs.create({ url: 'main_window.html' }, ({ id, windowId }) => {
      currentTab = {
        id,
        windowId,
      };
    });
  }
};

chrome.tabs.onUpdated.addListener((tabId, changes) => {
  if (!currentTab) return; // If no tab loaded, return.
  if (currentTab.id === tabId && changes.url) {
    currentTab.baseUrl = getBaseUrl((changes.url));
    return;
  }
  if (changes.url) {
    const baseUrl = getBaseUrl((changes.url));
    if (baseUrl === currentTab.baseUrl) {
      selectWindow();
      chrome.tabs.remove(tabId);
    }
  }
});

chrome.browserAction.onClicked.addListener(_.debounce(onIconClicked, 500));
