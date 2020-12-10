function disconnect() {
    //alert("disconnect clicked");
    window.dispatchEvent(new Event("ergo_wallet_disconnected"))
}

document.addEventListener('DOMContentLoaded', function() {
    var e = document.getElementById("main_disconnect");
    e.addEventListener("click", disconnect);

    chrome.storage.local.get("whitelist", function(result) {
        const whitelist = Object.keys(result).length === 0 ? [] : result.whitelist;
        const whitelistDiv = document.getElementById("whitelist");
        whitelist.forEach(url => {
            const entry = document.createElement("div");
            const button = document.createElement("button");
            // TODO: what other situations does this happen in?
            const urlText = url || "file://";
            const text = document.createTextNode(urlText);
            entry.appendChild(text);
            button.textContent = "X";
            button.addEventListener("click", function() {
                chrome.storage.local.set({whitelist:whitelist.filter(e => e != url)}, function() {
                    ///alert("whitelist updated");
                });
                whitelistDiv.removeChild(entry);
            });
            entry.appendChild(button);
            whitelistDiv.appendChild(entry);
        });
    });
});