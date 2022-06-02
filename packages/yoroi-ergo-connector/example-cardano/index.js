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
const signData = document.querySelector('#sign-data')
const alertEl = document.querySelector('#alert')
const spinner = document.querySelector('#spinner')

let accessGranted = false
let cardanoApi
let returnType = 'cbor'
let utxos
let usedAddresses
let unusedAddresses
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

function addressToCbor(address) {
  return bytesToHex(CardanoWasm.Address.from_bech32(address).to_bytes());
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
        unusedAddresses = addresses
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

function valueRequestObjectToWasmHex(requestObj) {
  const { amount, assets } = requestObj;
  const result = CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(String(amount)));
  if (assets != null) {
    if (typeof assets !== 'object') {
      throw 'Assets is expected to be an object like `{ [policyId]: { [assetName]: amount } }`';
    }
    const wmasset = CardanoWasm.MultiAsset.new();
    for (const [policyId, assets2] of Object.entries(assets)) {
      if (typeof assets2 !== 'object') {
        throw 'Assets is expected to be an object like `{ [policyId]: { [assetName]: amount } }`';
      }
      const wassets = CardanoWasm.Assets.new();
      for (const [assetName, amount] of Object.entries(assets2)) {
        wassets.insert(
          CardanoWasm.AssetName.new(hexToBytes(assetName)),
          CardanoWasm.BigNum.from_str(String(amount)),
        );
      }
      wmasset.insert(
        CardanoWasm.ScriptHash.from_bytes(hexToBytes(policyId)),
        wassets,
      );
    }
    result.set_multiasset(wmasset);
  }
  return bytesToHex(result.to_bytes());
}

window._getUtxos = function(value) {
  if(!accessGranted) {
    alertError('Should request access first')
    return
  }
  toggleSpinner('show')
  if (value != null && typeof value !== 'string') {
    value = valueRequestObjectToWasmHex(value);
  }
  cardanoApi.getUtxos(value).then(utxosResponse => {
    toggleSpinner('hide')
    if(utxosResponse.length === 0){
      alertWarrning('NO UTXOS')
    } else {
      utxos = isCBOR() ? mapCborUtxos(utxosResponse) : utxosResponse;
      alertSuccess(`<h2>UTxO (${utxos.length}):</h2><pre>` + JSON.stringify(utxos, undefined, 2) + '</pre>')
    }
  });
}

