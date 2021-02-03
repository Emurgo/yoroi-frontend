// @flow

/*::
declare var chrome;
*/

import { getWalletsInfo } from '../background';

chrome.storage.local.get('connector_whitelist', async result => {
  const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
  const body = document.getElementsByTagName('body')[0];
  for (const { url, walletIndex } of whitelist) {
    // eslint-disable-next-line no-console
    console.log(`whitelist: ${url} - ${walletIndex}`);
    const entry = document.createElement('div');
    const button = document.createElement('button');
    // TODO: what other situations does this happen in?
    const urlText = url || 'file://';
    const accounts = await getWalletsInfo();
    const walletName = accounts[walletIndex].name;
    const text = document.createTextNode(`${urlText} (connected to ${walletName})`);
    entry.appendChild(text);
    button.textContent = 'remove';
    button.addEventListener('click', () => {
        chrome.storage.local.set({
          connector_whitelist: whitelist.filter(e => e.url !== url)
        });
        body.removeChild(entry);
    });
    entry.appendChild(button);
    body.appendChild(entry);
  }
});