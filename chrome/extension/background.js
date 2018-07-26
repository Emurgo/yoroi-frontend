const bluebird = require('bluebird');

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



let currentTab;

chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === currentTab.id) currentTab = undefined;
});

chrome.browserAction.onClicked.addListener(() => {
  if (currentTab) {
    chrome.tabs.update(currentTab.id, { active: true }, () => {
      chrome.windows.update(currentTab.windowId, { focused: true });
    });
  } else {
    chrome.tabs.create({ url: 'main_window.html' }, ({ id, windowId }) => {
      currentTab = {
        id,
        windowId,
      };
    });
  }
});