getUtxos.addEventListener('click', () => {
    window._getUtxos();
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

  const includeInputs = [];
  let targetAddress = randomUtxo.receiver;
  let targetDataHash = null;
  const includeTargets = [];
  let includeDefaultInputs = true;
  let includeDefaultTargets = true;
  let includeAssetTargets = true;

  const nativeScriptInputUtxoId = null;
  const plutusScriptInputUtxoId = null;
  const createPlutusTarget = false;

  if (includeDefaultInputs) {
    includeInputs.push(randomUtxo.utxo_id);
  }

  // noinspection PointlessBooleanExpressionJS
  if (nativeScriptInputUtxoId != null) {

    const nscripts = CardanoWasm.NativeScripts.new();
    nscripts.add(
      CardanoWasm.NativeScript.new_timelock_start(
        CardanoWasm.TimelockStart.new(1234)
      ),
    );
    nscripts.add(
      CardanoWasm.NativeScript.new_timelock_start(
        CardanoWasm.TimelockStart.new(1)
      ),
    );
    const nativeScript = CardanoWasm.NativeScript.new_script_all(
      CardanoWasm.ScriptAll.new(nscripts),
    );

    const scriptHash = nativeScript.hash();
    console.log(`[createTx] Native script hash: ${bytesToHex(scriptHash.to_bytes())}`);
    const nativeScriptAddress = CardanoWasm.EnterpriseAddress.new(
      0,
      CardanoWasm.StakeCredential.from_scripthash(scriptHash),
    ).to_address().to_bech32();
    console.log(`[createTx] Native script address: ${nativeScriptAddress}`);

    includeInputs.push({
      id: nativeScriptInputUtxoId,
      witness: {
        nativeScript: bytesToHex(nativeScript.to_bytes()),
      },
    });
  }

  // noinspection PointlessBooleanExpressionJS
  if (plutusScriptInputUtxoId != null || createPlutusTarget) {

    const plutusScript = CardanoWasm.PlutusScript
      .from_bytes(hexToBytes('590e6f590e6c0100003323332223322333222332232332233223232333222323332223233333333222222223233322232333322223232332232323332223232332233223232333332222233223322332233223322332222323232232232325335303233300a3333573466e1cd55cea8042400046664446660a40060040026eb4d5d0a8041bae35742a00e66a05046666ae68cdc39aab9d37540029000102b11931a982599ab9c04f04c04a049357426ae89401c8c98d4c124cd5ce0268250240239999ab9a3370ea0089001102b11999ab9a3370ea00a9000102c11931a982519ab9c04e04b0490480473333573466e1cd55cea8012400046601a64646464646464646464646666ae68cdc39aab9d500a480008cccccccccc06ccd40a48c8c8cccd5cd19b8735573aa0049000119810981c9aba15002302e357426ae8940088c98d4c164cd5ce02e82d02c02b89aab9e5001137540026ae854028cd40a40a8d5d0a804999aa8183ae502f35742a010666aa060eb940bcd5d0a80399a8148211aba15006335029335505304b75a6ae854014c8c8c8cccd5cd19b8735573aa0049000119a8119919191999ab9a3370e6aae7540092000233502b33504175a6ae854008c118d5d09aba25002232635305d3357380c20bc0b80b626aae7940044dd50009aba150023232323333573466e1cd55cea80124000466a05266a082eb4d5d0a80118231aba135744a004464c6a60ba66ae7018417817016c4d55cf280089baa001357426ae8940088c98d4c164cd5ce02e82d02c02b89aab9e5001137540026ae854010cd40a5d71aba15003335029335505375c40026ae854008c0e0d5d09aba2500223263530553357380b20ac0a80a626ae8940044d5d1280089aba25001135744a00226ae8940044d5d1280089aba25001135744a00226aae7940044dd50009aba150023232323333573466e1d4005200623020303a357426aae79400c8cccd5cd19b875002480108c07cc110d5d09aab9e500423333573466e1d400d20022301f302f357426aae7940148cccd5cd19b875004480008c088dd71aba135573ca00c464c6a60a066ae7015014413c13813413012c4d55cea80089baa001357426ae8940088c98d4c124cd5ce026825024023882489931a982419ab9c4910350543500049047135573ca00226ea80044d55ce9baa001135744a00226aae7940044dd50009109198008018011000911111111109199999999980080580500480400380300280200180110009109198008018011000891091980080180109000891091980080180109000891091980080180109000909111180200290911118018029091111801002909111180080290008919118011bac0013200135503c2233335573e0024a01c466a01a60086ae84008c00cd5d100101811919191999ab9a3370e6aae75400d200023330073232323333573466e1cd55cea8012400046601a605c6ae854008cd404c0a8d5d09aba25002232635303433573807006a06606426aae7940044dd50009aba150033335500b75ca0146ae854008cd403dd71aba135744a004464c6a606066ae700d00c40bc0b84d5d1280089aab9e5001137540024442466600200800600440024424660020060044002266aa002eb9d6889119118011bab00132001355036223233335573e0044a012466a01066aa05c600c6aae754008c014d55cf280118021aba200302b1357420022244004244244660020080062400224464646666ae68cdc3a800a400046a05e600a6ae84d55cf280191999ab9a3370ea00490011281791931a981399ab9c02b028026025024135573aa00226ea80048c8c8cccd5cd19b8735573aa004900011980318039aba15002375a6ae84d5d1280111931a981219ab9c028025023022135573ca00226ea80048848cc00400c00880048c8cccd5cd19b8735573aa002900011bae357426aae7940088c98d4c080cd5ce01201080f80f09baa00112232323333573466e1d400520042500723333573466e1d4009200223500a3006357426aae7940108cccd5cd19b87500348000940288c98d4c08ccd5ce01381201101081000f89aab9d50011375400224244460060082244400422444002240024646666ae68cdc3a800a4004400c46666ae68cdc3a80124000400c464c6a603666ae7007c0700680640604d55ce9baa0011220021220012001232323232323333573466e1d4005200c200b23333573466e1d4009200a200d23333573466e1d400d200823300b375c6ae854014dd69aba135744a00a46666ae68cdc3a8022400c46601a6eb8d5d0a8039bae357426ae89401c8cccd5cd19b875005480108cc048c050d5d0a8049bae357426ae8940248cccd5cd19b875006480088c050c054d5d09aab9e500b23333573466e1d401d2000230133016357426aae7940308c98d4c080cd5ce01201080f80f00e80e00d80d00c80c09aab9d5004135573ca00626aae7940084d55cf280089baa00121222222230070082212222222330060090082122222223005008122222220041222222200322122222223300200900822122222223300100900820012323232323333573466e1d400520022333008375a6ae854010dd69aba15003375a6ae84d5d1280191999ab9a3370ea00490001180518059aba135573ca00c464c6a602266ae7005404804003c0384d55cea80189aba25001135573ca00226ea80048488c00800c888488ccc00401401000c80048c8c8cccd5cd19b875001480088c018dd71aba135573ca00646666ae68cdc3a80124000460106eb8d5d09aab9e5004232635300b33573801e01801401201026aae7540044dd5000909118010019091180080190008891119191999ab9a3370e6aae75400920002335500b300635742a004600a6ae84d5d1280111931a980419ab9c00c009007006135573ca00226ea800526120012001112212330010030021120014910350543100222123330010040030022001121223002003112200112001120012001122002122001200111232300100122330033002002001332323233322233322233223332223322332233322233223322332233223233322232323322323232323333222232332232323222323222325335301a5335301a333573466e1cc8cccd54c05048004c8cd406488ccd406400c004008d4058004cd4060888c00cc008004800488cdc0000a40040029000199aa98068900091299a980e299a9a81a1a98169a98131a9812001110009110019119a98188011281c11a81c8009080f880e899a8148010008800a8141a981028009111111111005240040380362038266ae712413c53686f756c642062652065786163746c79206f6e652073637269707420696e70757420746f2061766f696420646f75626c65207361742069737375650001b15335303500315335301a5335301a333573466e20ccc064ccd54c03448005402540a0cc020d4c0c00188880094004074074cdc09a9818003111001a80200d80e080e099ab9c49010f73656c6c6572206e6f7420706169640001b15335301a333573466e20ccc064cc88ccd54c03c48005402d40a8cc028004009400401c074075401006c07040704cd5ce24810d66656573206e6f7420706169640001b101b15335301a3322353022002222222222253353503e33355301f1200133502322533535040002210031001503f253353027333573466e3c0300040a40a04d41040045410000c840a4409d4004d4c0c001888800840704cd5ce2491c4f6e6c792073656c6c65722063616e2063616e63656c206f666665720001b101b135301d00122002153353016333573466e2540040d406005c40d4540044cdc199b8235302b001222003480c920d00f2235301a0012222222222333553011120012235302a002222353034003223353038002253353026333573466e3c0500040a009c4cd40cc01401c401c801d40b0024488cd54c02c480048d4d5408c00488cd54098008cd54c038480048d4d5409800488cd540a4008ccd4d540340048cc0e12000001223303900200123303800148000004cd54c02c480048d4d5408c00488cd54098008ccd4d540280048cd54c03c480048d4d5409c00488cd540a8008d5404400400488ccd5540200580080048cd54c03c480048d4d5409c00488cd540a8008d5403c004004ccd55400c044008004444888ccd54c018480054080cd54c02c480048d4d5408c00488cd54098008d54034004ccd54c0184800488d4d54090008894cd4c05cccd54c04048004c8cd405488ccd4d402c00c88008008004d4d402400488004cd4024894cd4c064008406c40040608d4d5409c00488cc028008014018400c4cd409001000d4084004cd54c02c480048d4d5408c00488c8cd5409c00cc004014c8004d540d8894cd4d40900044d5403400c884d4d540a4008894cd4c070cc0300080204cd5404801c0044c01800c00848848cc00400c00848004c8004d540b488448894cd4d40780044008884cc014008ccd54c01c480040140100044484888c00c01044884888cc0080140104484888c004010448004c8004d540a08844894cd4d406000454068884cd406cc010008cd54c01848004010004c8004d5409c88448894cd4d40600044d401800c884ccd4024014c010008ccd54c01c4800401401000448d4d400c0048800448d4d40080048800848848cc00400c0084800488ccd5cd19b8f002001006005222323230010053200135502522335350130014800088d4d54060008894cd4c02cccd5cd19b8f00200900d00c13007001130060033200135502422335350120014800088d4d5405c008894cd4c028ccd5cd19b8f00200700c00b10011300600312200212200120014881002212330010030022001222222222212333333333300100b00a009008007006005004003002200122123300100300220012221233300100400300220011122002122122330010040031200111221233001003002112001221233001003002200121223002003212230010032001222123330010040030022001121223002003112200112001122002122001200122337000040029040497a0088919180080091198019801001000a4411c63184b9174548c865a3fa42995c791ab6c1d52550f604f1c5a5f78240001'));

    const plutusScriptHash = plutusScript.hash();
    console.log(`[createTx] Plutus script hash: ${bytesToHex(plutusScriptHash.to_bytes())}`);
    const plutusScriptAddress = CardanoWasm.EnterpriseAddress.new(
      0,
      CardanoWasm.StakeCredential.from_scripthash(plutusScriptHash),
    ).to_address().to_bech32();
    console.log(`[createTx] Plutus script address: ${plutusScriptAddress}`);

    const datum = CardanoWasm.PlutusData.from_bytes(hexToBytes('d8799f1a03f26fe0581c07e9b69563f3772fdc1f3dfe71d8c3a346657934200962244607c370d87a80ff'));
    const datumHash = bytesToHex(CardanoWasm.hash_plutus_data(datum).to_bytes());
    console.log(`[createTx] Plutus datum hash: ${datumHash}`);

    if (createPlutusTarget) {
      targetAddress = plutusScriptAddress;
      targetDataHash = datumHash;
    }

    // noinspection PointlessBooleanExpressionJS
    if (plutusScriptInputUtxoId != null) {
      const redeemer = CardanoWasm.Redeemer.from_bytes(hexToBytes('840000d879808219abe01a00c7706f'));

      includeInputs.push({
        id: plutusScriptInputUtxoId,
        witness: {
          plutusScript: bytesToHex(plutusScript.to_bytes()),
          datum: bytesToHex(datum.to_bytes()),
          redeemer: bytesToHex(redeemer.to_bytes()),
        },
      });
    }
  }

  if (includeDefaultTargets) {
    includeTargets.push([
      {
        address: targetAddress,
        value: '2000000',
        dataHash: targetDataHash,
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
      },
    ])
  }

  const txReq = {
    // validityIntervalStart: 2000,
    includeInputs,
    // includeOutputs: [outputHex],
    includeTargets,
  }

  if (includeAssetTargets) {
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

signData.addEventListener('click', () => {
  toggleSpinner('show');

  if (!accessGranted) {
    alertError('Should request access first');
    return;
  }

  let address;
  if (usedAddresses && usedAddresses.length > 0) {
    address = usedAddresses[0];
  } else if (unusedAddresses && unusedAddresses.length > 0) {
    address = unusedAddresses[0];
  } else {
    alertError('Should request used or unused addresses first');
    return;
  }

  if (isCBOR()) {
    address = addressToCbor(address);
  }

  const payload = document.querySelector('#sign-data-payload').value;
  let payloadHex;
  if (payload.startsWith('0x')) {
    payloadHex = Buffer.from(payload.replace('^0x', ''), 'hex').toString('hex');
  } else {
    payloadHex = Buffer.from(payload, 'utf8').toString('hex');
  }

  console.log('[signData][address] ', address);
  cardanoApi.signData(address, payloadHex).then(sig => {
    alertSuccess('Signature:' + JSON.stringify(sig))
  }).catch(error => {
    console.error(error);
    alertError(error.info);
  }).then(() => {
    toggleSpinner('hide');
  });
});

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
