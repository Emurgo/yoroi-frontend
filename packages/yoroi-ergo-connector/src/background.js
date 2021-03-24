import debounce from 'lodash/debounce';

function convertImgToBase64(url, outputFormat) {
    return new Promise(resolve => {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'), dataURL;
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            dataURL = canvas.toDataURL(outputFormat  'image/png');
            resolve(dataURL);
            canvas = null; 
        };
        img.src = url;
    });
}
  
chrome.runtime.onMessage.addListener(function (url, sender, onSuccess) {
    convertImgToBase64(url).then((response) => onSuccess(response));
    return true; // Will respond asynchronously.
});
const onConnectorIconClicked = () => {
  // note: we send a message instead of a browser action because the UI is managed by the Yoroi extension -- not be the connector
  chrome.runtime.sendMessage(extensionId, { type: "open_browseraction_menu" });
};

chrome.browserAction.onClicked.addListener(debounce(onConnectorIconClicked, 500, { leading: true }));
