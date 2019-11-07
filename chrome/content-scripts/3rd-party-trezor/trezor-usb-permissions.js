// @flow
/*
Handling messages from usb permissions iframe
*/

declare var chrome; // TODO: no type for chrome

const switchToPopupTab = (event) => {
    window.removeEventListener('beforeunload', switchToPopupTab);

    if (!event) {
        // triggered from 'usb-permissions-close' message
        // switch tab to previous index and close current
        chrome.tabs.query({
            currentWindow: true,
            active: true,
        }, (current) => {
            if (current.length < 0) return;
            chrome.tabs.query({
                index: current[0].index - 1,
            }, popup => {
                if (popup.length < 0) return;
                chrome.tabs.update(popup[0].id, { active: true });
            });
            chrome.tabs.remove(current[0].id);
        });
        return;
    }

    // triggered from 'beforeunload' event
    // find tab by popup pattern and switch to it
    chrome.tabs.query({
        url: '*://connect.trezor.io/*/popup.html',
    }, (tabs) => {
        if (tabs.length < 0) return;
        chrome.tabs.update(tabs[0].id, { active: true });
    });
};

window.addEventListener('message', event => {
    if (event.data === 'usb-permissions-init') {
        const iframe = document.getElementById('trezor-usb-permissions');
        if (!iframe || !(iframe instanceof HTMLIFrameElement)) {
            throw new Error('trezor-usb-permissions missing or incorrect dom type');
        }
        iframe.contentWindow.postMessage({
            type: 'usb-permissions-init',
            extension: chrome.runtime.id,
        }, '*');
    } else if (event.data === 'usb-permissions-close') {
        switchToPopupTab();
    }
});

window.addEventListener('beforeunload', switchToPopupTab);
