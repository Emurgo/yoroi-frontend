// @flow

/*::
declare var chrome;
*/

function close() {
  chrome.windows.getCurrent({}, window => {
    chrome.windows.remove(window.id);
  });
}

chrome.runtime.sendMessage({ type: 'tx_sign_window_retrieve_data' }, response => {
  if (response == null) {
    close();
  }
  console.log('tx data: ' + JSON.stringify(response));
  // TODO: handle other sign types
  const div = document.getElementById('tx-info');
  if (div != null) {
    const tx = response.tx;
    const txid = document.createTextNode(tx.id);
    div.appendChild(txid);
    for (const input of tx.inputs) {
      const inputDiv = document.createElement('div');
      const boxId = document.createTextNode(`Input: ${input.boxId$} - [resolve value here?]`);
      inputDiv.appendChild(boxId);
      div.appendChild(inputDiv);
    }
    for (const output of tx.outputCandidates) {
      const outputDiv = document.createElement('div');
      const boxId = document.createTextNode(`Output: [resolve address for address-only ergotrees?] - [${output.value} nanoERGs]`);
      outputDiv.appendChild(boxId);
      div.appendChild(outputDiv);
    }
    const valueDiv = document.createElement('div');
    if (valueDiv != null)
    {
      valueDiv.appendChild(document.createTextNode(`Value transfered: [TODO: calculate]`));
      div.appendChild(valueDiv);
    }
    const send = document.getElementById('tx-sign');
    if (send != null) {
      send.onclick = () => {
        chrome.runtime.sendMessage({
          type: 'sign_confirmed',
          tx: response.tx,
          uid: response.uid
        });
        close();
      };
    }
    const cancel = document.getElementById('tx-cancel');
    if (cancel != null) {
      cancel.onclick = () => {
        chrome.runtime.sendMessage({ type: 'sign_rejected', uid: response.uid });
        close();
      };
    }
  }
});