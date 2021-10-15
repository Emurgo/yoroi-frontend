import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser"
import { getTtl } from './utils'
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
const mintNFT = document.querySelector('#mint-NFT')

let accessGranted = false
let utxos
let changeAddress
let transactionHex

function initDapp() {
  toggleSpinner('show')
  cardano_request_read_access().then(function (access_granted) {
    toggleSpinner('hide')
    if (!access_granted) {
      alertError('Access Denied')
    } else {
      alertSuccess('You have access now')
      accessGranted = true
    }
  });
}

cardanoAccessBtn.addEventListener('click', () => {
  initDapp()
})

getAccountBalance.addEventListener('click', () => {
  if (!accessGranted) {
    alertError('Should request access first')
  } else {
    toggleSpinner('show')
    cardano.get_balance().then(function (balance) {
      toggleSpinner('hide')
      alertSuccess(`Account Balance: ${balance}`)
    });
  }
})

getUnUsedAddresses.addEventListener('click', () => {
  if (!accessGranted) {
    alertError('Should request access first')
  } else {
    toggleSpinner('show')
    cardano.get_unused_addresses().then(function (addresses) {
      toggleSpinner('hide')
      if (addresses.length === 0) {
        alertWarrning('No unused addresses')
      } else {
        alertSuccess(`Address: `)
        alertEl.innerHTML = '<pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
      }
    });
  }
})

getUsedAddresses.addEventListener('click', () => {
  if (!accessGranted) {
    alertError('Should request access first')
  } else {
    toggleSpinner('show')
    cardano.get_used_addresses().then(function (addresses) {
      toggleSpinner('hide')
      if (addresses.length === 0) {
        alertWarrning('No used addresses')
      } else {
        alertSuccess(`Address: ${addresses.concat(',')}`)
        alertEl.innerHTML = '<pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
      }
    });
  }
})

getChangeAddress.addEventListener('click', () => {
  if (!accessGranted) {
    alertError('Should request access first')
  } else {
    toggleSpinner('show')
    cardano.get_change_address().then(function (address) {
      toggleSpinner('hide')
      if (address.length === 0) {
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
  if (!accessGranted) {
    alertError('Should request access first')
    return
  }
  toggleSpinner('show')
  cardano.get_utxos().then(utxosResponse => {
    toggleSpinner('hide')
    if (utxosResponse.length === 0) {
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
const SEND_TO_ADDRESS = 'addr_test1qruz25gry7r49y22qmd0xrqvzyp9ustxqdakzvyl5g3597yl25vgjqex8ktdxqw5qcawsh7skpal62uvveprkvr0v4aqfgte2f'

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
    CardanoWasm.BigNum.from_str('2000000')
  )

  // add a keyhash input - for ADA held in a Shelley-era normal address (Base, Enterprise, Pointer)
  const utxo = utxos[1]
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

mintNFT.addEventListener('click', () => {
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
    CardanoWasm.BigNum.from_str('2000000')
  )

  // add a keyhash input - for ADA held in a Shelley-era normal address (Base, Enterprise, Pointer)
  const utxo = utxos[1]

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

  const shelleyChangeAddress = CardanoWasm.Address.from_bytes(
    Buffer.from(changeAddress, 'hex')
  )

  // the script string has a short prefix to represent some CBOR properties
  // 82   array
  // 00   unsigned
  // 58 1C   28 bytes
  const scriptString = '8200581C' + Buffer.from(keyHash.to_bytes()).toString('hex')
  const policyScript = CardanoWasm.NativeScript.from_bytes(Buffer.from(scriptString, 'hex'))

  // the policy id is derived from the policy script through a blake2b-224 hash
  // this can be done programmatically, but I decided to do it manually through the cardano-cli to make sure there are no mistakes
  // I manually put the policy script into the cardano-cli and generated the policy id.
  const policyID = CardanoWasm.ScriptHash.from_bytes(Buffer.from("46aa846842567770593994c2509ab01a5c77440827c5e2702b370e18", 'hex'))

  const fee = CardanoWasm.BigNum.from_str('3000000')
  txBuilder.set_fee(fee)

  // since the fee has been set manually, the change cannot be calculated automatically
  // we will manually create a transaction output that gives utxo amount - fee
  // and also some amount of our test token
  const value = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount).checked_sub(fee))
  const testTokenAsset = CardanoWasm.Assets.new()
  testTokenAsset.insert(CardanoWasm.AssetName.new(Buffer.from("54657374546F6B656E", 'hex')), CardanoWasm.BigNum.from_str('1000000000'))
  const testTokenMultiAsset = CardanoWasm.MultiAsset.new()
  testTokenMultiAsset.insert(policyID, testTokenAsset)
  value.set_multiasset(testTokenMultiAsset)

  txBuilder.add_output(
    CardanoWasm.TransactionOutput.new(
      shelleyChangeAddress,
      value
    ),
  )

  const ttl = getTtl()
  txBuilder.set_ttl(ttl)


  // calculate the min fee required and send any change to an address
  // txBuilder.add_change_if_needed(shelleyChangeAddress)

  const txBody = txBuilder.build()

  const testToken = CardanoWasm.MintAssets.new()
  testToken.insert(CardanoWasm.AssetName.new(Buffer.from("54657374546F6B656E", 'hex')), CardanoWasm.Int.new(CardanoWasm.BigNum.from_str('1000000000')))
  const mint = CardanoWasm.Mint.new()
  mint.insert(policyID, testToken)

  txBody.set_mint(mint)

  const txHex = Buffer.from(txBody.to_bytes()).toString('hex')

  cardano.sign_tx(txHex, true).then(witnessSetHex => {
    toggleSpinner('hide')
    alertSuccess('Signing tx succeeds: ')
    const witnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(
      Buffer.from(witnessSetHex, 'hex')
    )
    // we then add the token's policy script to the transaction witness set
    const scripts = CardanoWasm.NativeScripts.new()
    scripts.add(policyScript)
    witnessSet.set_scripts(scripts)
    const transaction = CardanoWasm.Transaction.new(
      txBody,
      witnessSet,
      undefined,
    )
    transactionHex = Buffer.from(transaction.to_bytes()).toString('hex')
    console.log(transactionHex)
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
  window.addEventListener("ergo_wallet_disconnected", function (event) {
    console.log("Wallet Disconnect")
  });
}

function alertError(text) {
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

function toggleSpinner(status) {
  if (status === 'show') {
    spinner.className = 'spinner-border'
    alertEl.className = 'd-none'
  } else {
    spinner.className = 'd-none'
  }
}