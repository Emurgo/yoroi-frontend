import * as wasm from "ergo-lib-wasm-browser";
const cardanoAccessBtn = document.querySelector('#request-access')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getAccountBalance = document.querySelector('#get-balance')
const getUtxos = document.querySelector('#get-utxos')
const submitTx = document.querySelector('#submit-tx')
const signTx = document.querySelector('#sign-tx')
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

submitTx.addEventListener('click', () => {
  const tx = '83a40082825820aba09d4db0d9c594469199196696872336e3e1b1eafabc85c2ab82119bef72c400825820aba09d4db0d9c594469199196696872336e3e1b1eafabc85c2ab82119bef72c401018282583900f20459be4d9701d839605bbcc021886237d6b0a73ecbadb4d0dbde3ec3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e1a000f42408258390093610a3392d2c0ee9e2be8e9da14d5fb07e35a4c335453bd31372b58c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e821a247a85f6a2581c6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7a14004581cedcb58cae6fcb5def9f23663237c1d95bd54e51c3c40369e538661bca14363726401021a0002b511031a0214d61fa10082825820e5f0f9a6fe196ea035c8614af96a6dd06a731b7c07e2201bb5a0c0d89a4e27b65840a754bf6a280197029626174110095cd173df355439eec5c92f1f2adb0c42915ef33b8c771cd33e8a3c747af7794f1a1250946a79a194382aec7733a0abad1e058258200c6f80408ea0220d5effaf2b28244f3a0039022e8e898b23e3d2bf66b98eeb7c58400a8dbb7c3292f0d2858aafd0cd784a36b83471b50bb417efc09e35e55c66a925d7ff56d11ebf8f23c79721538f4efed2f1da03fc5cb8e16f5543b697d5eb0802f6'; //TODO

  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }
  toggleSpinner('show');
  cardano.submit_tx(tx).then(txId => {
    toggleSpinner('hide');
    alertSuccess(`Transaction ${txId} submitted`);
  }).catch(error => {
    toggleSpinner('hide');
    alertWarrning('Transaction submission failed');
  });
});

signTx.addEventListener('click', () => {
  const tx = { amount: '1000000', receiver: '00756c95f9967c214e571500a0140b88f6dd9c4a7444e74acc1841ce92c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e' };
  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }
  toggleSpinner('show');
  cardano.sign_tx(tx).then(signedTx => {
    debugger
    toggleSpinner('hide');
    alertSuccess('Signing tx succeeds: ' + signedTx);
  }).catch(error => {
    toggleSpinner('hide');
    alertWarrning('Signing tx fails');
  });
});

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
