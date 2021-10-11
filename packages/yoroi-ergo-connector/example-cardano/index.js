import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser"
import { getTtl} from './utils'
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
let utxos
let changeAddress
let transactionHex

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
        cardano.get_change_address().then(function(address) {
            toggleSpinner('hide')
            if(address.length === 0){
                alertWarrning('No change addresses')
            } else {
                changeAddress = address
                alertSuccess(`Address: `)
                alertEl.innerHTML = '<pre>' + JSON.stringify(address, undefined, 2) + '</pre>'
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
    cardano.get_utxos().then(utxosResponse => {
        toggleSpinner('hide')
        if(utxosResponse.length === 0){
            alertWarrning('NO UTXOS')
        } else {
            utxos = utxosResponse
            alertSuccess(`Check the console`)
            alertEl.innerHTML = '<pre>' + JSON.stringify(utxosResponse, undefined, 2) + '</pre>'
        }
    })
})

submitTx.addEventListener('click', () => {
  if (!accessGranted) {
    alertError('Should request access first')
    return
  }
  if (!transactionHex) {
    alertError('Should sign tx first')
    return
  }

  toggleSpinner('show')
  cardano.submit_tx(transactionHex).then(txId => {
    toggleSpinner('hide')
    alertSuccess(`Transaction ${txId} submitted`);
  }).catch(error => {
    toggleSpinner('hide')
    alertWarrning('Transaction submission failed')
  })
})

const AMOUNT_TO_SEND = '1000000'
const SEND_TO_ADDRESS = 'addr_test1qz8xh9w6f2vdnp89xzqlxnusldhz6kdm4rp970gl8swwjjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0q4lztj0'

signTx.addEventListener('click', () => {
  toggleSpinner('show');
  
  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }

  if (!utxos) {
    alertError('Should request utxos first');
    return
  }

  if (!changeAddress) {
    alertError('Should request change address first')
  }
  
  const txBuilder = CardanoWasm.WalletV4TxBuilder(
    // all of these are taken from the mainnet genesis settings
    // linear fee parameters (a*size + b)
    CardanoWasm.LinearFee.new(CardanoWasm.BigNum.from_str('44'), CardanoWasm.BigNum.from_str('155381')),
    // minimum utxo value
    CardanoWasm.BigNum.from_str('1000000'),
    // pool deposit
    CardanoWasm.BigNum.from_str('500000000'),
    // key deposit
    CardanoWasm.BigNum.from_str('2000000')
  )

  // add a keyhash input - for ADA held in a Shelley-era normal address (Base, Enterprise, Pointer)
  const utxo = utxos[0]
  
  const addr = CardanoWasm.Address.from_bytes(
    Buffer.from(utxo.receiver, 'hex')
  )
  const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
  const keyHash = baseAddr.payment_cred().to_keyhash();
  txBuilder.add_key_input(
    keyHash,
    CardanoWasm.TransactionInput.new(
      CardanoWasm.TransactionHash.from_bytes(
        Buffer.from(utxo.tx_hash, "hex")
      ), // tx hash
      utxo.tx_index, // index
    ),
    CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount))
  )  

  const shelleyOutputAddress = CardanoWasm.Address.from_bech32(SEND_TO_ADDRESS)

  const shelleyChangeAddress = CardanoWasm.Address.from_bytes(
    Buffer.from(changeAddress, 'hex')
  )

  // add output to the tx
  txBuilder.add_output(
    CardanoWasm.TransactionOutput.new(
      shelleyOutputAddress,
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(AMOUNT_TO_SEND))    
    ),
  )

  const ttl = getTtl()
  txBuilder.set_ttl(ttl)

  // calculate the min fee required and send any change to an address
  txBuilder.add_change_if_needed(shelleyChangeAddress)

  const txBody = txBuilder.build()
  const txHex = Buffer.from(txBody.to_bytes()).toString('hex')

  cardano.sign_tx(txHex, true).then(witnessSetHex => {
    toggleSpinner('hide')
    alertSuccess('Signing tx succeeds: ')
    const witnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(
      Buffer.from(witnessSetHex, 'hex')
    )
    const transaction = CardanoWasm.Transaction.new(
      txBody,
      witnessSet,
      undefined,
    )
    transactionHex = Buffer.from(transaction.to_bytes()).toString('hex')
  }).catch(error => {
    console.error(error)
    toggleSpinner('hide')
    alertWarrning('Signing tx fails')
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
