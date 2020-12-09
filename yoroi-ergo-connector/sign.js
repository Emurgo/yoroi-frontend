// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//     console.log("sign.js message: " + JSON.stringify(request));
//     alert(JSON.stringify(request));
//     alert(JSON.stringify(sender));
// });

function close() {
    chrome.windows.getCurrent({}, window => {
        chrome.windows.remove(window.id);
    });
}

chrome.runtime.sendMessage({type: "tx_sign_window_retrieve_data"}, response => {
    console.log("tx data: " + JSON.stringify(response));
    const div = document.getElementById("tx-info");
    const text = document.createTextNode(JSON.stringify(response.params[0]));
    div.appendChild(text);
    const send = document.getElementById("tx-sign");
    send.onclick = () => {
        const yoroiExtensionId = "bgihpbbhciffmelcfbccneidnnmkcdhl";
        chrome.runtime.sendMessage(
            yoroiExtensionId,
            { type: "yoroi_sign_tx", tx: response.params[0], uid: response.uid });
        close();
    };
    const cancel = document.getElementById("tx-cancel");
    cancel.onclick = () => {
        chrome.runtime.sendMessage({ type: "tx_sign_rejected", uid: response.uid });
        close();
    };
});