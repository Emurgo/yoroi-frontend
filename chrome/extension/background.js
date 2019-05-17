const _ = require('lodash');
const onIconClicked = () => {
  chrome.tabs.create({ url: 'main_window.html' });
};

chrome.browserAction.onClicked.addListener(_.debounce(onIconClicked, 500));
