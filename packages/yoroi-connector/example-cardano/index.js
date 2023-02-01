import * as CardanoWasm from "@emurgo/cardano-serialization-lib-browser";
import { textPartFromWalletChecksumImagePart } from "@emurgo/cip4-js";
import { createIcon } from "@download/blockies";
import { getTtl } from "./utils";
import { Bech32Prefix } from "../../yoroi-extension/app/config/stringConfig";
import { bytesToHex, hexToBytes } from "./coreUtils";

const get = (selector) => document.querySelector(selector);
const getAll = (selector) => document.querySelectorAll(selector);

const cardanoAccessBtnRow = get("#request-button-row");
const cardanoAuthCheck = get("#check-identification");
const cardanoAccessBtn = get("#request-access");
const connectionStatus = get("#connection-status");
const walletPlateSpan = get("#wallet-plate");
const walletIconSpan = get("#wallet-icon");
const getUnUsedAddresses = get("#get-unused-addresses");
const getUsedAddresses = get("#get-used-addresses");
const getChangeAddress = get("#get-change-address");
const getRewardAddresses = get("#get-reward-addresses");
const getAccountBalance = get("#get-balance");
const isEnabledBtn = get("#is-enabled");
const getUtxos = get("#get-utxos");
const submitTx = get("#submit-tx");
const signTx = get("#sign-tx");
const showUtxos = get("#show-utxos");
const getCollateralUtxos = get("#get-collateral-utxos");
const signData = get("#sign-data");
const alertEl = get("#alert");
const spinner = get("#spinner");
const utxosContainer = get("#utxos");
const getNFTs = get("#nfts");
const getNetworkId = get("#get-network-id");

let accessGranted = false;
let cardanoApi;
let returnType = "cbor";
let utxos;
let selectedUtxoIdx = 0;
let usedAddresses;
let unusedAddresses;
let changeAddress;
let unsignedTransactionHex;
let transactionHex;

function isCBOR() {
  return returnType === "cbor";
}

const mkcolor = (primary, secondary, spots) => ({ primary, secondary, spots });
const COLORS = [
  mkcolor("#E1F2FF", "#17D1AA", "#A80B32"),
  mkcolor("#E1F2FF", "#FA5380", "#0833B2"),
  mkcolor("#E1F2FF", "#F06EF5", "#0804F7"),
  mkcolor("#E1F2FF", "#EBB687", "#852D62"),
  mkcolor("#E1F2FF", "#F59F9A", "#085F48"),
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
  });
}

toggleSpinner("show");

function onApiConnectied(api) {
  toggleSpinner("hide");
  let walletDisplay = "an anonymous Yoroi Wallet";

  api.experimental.setReturnType(returnType);

  const auth = api.experimental.auth && api.experimental.auth();
  const authEnabled = auth && auth.isEnabled();

  if (authEnabled) {
    const walletId = auth.getWalletId();
    const pubkey = auth.getWalletPubkey();
    console.log(
      "Auth acquired successfully: ",
      JSON.stringify({ walletId, pubkey })
    );
    const walletPlate = textPartFromWalletChecksumImagePart(walletId);
    walletDisplay = `Yoroi Wallet ${walletPlate}`;
    walletIconSpan.appendChild(createBlockiesIcon(walletId));
  }

  alertSuccess(`You have access to ${walletDisplay} now`);
  walletPlateSpan.innerHTML = walletDisplay;
  toggleConnectionUI("status");
  accessGranted = true;
  window.cardanoApi = cardanoApi = api;

  api.experimental.onDisconnect(() => {
    alertWarning(`Disconnected from ${walletDisplay}`);
    toggleConnectionUI("button");
    walletPlateSpan.innerHTML = "";
    walletIconSpan.innerHTML = "";
  });

  if (authEnabled) {
    console.log("Testing auth signatures");
    const messageJson = JSON.stringify({
      type: "this is a random test message object",
      rndValue: Math.random(),
    });
    const messageHex = bytesToHex(messageJson);
    console.log(
      "Signing randomized message: ",
      JSON.stringify({
        messageJson,
        messageHex,
      })
    );
    const start = performance.now();
    auth.signHexPayload(messageHex).then(
      (sig) => {
        const elapsed = performance.now() - start;
        console.log(`Signature created in ${elapsed} ms`);
        console.log("Signature received: ", sig);
        console.log("Verifying signature against the message");
        auth.checkHexPayload(messageHex, sig).then(
          (r) => {
            console.log("Signature matches message: ", r);
          },
          (e) => {
            console.error("Sig check failed", e);
          }
        );
      },
      (err) => {
        console.error("Sig failed", err);
      }
    );
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

cardanoAccessBtn.addEventListener("click", () => {
  toggleSpinner("show");
  const requestIdentification = cardanoAuthCheck.checked;
  cardano.yoroi.enable({ requestIdentification }).then(
    function (api) {
      onApiConnectied(api);
    },
    function (err) {
      toggleSpinner("hide");
      alertError(`Error: ${err}`);
    }
  );
});

isEnabledBtn.addEventListener("click", () => {
  window.cardano.yoroi.isEnabled().then(function (isEnabled) {
    alertSuccess(`Is Yoroi connection enabled: ${isEnabled}`);
  });
});

getNetworkId.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    cardanoApi.getNetworkId().then((networkId) => {
      console.log("[getNetworkId]", networkId);
      toggleSpinner("hide");
    });
  }
});

