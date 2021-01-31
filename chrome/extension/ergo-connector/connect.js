// @flow

/*::
declare var chrome;
*/

import { getWalletsInfo } from '../background';

function close() {
  chrome.windows.getCurrent({}, window => {
    chrome.windows.remove(window.id);
  });
}

chrome.runtime.sendMessage({ type: 'connect_retrieve_data' }, async response => {
  if (response == null) {
    close();
  }
  const info = document.getElementById('connect-info');
  if (info != null) {
    info.innerText = `Would you like to connect to ${response.url}?`;
  }
  const accountList = document.getElementById('account-list');
  if (accountList != null) {
    const accounts = await getWalletsInfo();
    for (let i = 0; i < accounts.length; i += 1) {
      const p = document.createElement('p');
      const name = accounts[i].name;
      const balance = parseInt(accounts[i].balance, 10);
      const text = document.createTextNode(`${name} - ${balance} nanoERGS`);
      p.appendChild(text);
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'account';
      radio.value = i.toString();
      if (i === 0) {
        radio.checked = true;
      }
      p.appendChild(radio);
      accountList.appendChild(p);
    }
  }
  const connect = document.getElementById('connect');
  if (connect != null) {
    connect.onclick = () => {
      const accountsSelected: HTMLCollection<HTMLInputElement> = (document.getElementsByName('account'): any);
      for (let i = 0; i < accountsSelected.length; i += 1) {
        // $FlowFixMe
        if (accountsSelected[i].checked) {
          chrome.storage.local.get('connector_whitelist', async result => {
            const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
            whitelist.push({ url: response.url, walletIndex: i });
            chrome.storage.local.set({ connector_whitelist: whitelist });
          });
          chrome.runtime.sendMessage({
            type: 'connect_response',
            accepted: true,
            account: i,
            tabId: response.tabId
          });
          close();
          break;
        }
      }
    };
  }
  const cancel = document.getElementById('cancel');
  if (cancel != null) {
    cancel.onclick = () => {
      chrome.runtime.sendMessage({
        type: 'connect_response',
        accepted: false,
        tabId: response.tabId
      });
      close();
    };
  }
});