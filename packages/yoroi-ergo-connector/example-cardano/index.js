import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser"
import { textPartFromWalletChecksumImagePart } from "@emurgo/cip4-js"
import { createIcon } from "@download/blockies"
import { getTtl } from './utils'
import { Bech32Prefix } from '../../yoroi-extension/app/config/stringConfig';
import { bytesToHex, hexToBytes } from './coreUtils';

const cardanoAccessBtnRow = document.querySelector('#request-button-row')
const cardanoAuthCheck = document.querySelector('#check-identification')
const cardanoAccessBtn = document.querySelector('#request-access')
const connectionStatus = document.querySelector('#connection-status')
const walletPlateSpan = document.querySelector('#wallet-plate')
const walletIconSpan = document.querySelector('#wallet-icon')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getRewardAddresses = document.querySelector('#get-reward-addresses')
const getAccountBalance = document.querySelector('#get-balance')
const isEnabledBtn = document.querySelector('#is-enabled')
const getUtxos = document.querySelector('#get-utxos')
const submitTx = document.querySelector('#submit-tx')
const signTx = document.querySelector('#sign-tx')
const createTx = document.querySelector('#create-tx')
const getCollateralUtxos = document.querySelector('#get-collateral-utxos')
const alertEl = document.querySelector('#alert')
const spinner = document.querySelector('#spinner')

let accessGranted = false
let cardanoApi
let returnType = 'cbor'
let utxos
let usedAddresses
let changeAddress
let unsignedTransactionHex
let transactionHex

function isCBOR() {
  return returnType === 'cbor';
}

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
];

function createBlockiesIcon(seed) {
  const colorIdx = hexToBytes(seed)[0] % COLORS.length;
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

  api.experimental.setReturnType(returnType);

  const auth = api.experimental.auth && api.experimental.auth();
  const authEnabled = auth && auth.isEnabled();

  if (authEnabled) {
    const walletId = auth.getWalletId();
    const pubkey = auth.getWalletPubkey();
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
  window.cardanoApi = cardanoApi = api;

  api.experimental.onDisconnect(() => {
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
    const messageHex = bytesToHex(messageJson);
    console.log('Signing randomized message: ', JSON.stringify({
      messageJson,
      messageHex,
    }))
    const start = performance.now();
    auth.signHexPayload(messageHex).then(sig => {
      const elapsed = performance.now() - start;
      console.log(`Signature created in ${elapsed} ms`);
      console.log('Signature received: ', sig);
      console.log('Verifying signature against the message');
      auth.checkHexPayload(messageHex, sig).then(r => {
        console.log('Signature matches message: ', r);
      }, e => {
        console.error('Sig check failed', e);
      });
    }, err => {
      console.error('Sig failed', err);
    });
  }
}

function reduceWasmMultiasset(multiasset, reducer, initValue) {
  let result = initValue;
  if (multiasset) {
    const policyIds = multiasset.keys();
    for (let i = 0; i < policyIds.len(); i++) {
      const policyId = policyIds.get(i);
      const assets = multiasset.get(policyId);
      const assetNames = assets.keys();
      for (let j = 0; j < assetNames.len(); j++) {
        const name = assetNames.get(j);
        const amount = assets.get(name);
        const policyIdHex = bytesToHex(policyId.to_bytes());
        const encodedName = bytesToHex(name.name());
        result = reducer(result, {
          policyId: policyIdHex,
          name: encodedName,
          amount: amount.to_str(),
          assetId: `${policyIdHex}.${encodedName}`,
        });
      }
    }
  }
  return result;
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

isEnabledBtn.addEventListener('click', () => {
  window.cardano.yoroi.isEnabled().then(function(isEnabled) {
    alertSuccess(`Is Yoroi connection enabled: ${isEnabled}`);
  });
});

getAccountBalance.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
    } else {
      toggleSpinner('show')
      const tokenId = '*';
      cardanoApi.getBalance(tokenId).then(function(balance) {
        console.log('[getBalance]', balance);
        toggleSpinner('hide')
        let balanceJson = balance;
        if (isCBOR()) {
          if (tokenId !== '*') {
            alertSuccess(`Asset Balance: ${balance} (asset: ${tokenId})`)
            return;
          }
          const value = CardanoWasm.Value.from_bytes(hexToBytes(balance));
          balanceJson = { default: value.coin().to_str() };
          balanceJson.assets = reduceWasmMultiasset(value.multiasset(), (res, asset) => {
            res[asset.assetId] = asset.amount;
            return res;
          }, {});
        }
        alertSuccess(`Account Balance: ${JSON.stringify(balanceJson, null, 2)}`)
      });
    }
})