getAccountBalance.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    const tokenId = "*";
    cardanoApi.getBalance(tokenId).then(function (balance) {
      console.log("[getBalance]", balance);
      toggleSpinner("hide");
      let balanceJson = balance;
      if (isCBOR()) {
        if (tokenId !== "*") {
          alertSuccess(`Asset Balance: ${balance} (asset: ${tokenId})`);
          return;
        }
        const value = CardanoWasm.Value.from_bytes(hexToBytes(balance));
        balanceJson = { default: value.coin().to_str() };
        balanceJson.assets = reduceWasmMultiasset(
          value.multiasset(),
          (res, asset) => {
            res[asset.assetId] = asset.amount;
            return res;
          },
          {}
        );
      }
      alertSuccess(
        `Account Balance: <pre>${JSON.stringify(balanceJson, null, 2)}</pre>`
      );
    });
  }
});

function addressesFromCborIfNeeded(addresses) {
  return isCBOR()
    ? addresses.map((a) =>
        CardanoWasm.Address.from_bytes(hexToBytes(a)).to_bech32()
      )
    : addresses;
}

function addressToCbor(address) {
  return bytesToHex(CardanoWasm.Address.from_bech32(address).to_bytes());
}

getUnUsedAddresses.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    cardanoApi.getUnusedAddresses().then(function (addresses) {
      toggleSpinner("hide");
      if (addresses.length === 0) {
        alertWarning("No unused addresses");
        return;
      }
      addresses = addressesFromCborIfNeeded(addresses);
      unusedAddresses = addresses;
      alertSuccess(`Address: `);
      alertEl.innerHTML =
        "<h2>Unused addresses:</h2><pre>" +
        JSON.stringify(addresses, undefined, 2) +
        "</pre>";
    });
  }
});

getUsedAddresses.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    cardanoApi
      .getUsedAddresses({ page: 0, limit: 5 })
      .then(function (addresses) {
        toggleSpinner("hide");
        if (addresses.length === 0) {
          alertWarning("No used addresses");
          return;
        }
        usedAddresses = addressesFromCborIfNeeded(addresses);
        alertSuccess(`Address: ${usedAddresses.concat(",")}`);
        alertEl.innerHTML =
          "<h2>Used addresses:</h2><pre>" +
          JSON.stringify(usedAddresses, undefined, 2) +
          "</pre>";
      });
  }
});

getChangeAddress.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    cardanoApi.getChangeAddress().then(function (address) {
      toggleSpinner("hide");
      if (address.length === 0) {
        alertWarning("No change addresses");
        return;
      }
      changeAddress = addressesFromCborIfNeeded([address])[0];
      alertSuccess(`Address: `);
      alertEl.innerHTML =
        "<h2>Change address:</h2><pre>" +
        JSON.stringify(address, undefined, 2) +
        "</pre>";
    });
  }
});

getRewardAddresses.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
  } else {
    toggleSpinner("show");
    cardanoApi.getRewardAddresses().then(function (addresses) {
      toggleSpinner("hide");
      if (addresses.length === 0) {
        alertWarning("No change addresses");
        return;
      }
      addresses = addressesFromCborIfNeeded(addresses);
      alertSuccess(`Address: ${addresses.concat(",")}`);
      alertEl.innerHTML =
        "<h2>Reward addresses:</h2><pre>" +
        JSON.stringify(addresses, undefined, 2) +
        "</pre>";
    });
  }
});

