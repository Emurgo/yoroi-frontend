import * as wasm from "ergo-lib-wasm-browser";
const cardanoAccessBtn = document.querySelector('#request-access')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')

let accessGranted = false

function initDapp(){
    cardano_request_read_access().then(function(access_granted){
        if(!access_granted){
            alert("Wallet access denied")
        }else {
            alert("you have access now")
            accessGranted = true
            cardano.get_unused_addresses().then(function(addresses) {
                console.log(`get_unused_addresses() = ${JSON.stringify(addresses)}`);
            });
        }
    });
}

cardanoAccessBtn.addEventListener('click', () => {
    initDapp()
})

getUnUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
        alert('Should request access first')
    } else {
        cardano.get_unused_addresses().then(function(addresses) {
            console.log(`get_unused_addresses() = ${JSON.stringify(addresses)}`);
        });
    }
})


if (typeof cardano_request_read_access === "undefined") {
    alert("Cardano not found");
} else {
    console.log("Cardano found");
    window.addEventListener("ergo_wallet_disconnected", function(event) {
        console.log("Wallet Disconnect")
    });
}