function addressesFromCborIfNeeded(addresses) {
  return isCBOR() ? addresses.map(a =>
    CardanoWasm.Address.from_bytes(hexToBytes(a)).to_bech32()) : addresses;
}

getUnUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
      toggleSpinner('show')
      cardanoApi.getUnusedAddresses().then(function(addresses) {
        toggleSpinner('hide')
        if (addresses.length === 0) {
          alertWarrning('No unused addresses')
          return;
        }
        addresses = addressesFromCborIfNeeded(addresses)
        alertSuccess(`Address: `)
        alertEl.innerHTML = '<h2>Unused addresses:</h2><pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
      });
    }
})

getUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
      toggleSpinner('show')
      cardanoApi.getUsedAddresses({ page: 0, limit: 5 }).then(function(addresses) {
        toggleSpinner('hide')
        if (addresses.length === 0) {
          alertWarrning('No used addresses')
          return;
        }
        usedAddresses = addressesFromCborIfNeeded(addresses)
        alertSuccess(`Address: ${usedAddresses.concat(',')}`)
        alertEl.innerHTML = '<h2>Used addresses:</h2><pre>' + JSON.stringify(usedAddresses, undefined, 2) + '</pre>'
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
        if (address.length === 0) {
          alertWarrning('No change addresses')
          return;
        }
        changeAddress = addressesFromCborIfNeeded([address])[0]
        alertSuccess(`Address: `)
        alertEl.innerHTML = '<h2>Change address:</h2><pre>' + JSON.stringify(address, undefined, 2) + '</pre>'
      });
    }
})

getRewardAddresses.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
    } else {
      toggleSpinner('show')
      cardanoApi.getRewardAddresses().then(function(addresses) {
        toggleSpinner('hide')
        if (addresses.length === 0) {
          alertWarrning('No change addresses')
          return;
        }
        addresses = addressesFromCborIfNeeded(addresses)
        alertSuccess(`Address: ${addresses.concat(',')}`)
        alertEl.innerHTML = '<h2>Reward addresses:</h2><pre>' + JSON.stringify(addresses, undefined, 2) + '</pre>'
      });
    }
})

