import * as wasm from "ergo-lib-wasm-browser";
const cardanoAccessBtn = document.querySelector('#request-access')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getAccountBalance = document.querySelector('#get-balance')
const getUtxos = document.querySelector('#get-utxos')
const alertEl = document.querySelector('#alert')
const spinner = document.querySelector('#spinner')

let accessGranted = false

function initDapp(){
    toggleSpinner('show')
    cardano_request_read_access().then(function(access_granted){
        toggleSpinner('hide')
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
        toggleSpinner('show')
        cardano.get_balance().then(function(balance) {
            toggleSpinner('hide')
            alertSuccess(`Account Balance: ${balance}`)
        });
    }
})

getUnUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        toggleSpinner('show')
        cardano.get_unused_addresses().then(function(addresses) {
            toggleSpinner('hide')
            if(addresses.length === 0){
                alertWarrning('No unused addresses')
            } else {
                alertSuccess(`Address: `)
                alertEl.innerHTML = '<pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
            }
        });
    }
})

getUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        toggleSpinner('show')
        cardano.get_used_addresses().then(function(addresses) {
            toggleSpinner('hide')
           if(addresses.length === 0){
               alertWarrning('No used addresses')
           } else {
               alertSuccess(`Address: ${addresses.concat(',')}`)
               alertEl.innerHTML = '<pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
           }
        });
    }
})

getChangeAddress.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
    } else {
        toggleSpinner('show')
        cardano.get_change_address().then(function(addresses) {
            toggleSpinner('hide')
            if(addresses.length === 0){
                alertWarrning('No change addresses')
            } else {
                alertSuccess(`Address: `)
                alertEl.innerHTML = '<pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
            }
        });
    }
})

getUtxos.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
        return
    }
    toggleSpinner('show')
    cardano.get_utxos().then(utxos => {
        toggleSpinner('hide')
        if(utxos.length === 0){
            alertWarrning('NO UTXOS')
        } else {
            alertSuccess(`Check the console`)
            alertEl.innerHTML = '<pre>' + JSON.stringify(utxos, undefined, 2) + '</pre>'
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

function toggleSpinner(status){
    if(status === 'show') {
        spinner.className = 'spinner-border'
        alertEl.className = 'd-none'
    } else {
        spinner.className = 'd-none'
    }
}