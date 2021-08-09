import * as wasm from "ergo-lib-wasm-browser";
const cardanoAccessBtn = document.querySelector('#cardano-access')

function initDapp(){
    alert('Request the access?')
    cardano_request_read_access().then(function(access_granted){
        if(!access_granted){
            alert("Wallet access denied")
        }else {
            alert("you have access now")
        }
    });
}

cardanoAccessBtn.addEventListener('click', () => {
    initDapp()
})


if (typeof cardano_request_read_access === "undefined") {
    alert("Cardano not found");
} else {
    console.log("Cardano found");
    window.addEventListener("ergo_wallet_disconnected", function(event) {
        const status = document.getElementById("status");
        status.innerText = "";
        const div = document.getElementById("balance");
        div.innerText = "Wallet disconnected.";
        const button = document.createElement("button");
        button.textContent = "Reconnect";
        button.onclick = initDapp;
        div.appendChild(button);
    });
}