function mapCborUtxos(cborUtxos) {
  return cborUtxos.map(hex => {
    const u = CardanoWasm.TransactionUnspentOutput.from_bytes(hexToBytes(hex))
    const input = u.input();
    const output = u.output();
    const txHash = bytesToHex(input.transaction_id().to_bytes());
    const txIndex = input.index();
    const value = output.amount();
    return {
      utxo_id: `${txHash}${txIndex}`,
      tx_hash: txHash,
      tx_index: txIndex,
      receiver: output.address().to_bech32(),
      amount: value.coin().to_str(),
      assets: reduceWasmMultiasset(value.multiasset(), (res, asset) => {
        res.push(asset);
        return res;
      }, []),
    }
  });
}

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
        utxos = isCBOR() ? mapCborUtxos(utxosResponse) : utxosResponse;
        alertSuccess(`<h2>UTxO (${utxos.length}):</h2><pre>` + JSON.stringify(utxos, undefined, 2) + '</pre>')
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
    alertWarrning(`Transaction submission failed: ${JSON.stringify(error)}`)
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

  if (!unsignedTransactionHex) {

    if (!utxos) {
      alertError('Should request utxos first');
      return
    }

    if (!changeAddress) {
      alertError('Should request change address first')
    }

    const txBuilder = CardanoWasm.TransactionBuilder.new(
      CardanoWasm.TransactionBuilderConfigBuilder.new()
        // all of these are taken from the mainnet genesis settings
        // linear fee parameters (a*size + b)
        .fee_algo(
          CardanoWasm.LinearFee.new(
            CardanoWasm.BigNum.from_str('44'),
            CardanoWasm.BigNum.from_str('155381'),
          )
        )
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str('34482'))
        .pool_deposit(CardanoWasm.BigNum.from_str('500000000'))
        .key_deposit(CardanoWasm.BigNum.from_str('2000000'))
        .max_value_size(5000)
        .max_tx_size(16384)
        .build()
    )

    // add a keyhash input - for ADA held in a Shelley-era normal address (Base, Enterprise, Pointer)
    const utxo = utxos[0]

    const addr = CardanoWasm.Address.from_bech32(utxo.receiver);

    const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
    const keyHash = baseAddr.payment_cred().to_keyhash();
    txBuilder.add_key_input(
      keyHash,
      CardanoWasm.TransactionInput.new(
        CardanoWasm.TransactionHash.from_bytes(
          hexToBytes(utxo.tx_hash)
        ), // tx hash
        utxo.tx_index, // index
      ),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount))
    )

    const shelleyOutputAddress = CardanoWasm.Address.from_bech32(SEND_TO_ADDRESS)
    const shelleyChangeAddress = CardanoWasm.Address.from_bech32(changeAddress)

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

    unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes());
  }

  // Experimental feature, false by default, in which case only the witness set is returned.
  const returnTx = true;

  cardanoApi.signTx({
    tx: unsignedTransactionHex,
    returnTx,
  }).then(responseHex => {
    toggleSpinner('hide')
    console.log(`[signTx] response: ${responseHex}`);

    if (returnTx) {

      const signedTx = CardanoWasm.Transaction.from_bytes(hexToBytes(responseHex));
      const wit = signedTx.witness_set();

      const wkeys = wit.vkeys();
      for (let i = 0; i < wkeys.len(); i++) {
        const wk = wkeys.get(i);
        const vk = wk.vkey();
        console.log(`[signTx] wit vkey ${i}:`, {
          vkBytes: bytesToHex(vk.to_bytes()),
          vkPubBech: vk.public_key().to_bech32(),
          vkPubHashBech: vk.public_key().hash().to_bech32(Bech32Prefix.PAYMENT_KEY_HASH),
        })
      }

      transactionHex = responseHex;
    } else {
      const witnessSet = CardanoWasm.TransactionWitnessSet.from_bytes(
        hexToBytes(responseHex)
      );
      const tx = CardanoWasm.Transaction.from_bytes(
        hexToBytes(unsignedTransactionHex)
      );
      const transaction = CardanoWasm.Transaction.new(
        tx.body(),
        witnessSet,
        tx.auxiliary_data(),
      );
      transactionHex = bytesToHex(transaction.to_bytes())
    }

    unsignedTransactionHex = null;
    alertSuccess('Signing tx succeeded: ' + transactionHex)

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

  if (!utxos || utxos.length === 0) {
    alertError('Should request utxos first');
    return
  }

  if (!usedAddresses || usedAddresses.length === 0) {
    alertError('Should request used addresses first');
    return
  }

  const randomUtxo = utxos[Math.floor(Math.random() * utxos.length)];
  if (!randomUtxo) {
    alertError('Failed to select a random utxo from the available list!');
    return;
  }

  console.log('[createTx] Including random utxo input: ', randomUtxo);

  const usedAddress = usedAddresses[0];
  const keyHash = CardanoWasm.BaseAddress.from_address(
    CardanoWasm.Address.from_bech32(usedAddress),
  ).payment_cred().to_keyhash();

  const keyHashBech = keyHash.to_bech32(Bech32Prefix.PAYMENT_KEY_HASH);

  const scripts = CardanoWasm.NativeScripts.new();
  scripts.add(CardanoWasm.NativeScript.new_script_pubkey(
    CardanoWasm.ScriptPubkey.new(keyHash),
  ));
  scripts.add(CardanoWasm.NativeScript.new_timelock_start(
    CardanoWasm.TimelockStart.new(42),
  ));

  const mintScript = CardanoWasm.NativeScript.new_script_all(
    CardanoWasm.ScriptAll.new(scripts),
  );
  const mintScriptHex = bytesToHex(mintScript.to_bytes());

  function convertAssetNameToHEX(name) {
    return bytesToHex(name);
  }

  const tokenAssetName = 'V42';
  const nftAssetName = `V42/NFT#${Math.floor(Math.random() * 1000000000)}`;
  const tokenAssetNameHex = convertAssetNameToHEX(tokenAssetName);
  const nftAssetNameHex = convertAssetNameToHEX(nftAssetName);

  const expectedPolicyId = bytesToHex(mintScript.hash().to_bytes());

  console.log('[createTx] Including mint request: ', { keyHashBech, mintScriptHex, assetNameHex: tokenAssetNameHex, expectedPolicyId });

  const outputHex = bytesToHex(
    CardanoWasm.TransactionOutput.new(
      CardanoWasm.Address.from_bech32(randomUtxo.receiver),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str('1000000')),
    ).to_bytes()
  );

  const txReq = {
    validityIntervalStart: 42,
    includeInputs: [randomUtxo.utxo_id],
    includeOutputs: [outputHex],
    includeTargets: [
      {
        address: randomUtxo.receiver,
        value: '2000000',
        mintRequest: [{
          script: mintScriptHex,
          assetName: tokenAssetNameHex,
          amount: '42',
        }, {
          script: mintScriptHex,
          storeScriptOnChain: true,
          assetName: nftAssetNameHex,
          metadata: {
            tag: 721,
            json: JSON.stringify({
              name: nftAssetName,
              description: `V42 NFT Collection`,
              mediaType: 'image/png',
              image: 'ipfs://QmRhTTbUrPYEw3mJGGhQqQST9k86v1DPBiTTWJGKDJsVFw',
              files: [{
                name: nftAssetName,
                mediaType: 'image/png',
                src: 'ipfs://QmRhTTbUrPYEw3mJGGhQqQST9k86v1DPBiTTWJGKDJsVFw',
              }]
            }),
          }
        }]
      }
    ]
  }

  const utxosWithAssets = utxos.filter(u => u.assets.length > 0);
  const utxoWithAssets = utxosWithAssets[Math.floor(Math.random() * utxosWithAssets.length)];

  if (utxoWithAssets) {
    const asset = utxoWithAssets.assets[0];
    console.log('[createTx] Including asset:', asset);
    txReq.includeTargets.push({
      // do not specify value, the connector will use minimum value
      address: randomUtxo.receiver,
      assets: {
        [asset.assetId]: '1',
      },
      ensureRequiredMinimalValue: true,
    })
  }
  
  cardanoApi.experimental.createTx(txReq, true).then(txHex => {
    toggleSpinner('hide')
    alertSuccess('Creating tx succeeds: ' + txHex)
    unsignedTransactionHex = txHex
  }).catch(error => {
    console.error(error)
    toggleSpinner('hide')
    alertWarrning('Creating tx fails')
  })
})

getCollateralUtxos.addEventListener('click', () => {
  toggleSpinner('show');
  
  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }
  const amount = '4900000';
  cardanoApi.getCollateralUtxos(
    Buffer.from(
      CardanoWasm.Value.new(
        CardanoWasm.BigNum.from_str(amount)
      ).to_bytes()
    ).toString('hex')
  ).then(utxosResponse => {
    toggleSpinner('hide')
    let utxos = isCBOR() ? mapCborUtxos(utxosResponse) : utxosResponse;
    alertSuccess(`<h2>Collateral UTxO (${utxos.length}):</h2><pre>` + JSON.stringify(utxos, undefined, 2) + '</pre>')
  }).catch(error => {
    console.error(error)
    toggleSpinner('hide')
    alertWarrning(`Getting collateral UTXOs tx fails: ${JSON.stringify(error)}`)
  })
})

function alertError (text) {
    toggleSpinner('hide');
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
