import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser"
import { textPartFromWalletChecksumImagePart } from "@emurgo/cip4-js"
import { createIcon } from "@download/blockies"
import { getTtl } from './utils'

const cardanoAccessBtnRow = document.querySelector('#request-button-row')
const cardanoAuthCheck = document.querySelector('#check-identification')
const cardanoAccessBtn = document.querySelector('#request-access')
const connectionStatus = document.querySelector('#connection-status')
const walletPlateSpan = document.querySelector('#wallet-plate')
const walletIconSpan = document.querySelector('#wallet-icon')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getAccountBalance = document.querySelector('#get-balance')
const getUtxos = document.querySelector('#get-utxos')
const submitTx = document.querySelector('#submit-tx')
const signTx = document.querySelector('#sign-tx')
const createTx = document.querySelector('#create-tx')
const alertEl = document.querySelector('#alert')
const spinner = document.querySelector('#spinner')

let accessGranted = false
let cardanoApi
let utxos
let changeAddress
let transactionHex

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
];

function createBlockiesIcon(seed) {
  const colorIdx = Buffer.from(seed, 'hex')[0] % COLORS.length;
  const color = COLORS[colorIdx];
  return createIcon({
    seed,
    size: 7,
    scale: 5,
    bgcolor: color.primary,
    color: color.secondary,
    spotcolor: color.spots,
  })
}

toggleSpinner('show');

function onApiConnectied(api) {
  toggleSpinner('hide');
  let walletDisplay = 'an anonymous Yoroi Wallet';

  const authEnabled = api.isAuthEnabled();
  if (authEnabled) {
    const walletId = api.authGetWalletId();
    const pubkey = api.authGetWalletPubkey();
    console.log('Auth acquired successfully: ',
      JSON.stringify({ walletId, pubkey }));
    const walletPlate = textPartFromWalletChecksumImagePart(walletId);
    walletDisplay = `Yoroi Wallet ${walletPlate}`;
    walletIconSpan.appendChild(createBlockiesIcon(walletId));
  }

  alertSuccess(`You have access to ${walletDisplay} now`);
  walletPlateSpan.innerHTML = walletDisplay;
  toggleConnectionUI('status');
  accessGranted = true;
  cardanoApi = api;

  api.onDisconnect(() => {
    alertWarrning(`Disconnected from ${walletDisplay}`);
    toggleConnectionUI('button');
    walletPlateSpan.innerHTML = '';
    walletIconSpan.innerHTML = '';
  });

  if (authEnabled) {
    console.log('Testing auth signatures')
    const messageJson = JSON.stringify({
      type: 'this is a random test message object',
      rndValue: Math.random(),
    });
    const messageHex = Buffer.from(messageJson).toString('hex');
    console.log('Signing randomized message: ', JSON.stringify({
      messageJson,
      messageHex,
    }))
    api.authSignHexPayload(messageHex).then(sig => {
      console.log('Signature received: ', sig);
      console.log('Verifying signature against the message');
      api.authCheckHexPayload(messageHex, sig).then(r => {
        console.log('Signature matches message: ', r);
      }, e => {
        console.error('Sig check failed', e);
      });
    }, err => {
      console.error('Sig failed', err);
    });
  }
}

cardanoAccessBtn.addEventListener('click', () => {
    toggleSpinner('show');
    const requestIdentification = cardanoAuthCheck.checked;
    cardano.yoroi.enable({ requestIdentification }).then(
      function(api){
          onApiConnectied(api);
      },
      function (err) {
        toggleSpinner('hide');
        alertError(`Error: ${err}`);
      },
    );
})