function mapCborUtxos(cborUtxos) {
  return cborUtxos.map((hex) => {
    const u = CardanoWasm.TransactionUnspentOutput.from_bytes(hexToBytes(hex));
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
      assets: reduceWasmMultiasset(
        value.multiasset(),
        (res, asset) => {
          res.push(asset);
          return res;
        },
        []
      ),
    };
  });
}

function valueRequestObjectToWasmHex(requestObj) {
  const { amount, assets } = requestObj;
  const result = CardanoWasm.Value.new(
    CardanoWasm.BigNum.from_str(String(amount))
  );
  if (assets != null) {
    if (typeof assets !== "object") {
      throw "Assets is expected to be an object like `{ [policyId]: { [assetName]: amount } }`";
    }
    const wmasset = CardanoWasm.MultiAsset.new();
    for (const [policyId, assets2] of Object.entries(assets)) {
      if (typeof assets2 !== "object") {
        throw "Assets is expected to be an object like `{ [policyId]: { [assetName]: amount } }`";
      }
      const wassets = CardanoWasm.Assets.new();
      for (const [assetName, amount] of Object.entries(assets2)) {
        wassets.insert(
          CardanoWasm.AssetName.new(hexToBytes(assetName)),
          CardanoWasm.BigNum.from_str(String(amount))
        );
      }
      wmasset.insert(
        CardanoWasm.ScriptHash.from_bytes(hexToBytes(policyId)),
        wassets
      );
    }
    result.set_multiasset(wmasset);
  }
  return bytesToHex(result.to_bytes());
}

window._getUtxos = function (value) {
  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }
  toggleSpinner("show");
  if (value != null && typeof value !== "string") {
    value = valueRequestObjectToWasmHex(value);
  }
  cardanoApi.getUtxos(value).then(utxosResponse => {
    toggleSpinner('hide');
    if (utxosResponse == null || utxosResponse.length === 0) {
      alertWarrning('NO UTXOS');
    } else {
      utxos = isCBOR() ? mapCborUtxos(utxosResponse) : utxosResponse;
      alertSuccess(
        `<h2>UTxO (${utxos.length}):</h2><pre>` +
          JSON.stringify(utxos, undefined, 2) +
          "</pre>"
      );
    }
  });
};

getUtxos.addEventListener("click", () => {
  window._getUtxos();
});

submitTx.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }
  if (!transactionHex) {
    alertError("Should sign tx first");
    return;
  }

  toggleSpinner("show");
  cardanoApi
    .submitTx(transactionHex)
    .then((txId) => {
      toggleSpinner("hide");
      alertSuccess(`Transaction ${txId} submitted`);
    })
    .catch((error) => {
      toggleSpinner("hide");
      alertWarning(`Transaction submission failed: ${JSON.stringify(error)}`);
    });
});

const AMOUNT_TO_SEND = "1000000";
const SEND_TO_ADDRESS =
  "addr_test1qz8xh9w6f2vdnp89xzqlxnusldhz6kdm4rp970gl8swwjjkr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0q4lztj0";

