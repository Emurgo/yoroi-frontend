import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';

function convertUnsignedTxOutputsToBigInt(tx) {
    tx.outputs.forEach(o => {
        o.value = BigInt(o.value);
        o.assets.forEach(a => {
            a.amount = BigInt(a.amount);
        })
    });
}

function initDapp() {
    ergo_request_read_access().then(function(access_granted) {
        if (!access_granted) {
            //alert("ergo access denied");
            const status = document.getElementById("status");
            status.innerText = "Wallet access denied";
        } else {
            const status = document.getElementById("status");
            status.innerText = "Wallet successfully connected";
            console.log("ergo access given");
            // ergo.get_unused_addresses().then(function(addresses) {
            //     //console.log(`get_unused_addresses() = {`);
            //     // for (const address of addresses) {
            //     //     const addr = wasm.NetworkAddress.from_bytes(Buffer.from(address, 'hex'));
            //     //     console.log(`${JSONBigInt.stringify(address)} -> ${addr.to_base58()}`);
            //     // }
            //     // console.log('}');
            //     console.log(`get_unused_addresses() = ${JSONBigInt.stringify(addresses)}`);
            // });
            /*function pagedUsedAddresses(page, limit) {
                ergo.get_used_addresses({ page, limit }).then(usedAddresses => {
                    console.log(`usedAddresses[${page * limit} - ${page * limit + usedAddresses.length - 1}] = ${JSONBigInt.stringify(usedAddresses)}`);
                    pagedUsedAddresses(page + 1, limit);
                }).catch(e => {
                    console.log(`paginateError = ${JSONBigInt.stringify(e)}`);
                });
            }
            pagedUsedAddresses(0, 3);
            // ergo.get_used_addresses({ page: 0, limit: 3 }).then(function(addresses) {
            //     console.log(`get_used_addresses() = {`);
            //     for (const address of addresses) {
            //     //     const addr = wasm.NetworkAddress.from_bytes(Buffer.from(address, 'hex'));
            //     //     console.log(`${JSONBigInt.stringify(address)} -> ${addr.to_base58()}`);
            //         console.log(`    ${address}`);
            //     }
            //     console.log('}');
            //     //console.log(`get_used_addresses() = ${JSONBigInt.stringify(addresses)}`);
            // });
            const assetId = "12c83f696c0731cfa6f70d1dea4c438c29ba3a193bf651b0c74d101ad62cf8b9";
            ergo.get_balance(assetId).then(result => {
                console.log(`get_balance(custom asset) = ${result}`);
            });
            ergo.get_utxos(5000, assetId).then(result => {
                console.log(`get_utxos(5000, custom asset) = ${JSONBigInt.stringify(result)}`);
            });*/
            ergo.get_balance().then(async function(result) {
                let tx = {};
                const div = document.getElementById("balance");
                div.innerText = "Balance: " + result;
                const valueEntry = document.createElement("input");
                valueEntry.setAttribute("type", "number");
                valueEntry.setAttribute("value", Math.floor(result / 10));
                const button = document.createElement("button");
                button.textContent = "Send";
                button.onclick = async function() {
                    status.innerText = "Creating transaction";
                    const donationAddr = "9huf3zpvZpFzmyG1srwHWvwEYKCUvsuGpMKbXgcKjgHv1YiUKcw";
                    const creationHeight = 398959;
                    const amountToSend = BigInt(valueEntry.value);
                    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
                    const rawUtxos = await ergo.get_utxos((amountToSend + BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str())).toString());
                    let utxosValue = BigInt(0);
                    let utxos = rawUtxos.map(utxo => {
                        // need to convert strings to numbers for sigma-rust for now
                        //utxo.value = parseInt(utxo.value, 10);
                        utxosValue += BigInt(utxo.value);
                        for (let asset of utxo.assets) {
                            //asset.amount = parseInt(asset.amount);
                        }
                        return utxo;
                    });
                    // Testing with p2S inputs since Yoroi won't return those as they don't belong to anyone's wallet
                    //while (utxos.length > 1) { utxos.pop(); }
                    //utxos.unshift({"boxId":"6dd679cc32afd1f56ad74696c7af53c45330148a703da29b3f6b3ca3b09851c3","value":1331719,"ergoTree":"1002040004f2c001d193e4c6b2a573000004047301","assets":[],"additionalRegisters":{},"creationHeight":398959,"transactionId":"d2fbf4b62f262f4bce7973924ae06685aa5ec2313e24716e8b1d86d62789c89b","index":0});
                    const changeValue = utxosValue - amountToSend - BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
                    console.log(`${changeValue} | cv.ts() = ${changeValue.toString()}`);
                    const changeValueBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(changeValue.toString()));
                    const changeAddr = await ergo.get_change_address();
                    console.log(`changeAddr = ${JSONBigInt.stringify(changeAddr)}`);
                    const selector = new wasm.SimpleBoxSelector();
                    const boxSelection = selector.select(
                        wasm.ErgoBoxes.from_boxes_json(utxos),
                        wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
                        new wasm.Tokens());
                    console.log(`boxes selected: ${boxSelection.boxes().len()}`);
                    const outputCandidates = wasm.ErgoBoxCandidates.empty();
                    const token = new wasm.Token(wasm.TokenId.from_box_id(wasm.BoxId.from_str(utxos[0].boxId)), wasm.TokenAmount.from_i64(wasm.I64.from_str("1234567890123456789")));
                    const donationBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                        amountToSendBoxValue,
                        wasm.Contract.pay_to_address(wasm.Address.from_base58(donationAddr)),
                        creationHeight);
                    donationBoxBuilder.mint_token(token, "VLT", "Very Large Token", 2);
                    //donationBoxBuilder.add_token(token.id(), token.amount());
                    try {
                        outputCandidates.add(donationBoxBuilder.build());
                    } catch (e) {
                        console.log(`building error: ${e}`);
                        throw e;
                    }
                    //outputCandidates.add(changeBoxBuilder.build());
                    console.log(`utxosval: ${utxosValue.toString()}`);
                    const txBuilder = wasm.TxBuilder.new(
                        boxSelection,
                        outputCandidates,
                        creationHeight,
                        wasm.TxBuilder.SUGGESTED_TX_FEE(),
                        wasm.Address.from_base58(changeAddr),
                        wasm.BoxValue.SAFE_USER_MIN());
                        //changeValueBoxValue);
                    const dataInputs = new wasm.DataInputs();
                    // random tx we sent via the connector before - not referenced in any smart contract right now
                    //dataInputs.add(new wasm.DataInput(wasm.BoxId.from_str("0f0e4c71ccfbe7e749591ef2a906607b415deadee8c23a8d822517c4cd55374e")));
                    txBuilder.set_data_inputs(dataInputs);
                    const tx = txBuilder.build().to_json();
                    convertUnsignedTxOutputsToBigInt(tx);
                    console.log(`tx: ${JSONBigInt.stringify(tx)}`);
                    console.log(`original id: ${tx.id}`);
                    // sigma-rust doesn't support most compilation so manually insert it here
                    // this is HEIGHT > 1337 but in hex and without the checksum/etc for the address of the contract
                    //tx.outputs[0].ergoTree = "100104f214d191a37300";
                    // and this is a register-using one
                    //tx.outputs[0].ergoTree = "1002040004f2c001d193e4c6b2a573000004047301";
                    // and we rebuild it using
                    const correctTx = wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json();
                    convertUnsignedTxOutputsToBigInt(correctTx);
                    console.log(`correctTx:`, correctTx);
                    console.log(`new id: ${correctTx.id}`);
                    // we must use the exact order chosen as after 0.4.3 in sigma-rust
                    // this can change and might not use all the utxos as the coin selection
                    // might choose a more optimal amount
                    correctTx.inputs = correctTx.inputs.map(box => {
console.log(`box: ${JSONBigInt.stringify(box)}`);
                        const fullBoxInfo = utxos.find(utxo => utxo.boxId === box.boxId);
                        return {
                            ...fullBoxInfo,
                            extension: {}
                        };
                    });
                    status.innerText = "Awaiting transaction signing";
                    console.log(`${JSONBigInt.stringify(correctTx)}`);
                    ergo
                        .sign_tx(correctTx)
                        .then(async signedTx => {
                            status.innerText = "Transaction signed - awaiting submission"
                            try {
                                const sentTxId = await ergo.submit_tx(signedTx);
                                status.innerText = "Transaction submitted - thank you for your donation!";
                                const txTracker = document.createElement("a");
                                txTracker.appendChild(document.createTextNode(`Track TX ${sentTxId}`));
                                txTracker.href = `https://explorer.ergoplatform.com/en/transactions/${sentTxId}`;
                                status.appendChild(txTracker);
                            } catch (e) {
                                status.innerText = `Transaction could not be sent: ${JSONBigInt.stringify(e)}`;
                            }
                        })
                        .catch(err => {
                            console.log(`Error: ${JSONBigInt.stringify(err)}`);
                            status.innerText = `Error: ${JSONBigInt.stringify(err)}`
                        });
                }
                div.appendChild(valueEntry);
                div.appendChild(button);
            });
        }
    });
}

if (typeof ergo_request_read_access === "undefined") {
    alert("ergo not found");
} else {
    console.log("ergo found");
    window.addEventListener("ergo_wallet_disconnected", function(event) {
        const status = document.getElementById("status");
        status.innerText = "";
        const div = document.getElementById("balance");
        div.innerText = "Wallet disconnected.";
        const button = document.createElement("button");
        button.textContent = "Reconnect";
        button.onclick = initDapp;
        div.appendChild(button);
    });
    initDapp();
}