getAccountBalance.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
    } else {
        toggleSpinner('show')
        cardanoApi.getBalance().then(function(balance) {
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
        cardanoApi.getUnusedAddresses().then(function(addresses) {
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
        cardanoApi.getUsedAddresses().then(function(addresses) {
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
        cardanoApi.getChangeAddress().then(function(address) {
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
    cardanoApi.getUtxos().then(utxosResponse => {
        toggleSpinner('hide')
        if(utxosResponse.length === 0){
            alertWarrning('NO UTXOS')
        } else {
            utxos = utxosResponse
            alertSuccess(`Check the console`)
            let adaAmount = 0n
            const assetAmount = {} // asset id to amount mapping

            for (const utxo of utxosResponse) {
              adaAmount += BigInt(utxo.amount)
              for (const asset of utxo.assets) {
                if (assetAmount[asset.assetId]) {
                  assetAmount[asset.assetId] += BigInt(asset.amount)
                } else {
                  assetAmount[asset.assetId] = BigInt(asset.amount)
                }
              }
            }
            // `adaAmount` is the same as the return value `getBalance()`
            console.log('Ada balance:', adaAmount);
            console.log('Assets:\n' + Object.keys(assetAmount).map(assetId=>`${assetId}: ${assetAmount[assetId]}`).join('\n'));

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
  cardanoApi.submitTx(transactionHex).then(txId => {
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
  
  const txBuilder = CardanoWasm.TransactionBuilder.new(
    // all of these are taken from the mainnet genesis settings
    // linear fee parameters (a*size + b)
    CardanoWasm.LinearFee.new(CardanoWasm.BigNum.from_str('44'), CardanoWasm.BigNum.from_str('155381')),
    // minimum utxo value
    CardanoWasm.BigNum.from_str('1000000'),
    // pool deposit
    CardanoWasm.BigNum.from_str('500000000'),
    // key deposit
    CardanoWasm.BigNum.from_str('2000000'),
    // maxValueBytes
    5000,
    // maxTxBytes
    16384,
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

  cardanoApi.signTx(txHex, true).then(witnessSetHex => {
    toggleSpinner('hide')

    const witnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(
      Buffer.from(witnessSetHex, 'hex')
    )
    const transaction = CardanoWasm.Transaction.new(
      txBody,
      witnessSet,
      undefined,
    )
    transactionHex = Buffer.from(transaction.to_bytes()).toString('hex')
    alertSuccess('Signing tx succeeds: ' + transactionHex)

  }).catch(error => {
    console.error(error)
    toggleSpinner('hide')
    alertWarrning('Signing tx fails')
  })
})

createTx.addEventListener('click', () => {
  toggleSpinner('show');
  
  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }
  
  const output = CardanoWasm.TransactionOutput.new(
    CardanoWasm.Address.from_bech32(SEND_TO_ADDRESS),
    CardanoWasm.Value.new(CardanoWasm.BigNum.from_str('1000002'))
  )
  
  const txReq = {
    includeInputs: [
      'a8ecebf0632518736474012f8d644b6b287859713f60624e961d230422e45c192'
    ],
    includeOutputs: [
      Buffer.from(output.to_bytes()).toString('hex'),
    ],
    includeTargets: [
      {
        // do not specify value, the connector will use minimum value
        address: '00756c95f9967c214e571500a0140b88f6dd9c4a7444e74acc1841ce92c3892366f174a76af9252f78368f5747d3055ab3568ea3b6bf40b01e',
        assets: {
          '2c9d0ecfc2ee1288056df15be4196d8ded73db345ea5b4cd5c7fac3f.76737562737465737435': 1,
        },
      }
    ]
  }
  
  cardanoApi.createTx(txReq, true).then(txHex => {
    toggleSpinner('hide')
    alertSuccess('Creating tx succeeds: ' + txHex)
    transactionHex = txHex
  }).catch(error => {
    console.error(error)
    toggleSpinner('hide')
    alertWarrning('Creating tx fails')
  })
})

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

function toggleConnectionUI(status) {
  if (status === 'button') {
    connectionStatus.classList.add('d-none');
    cardanoAccessBtnRow.classList.remove('d-none');
  } else {
    cardanoAccessBtnRow.classList.add('d-none');
    connectionStatus.classList.remove('d-none');
  }
}

const onload = window.onload;
window.onload = function() {
  if (onload) {
    onload();
  }
  if (typeof window.cardano === "undefined") {
    alertError("Cardano API not found");
  } else {
    console.log("Cardano API detected, checking connection status");
    cardano.yoroi.enable({ requestIdentification: true, onlySilent: true }).then(
      api => {
        console.log('successful silent reconnection')
        onApiConnectied(api);
      },
      err => {
        if (String(err).includes('onlySilent:fail')) {
          console.log('no silent re-connection available');
        } else {
          console.error('Silent reconnection failed for unknown reason!', err);
        }
        toggleSpinner('hide');
        toggleConnectionUI('button');
      }
    );
  }
}