signTx.addEventListener("click", () => {
  toggleSpinner("show");

  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  if (!unsignedTransactionHex) {
    if (!utxos) {
      alertError("Should request utxos first");
      return;
    }

    if (!changeAddress) {
      alertError("Should request change address first");
    }

    const txBuilder = CardanoWasm.TransactionBuilder.new(
      CardanoWasm.TransactionBuilderConfigBuilder.new()
        // all of these are taken from the mainnet genesis settings
        // linear fee parameters (a*size + b)
        .fee_algo(
          CardanoWasm.LinearFee.new(
            CardanoWasm.BigNum.from_str("44"),
            CardanoWasm.BigNum.from_str("155381")
          )
        )
        .coins_per_utxo_word(CardanoWasm.BigNum.from_str("34482"))
        .pool_deposit(CardanoWasm.BigNum.from_str("500000000"))
        .key_deposit(CardanoWasm.BigNum.from_str("2000000"))
        .max_value_size(5000)
        .max_tx_size(16384)
        .build()
    );

    // add a keyhash input - for ADA held in a Shelley-era normal address (Base, Enterprise, Pointer)
    const utxo = utxos[0];

    const addr = CardanoWasm.Address.from_bech32(utxo.receiver);

    const baseAddr = CardanoWasm.BaseAddress.from_address(addr);
    const keyHash = baseAddr.payment_cred().to_keyhash();
    txBuilder.add_key_input(
      keyHash,
      CardanoWasm.TransactionInput.new(
        CardanoWasm.TransactionHash.from_bytes(hexToBytes(utxo.tx_hash)), // tx hash
        utxo.tx_index // index
      ),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(utxo.amount))
    );

    const shelleyOutputAddress =
      CardanoWasm.Address.from_bech32(SEND_TO_ADDRESS);
    const shelleyChangeAddress = CardanoWasm.Address.from_bech32(changeAddress);

    // add output to the tx
    txBuilder.add_output(
      CardanoWasm.TransactionOutput.new(
        shelleyOutputAddress,
        CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(AMOUNT_TO_SEND))
      )
    );

    const ttl = getTtl();
    txBuilder.set_ttl(ttl);

    // calculate the min fee required and send any change to an address
    txBuilder.add_change_if_needed(shelleyChangeAddress);

    unsignedTransactionHex = bytesToHex(txBuilder.build_tx().to_bytes());
  }

  // Experimental feature, false by default, in which case only the witness set is returned.
  const returnTx = true;

  cardanoApi
    .signTx({
      tx: unsignedTransactionHex,
      returnTx,
    })
    .then((responseHex) => {
      toggleSpinner("hide");
      console.log(`[signTx] response: ${responseHex}`);

      if (returnTx) {
        const signedTx = CardanoWasm.Transaction.from_bytes(
          hexToBytes(responseHex)
        );
        const wit = signedTx.witness_set();

        const wkeys = wit.vkeys();
        for (let i = 0; i < wkeys.len(); i++) {
          const wk = wkeys.get(i);
          const vk = wk.vkey();
          console.log(`[signTx] wit vkey ${i}:`, {
            vkBytes: bytesToHex(vk.to_bytes()),
            vkPubBech: vk.public_key().to_bech32(),
            vkPubHashBech: vk
              .public_key()
              .hash()
              .to_bech32(Bech32Prefix.PAYMENT_KEY_HASH),
          });
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
          tx.auxiliary_data()
        );
        transactionHex = bytesToHex(transaction.to_bytes());
      }

      unsignedTransactionHex = null;
      alertSuccess("Signing tx succeeded: " + transactionHex);
    })
    .catch((error) => {
      console.error(error);
      toggleSpinner("hide");
      alertWarning("Signing tx fails");
    });
});
showUtxos.addEventListener("click", () => {
  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  if (!utxos || utxos.length === 0) {
    alertError("Should request utxos first");
    return;
  }

  hideAlert();
  renderUtxo();
});

function alertError(text) {
  toggleSpinner("hide");
  alertEl.className = "alert alert-danger overflow-auto";
  alertEl.innerHTML = text;
}

function alertSuccess(text) {
  alertEl.className = "alert alert-success overflow-auto";
  alertEl.innerHTML = text;
}

function hideAlert() {
  alertEl.className = "d-none";
  alert.innerHTML = "";
}

function alertWarning(text) {
  alertEl.className = "alert alert-warning";
  alertEl.innerHTML = text;
}

function toggleSpinner(status) {
  if (status === "show") {
    spinner.className = "spinner-border";
    alertEl.className = "d-none";
  } else {
    spinner.className = "d-none";
  }
}

function toggleConnectionUI(status) {
  if (status === "button") {
    connectionStatus.classList.add("d-none");
    cardanoAccessBtnRow.classList.remove("d-none");
  } else {
    cardanoAccessBtnRow.classList.add("d-none");
    connectionStatus.classList.remove("d-none");
  }
}

function selectUtxo(e) {
  if (!e.target.id) {
    alertError("Invalid idx");
    return;
  }
  selectedUtxoIdx = e.target.id;
  hideAlert();
  renderUtxo();
}

