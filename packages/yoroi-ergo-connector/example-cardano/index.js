import * as wasm from "ergo-lib-wasm-browser";
const cardanoAccessBtn = document.querySelector('#request-access')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getAccountBalance = document.querySelector('#get-balance')
const getUtxos = document.querySelector('#get-utxos')
const alertEl = document.querySelector('#alert')

let accessGranted = false

function initDapp(){
    cardano_request_read_access().then(function(access_granted){
        if(!access_granted){
            alertError('Access Denied')
        }else {
            alertSuccess( 'You have access now')
            accessGranted = true
        }
    });
}

cardanoAccessBtn.addEventListener('click', () => {
    initDapp()
})

getAccountBalance.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        cardano.get_balance().then(function(balance) {
            alertSuccess(`Account Balance: ${balance}`)
        });
    }
})

getUnUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        cardano.get_unused_addresses().then(function(addresses) {
            if(addresses.length === 0){
                alertWarrning('No unused addresses')
            } else {
                alertSuccess(`Address: ${addresses.concat(',')}`)
            }
        });
    }
})

getUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        cardano.get_used_addresses().then(function(addresses) {
           if(addresses.length === 0){
               alertWarrning('No used addresses')
           } else {
               alertSuccess(`Address: ${addresses.concat(',')}`)
           }
        });
    }
})

getChangeAddress.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        cardano.get_change_address().then(function(addresses) {
            if(addresses.length === 0){
                alertWarrning('No change addresses')
            } else {
                alertSuccess(`Address: ${addresses.concat(',')}`)
            }
        });
    }
})

getUtxos.addEventListener('click', () => {
    cardano.get_utxos().then(utxos => {
        if(utxos.length === 0){
            alertWarrning('NO UTXOS')
        } else {
            alertSuccess(`Check the console`)
            console.log('Utxos', utxos)
        }
    })
})


if (typeof cardano_request_read_access === "undefined") {
    alert("Cardano not found");
} else {
    console.log("Cardano found");
    window.addEventListener("ergo_wallet_disconnected", function(event) {
        console.log("Wallet Disconnect")
    });
}

function alertError (text) {
    alertEl.className = 'alert alert-danger'
    alertEl.innerHTML = text
}

function alertSuccess(text) {
    alertEl.className = 'alert alert-success'
    alertEl.innerHTML = text
}

function alertWarrning(text) {
    alertEl.className = 'alert alert-warning'
    alertEl.innerHTML = text
}