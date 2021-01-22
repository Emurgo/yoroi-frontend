// @flow

/*::
declare var chrome;
*/

chrome.storage.local.get('connector_whitelist', async result => {
  const whitelist = Object.keys(result).length === 0 ? [] : result.connector_whitelist;
  const body = document.getElementsByTagName('body')[0];
  whitelist.forEach(url => {
    const entry = document.createElement('div');
    const button = document.createElement('button');
    // TODO: what other situations does this happen in?
    const urlText = url || 'file://';
    const text = document.createTextNode(urlText);
    entry.appendChild(text);
    button.textContent = 'remove';
    button.addEventListener('click', function() {
        chrome.storage.local.set({
          connector_whitelist: whitelist.filter(e => e !== url)
        });
        body.removeChild(entry);
    });
    entry.appendChild(button);
    body.appendChild(entry);
  });
});