function renderUtxo() {
  let utxosHTML = "";
  for (let idx in utxos) {
    const utxo = utxos[idx];
    const amountInADA = Number(utxo.amount) / 1000000;
    const numOfAssets = utxo.assets.length;

    utxosHTML += `
      <li id='${idx}' class="utxo-item list-group-item d-flex justify-content-between align-items-center ${
      selectedUtxoIdx == idx && "bg-primary text-white"
    }" style='cursor: pointer;'>
          <p id='${idx}' class='mb-0'>${utxo.utxo_id.slice(0, 25)}</p>
          <div>
            ${numOfAssets ? `<span class="badge bg-primary rounded-pill">${utxo.assets.length} Assets</span>` : ''}
            <span class="badge bg-primary rounded-pill">${amountInADA} ADA</span>
          </div>
      </li>
    `;
  }

  utxosHTML += `
    <input class="w-100 mt-3 p-1" placeholder="Receiver addresss..." type="text" id="create-tx-receiver" />
    <button id="create-tx" class="btn btn-light mt-3 w-100">[Experimental] Create Tx</button>
  `;
  utxosContainer.innerHTML = utxosHTML;
  utxosContainer.classList.remove("d-none");
  utxosContainer.classList.add(
    "d-block",
    "list-group",
    "list-group-numbered",
    "mb-5"
  );
  // Add select utxo handler for each list item
  getAll(".utxo-item").forEach((el) => {
    el.addEventListener("click", selectUtxo);
  });

  // Add event handler for create tx button
  get("#create-tx").addEventListener("click", createTxHandler);
}

function createTxHandler(e) {
  toggleSpinner("show");

  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  if (!utxos || utxos.length === 0) {
    alertError("Should request utxos first");
    return;
  }

  if (!usedAddresses || usedAddresses.length === 0) {
    alertError("Should request used addresses first");
    return;
  }

  const selectedUtxo = utxos[selectedUtxoIdx];
  if (!selectedUtxo) {
    alertError("No utxo selected");
    return;
  }

  console.log("[createTx] Including random utxo input: ", selectedUtxo);

  const usedAddress = usedAddresses[0];
  const keyHash = CardanoWasm.BaseAddress.from_address(
    CardanoWasm.Address.from_bech32(usedAddress)
  )
    .payment_cred()
    .to_keyhash();

  const keyHashBech = keyHash.to_bech32(Bech32Prefix.PAYMENT_KEY_HASH);

  const scripts = CardanoWasm.NativeScripts.new();
  scripts.add(
    CardanoWasm.NativeScript.new_script_pubkey(
      CardanoWasm.ScriptPubkey.new(keyHash)
    )
  );
  scripts.add(
    CardanoWasm.NativeScript.new_timelock_start(
      CardanoWasm.TimelockStart.new(42)
    )
  );

  const mintScript = CardanoWasm.NativeScript.new_script_all(
    CardanoWasm.ScriptAll.new(scripts)
  );
  const mintScriptHex = bytesToHex(mintScript.to_bytes());

  function convertAssetNameToHEX(name) {
    return bytesToHex(name);
  }

  const tokenAssetName = "V42";
  const nftAssetName = `V42/NFT#${Math.floor(Math.random() * 1000000000)}`;
  const tokenAssetNameHex = convertAssetNameToHEX(tokenAssetName);
  const nftAssetNameHex = convertAssetNameToHEX(nftAssetName);

  const expectedPolicyId = bytesToHex(mintScript.hash().to_bytes());

  console.log("[createTx] Including mint request: ", {
    keyHashBech,
    mintScriptHex,
    assetNameHex: tokenAssetNameHex,
    expectedPolicyId,
  });

  let receiver = get('#create-tx-receiver').value || selectedUtxo.receiver;
  const outputHex = bytesToHex(
    CardanoWasm.TransactionOutput.new(
      CardanoWasm.Address.from_bech32(receiver),
      CardanoWasm.Value.new(CardanoWasm.BigNum.from_str("1000000"))
    ).to_bytes()
  );

  const includeInputs = [];
  const includeOutputs = [];
  const includeTargets = [];

  let targetAddress = receiver;
  let targetDataHash = null;

  /****** FLAGS ******/
  let includeDefaultInputs = true;
  let includeDefaultOutputs = true;
  let includeDefaultTargets = true;
  let includeAssetTargets = true;
  //-----------------//
  const nativeScriptInputUtxoId = null;
  const plutusScriptInputUtxoId = null;
  const createPlutusTarget = false;
  /****** </FLAGS> ******/

  if (includeDefaultInputs) {
    includeInputs.push(selectedUtxo.utxo_id);
  }

  // noinspection StatementWithEmptyBodyJS
  if (includeDefaultOutputs) {
    includeOutputs.push(outputHex);
  }

  // noinspection PointlessBooleanExpressionJS
  if (nativeScriptInputUtxoId != null) {
    const nscripts = CardanoWasm.NativeScripts.new();
    nscripts.add(
      CardanoWasm.NativeScript.new_timelock_start(
        CardanoWasm.TimelockStart.new(1234)
      )
    );
    nscripts.add(
      CardanoWasm.NativeScript.new_timelock_start(
        CardanoWasm.TimelockStart.new(1)
      )
    );
    const nativeScript = CardanoWasm.NativeScript.new_script_all(
      CardanoWasm.ScriptAll.new(nscripts)
    );

    const scriptHash = nativeScript.hash();
    console.log(
      `[createTx] Native script hash: ${bytesToHex(scriptHash.to_bytes())}`
    );
    const nativeScriptAddress = CardanoWasm.EnterpriseAddress.new(
      0,
      CardanoWasm.StakeCredential.from_scripthash(scriptHash)
    )
      .to_address()
      .to_bech32();
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
    const plutusScript = CardanoWasm.PlutusScript.from_bytes(
      hexToBytes("4e4d01000033222220051200120011")
    );

    const plutusScriptHash = plutusScript.hash();
    console.log(
      `[createTx] Plutus script hash: ${bytesToHex(
        plutusScriptHash.to_bytes()
      )}`
    );
    const plutusScriptAddress = CardanoWasm.EnterpriseAddress.new(
      0,
      CardanoWasm.StakeCredential.from_scripthash(plutusScriptHash)
    )
      .to_address()
      .to_bech32();
    console.log(`[createTx] Plutus script address: ${plutusScriptAddress}`);

    const datum = CardanoWasm.PlutusData.new_empty_constr_plutus_data(
      CardanoWasm.BigNum.zero()
    );
    const datumHash = bytesToHex(
      CardanoWasm.hash_plutus_data(datum).to_bytes()
    );
    console.log(`[createTx] Plutus datum hash: ${datumHash}`);

    if (createPlutusTarget) {
      targetAddress = plutusScriptAddress;
      targetDataHash = datumHash;
    }

    // noinspection PointlessBooleanExpressionJS
    if (plutusScriptInputUtxoId != null) {
      const redeemer = CardanoWasm.Redeemer.new(
        CardanoWasm.RedeemerTag.new_spend(),
        CardanoWasm.BigNum.zero(),
        CardanoWasm.PlutusData.new_empty_constr_plutus_data(
          CardanoWasm.BigNum.zero()
        ),
        CardanoWasm.ExUnits.new(
          CardanoWasm.BigNum.from_str("1700"),
          CardanoWasm.BigNum.from_str("476468")
        )
      );

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
    includeTargets.push({
      address: targetAddress,
      value: "2000000",
      dataHash: targetDataHash,
      mintRequest: [
        {
          script: mintScriptHex,
          assetName: tokenAssetNameHex,
          amount: "42",
        },
        {
          script: mintScriptHex,
          storeScriptOnChain: true,
          assetName: nftAssetNameHex,
          metadata: {
            tag: 721,
            json: JSON.stringify({
              name: nftAssetName,
              description: `V42 NFT Collection`,
              mediaType: "image/png",
              image: "ipfs://QmRhTTbUrPYEw3mJGGhQqQST9k86v1DPBiTTWJGKDJsVFw",
              files: [
                {
                  name: nftAssetName,
                  mediaType: "image/png",
                  src: "ipfs://QmRhTTbUrPYEw3mJGGhQqQST9k86v1DPBiTTWJGKDJsVFw",
                },
              ],
            }),
          },
        },
      ],
    });
  }

  const txReq = {
    validityIntervalStart: 2000,
    includeInputs,
    includeOutputs,
    includeTargets,
  };

  if (includeAssetTargets) {
    const utxosWithAssets = utxos.filter((u) => u.assets.length > 0);
    const utxoWithAssets =
      utxosWithAssets[Math.floor(Math.random() * utxosWithAssets.length)];

    if (utxoWithAssets) {
      const asset = utxoWithAssets.assets[0];
      console.log("[createTx] Including asset:", asset);
      txReq.includeTargets.push({
        // do not specify value, the connector will use minimum value
        address: receiver,
        assets: {
          [asset.assetId]: "1",
        },
        ensureRequiredMinimalValue: true,
      });
    }
  }

  cardanoApi.experimental
    .createTx(txReq, true)
    .then((txHex) => {
      toggleSpinner("hide");
      alertSuccess(`<p> Creating tx succeeds: ${txHex} <p/>`);
      unsignedTransactionHex = txHex;
    })
    .catch((error) => {
      console.error(error);
      toggleSpinner("hide");
      alertWarning("Creating tx fails");
    });
}

getCollateralUtxos.addEventListener("click", () => {
  toggleSpinner("show");

  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  const amount = "4900000";
  cardanoApi
    .getCollateralUtxos(
      Buffer.from(
        CardanoWasm.Value.new(CardanoWasm.BigNum.from_str(amount)).to_bytes()
      ).toString("hex")
    )
    .then(utxosResponse => {
      toggleSpinner('hide');
      if (utxosResponse == null || utxosResponse.length === 0) {
        alertWarrning('NO COLLATERAL UTXOS');
      } else {
        let utxos = isCBOR() ? mapCborUtxos(utxosResponse) : utxosResponse;
        alertSuccess(
          `<h2>Collateral UTxO (${utxos.length}):</h2><pre>` +
          JSON.stringify(utxos, undefined, 2) +
          '</pre>'
        );
      }
    })
    .catch((error) => {
      console.error(error);
      toggleSpinner("hide");
      alertWarning(
        `Getting collateral UTXOs tx fails: ${JSON.stringify(error)}`
      );
    });
});

signData.addEventListener("click", () => {
  toggleSpinner("show");

  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  let address;
  if (usedAddresses && usedAddresses.length > 0) {
    address = usedAddresses[0];
  } else if (unusedAddresses && unusedAddresses.length > 0) {
    address = unusedAddresses[0];
  } else {
    alertError("Should request used or unused addresses first");
    return;
  }

  if (isCBOR()) {
    address = addressToCbor(address);
  }

  const payload = get("#sign-data-payload").value;
  let payloadHex;
  if (payload.startsWith("0x")) {
    payloadHex = Buffer.from(payload.replace("^0x", ""), "hex").toString("hex");
  } else {
    payloadHex = Buffer.from(payload, "utf8").toString("hex");
  }

  console.log("[signData][address] ", address);
  cardanoApi
    .signData(address, payloadHex)
    .then((sig) => {
      alertSuccess("Signature:" + JSON.stringify(sig));
    })
    .catch((error) => {
      console.error(error);
      alertError(error.info);
    })
    .then(() => {
      toggleSpinner("hide");
    });
});

getNFTs.addEventListener("click", async () => {
  toggleSpinner("show");

  if (!accessGranted) {
    alertError("Should request access first");
    return;
  }

  try {
    const response = await cardanoApi.experimental.listNFTs();
    renderJonsResponse(`NFTs (${Object.keys(response).length})`, response);
  } catch (error) {
    console.error(error);
    alertError(error.message);
  }
  toggleSpinner("hide");
});

function renderJonsResponse(title, response) {
  alertSuccess(
    `<h2>${title}:</h2><pre>` +
      JSON.stringify(response, undefined, 2) +
      "</pre>"
  );
}

const onload = () => {
  if (typeof window.cardano === "undefined") {
    alertError("Cardano API not found");
  } else {
    console.log("Cardano API detected, checking connection status");
    cardano.yoroi
      .enable({ requestIdentification: true, onlySilent: true })
      .then(
        (api) => {
          console.log("successful silent reconnection");
          onApiConnectied(api);
        },
        (err) => {
          if (String(err).includes("onlySilent:fail")) {
            console.log("no silent re-connection available");
          } else {
            console.error(
              "Silent reconnection failed for unknown reason!",
              err
            );
          }
          toggleSpinner("hide");
          toggleConnectionUI("button");
        }
      );
  }
};

setTimeout(onload, 100);
