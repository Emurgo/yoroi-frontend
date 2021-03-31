import * as wasm from "ergo-lib-wasm-browser";

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
            //     //     console.log(`${JSON.stringify(address)} -> ${addr.to_base58()}`);
            //     // }
            //     // console.log('}');
            //     console.log(`get_unused_addresses() = ${JSON.stringify(addresses)}`);
            // });
            function pagedUsedAddresses(page, limit) {
                ergo.get_used_addresses({ page, limit }).then(usedAddresses => {
                    console.log(`usedAddresses[${page * limit} - ${page * limit + usedAddresses.length - 1}] = ${JSON.stringify(usedAddresses)}`);
                    pagedUsedAddresses(page + 1, limit);
                }).catch(e => {
                    console.log(`paginateError = ${JSON.stringify(e)}`);
                });
            }
            pagedUsedAddresses(0, 3);
            // ergo.get_used_addresses({ page: 0, limit: 3 }).then(function(addresses) {
            //     console.log(`get_used_addresses() = {`);
            //     for (const address of addresses) {
            //     //     const addr = wasm.NetworkAddress.from_bytes(Buffer.from(address, 'hex'));
            //     //     console.log(`${JSON.stringify(address)} -> ${addr.to_base58()}`);
            //         console.log(`    ${address}`);
            //     }
            //     console.log('}');
            //     //console.log(`get_used_addresses() = ${JSON.stringify(addresses)}`);
            // });
            const assetId = "12c83f696c0731cfa6f70d1dea4c438c29ba3a193bf651b0c74d101ad62cf8b9";
            ergo.get_balance(assetId).then(result => {
                console.log(`get_balance(custom asset) = ${result}`);
            });
            ergo.get_utxos(5000, assetId).then(result => {
                console.log(`get_utxos(5000, custom asset) = ${JSON.stringify(result)}`);
            });
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
                    const donationAddr = "9fp6ERwLEF8u3Jvbii2msogFDUa9edxmvQKbwbwogXjLg7oXZSo";
                    const creationHeight = 398959;
                    const amountToSend = parseInt(valueEntry.value, 10);
                    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
                    const rawUtxos = await ergo.get_utxos(amountToSend + wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num());
                    let utxosValue = 0;
                    const utxos = rawUtxos.map(utxo => {
                        // need to convert strings to numbers for sigma-rust for now
                        utxo.value = parseInt(utxo.value, 10);
                        utxosValue += utxo.value;
                        for (let asset of utxo.assets) {
                            asset.amount = parseInt(asset.amount);
                        }
                        return utxo;
                    })
                    console.log(`utxosValue: ${utxosValue}`);
                    console.log(`${utxosValue} - ${amountToSend} - ${wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num()}`);
                    const changeValue = utxosValue - amountToSend - wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num();
                    console.log(`${changeValue} | cv.ts() = ${changeValue.toString()}`);
                    const changeValueBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(changeValue.toString()));
                    const changeAddr = await ergo.get_change_address();
                    console.log(`changeAddr = ${JSON.stringify(changeAddr)}`);
                    const selector = new wasm.SimpleBoxSelector();
                    const boxSelection = selector.select(
                        wasm.ErgoBoxes.from_boxes_json(utxos),
                        wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
                        new wasm.Tokens());
                    console.log(`boxes selected: ${boxSelection.boxes().len()}`);
                    const outputCandidates = wasm.ErgoBoxCandidates.empty();
                    const donationBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                        amountToSendBoxValue,
                        wasm.Contract.pay_to_address(wasm.Address.from_base58(donationAddr)),
                        creationHeight);
                    // const changeBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                    //     changeValueBoxValue,
                    //     wasm.Contract.pay_to_address(wasm.Address.from_base58(changeAddr)),
                    //     creationHeight);
                    outputCandidates.add(donationBoxBuilder.build());
                    //outputCandidates.add(changeBoxBuilder.build());
                    console.log(`utxosval: ${utxosValue}`);
                    const txBuilder = wasm.TxBuilder.new(
                        boxSelection,
                        outputCandidates,
                        creationHeight,
                        wasm.TxBuilder.SUGGESTED_TX_FEE(),
                        wasm.Address.from_base58(changeAddr),
                        wasm.BoxValue.SAFE_USER_MIN());
                        //changeValueBoxValue);
                    
                    const tx = txBuilder.build().to_json();
                    console.log(`tx: ${tx}`);
                    status.innerText = "Awaiting transaction signing";
                    ergo
                        .sign_tx({
                            ...tx,
                            inputs: utxos.map(utxo => ({ ...utxo, extension: {} })),
                        })
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
                                status.innerText = `Transaction could not be sent: ${JSON.stringify(e)}`;
                            }
                        })
                        .catch(err => {
                            console.log(`Error: ${JSON.stringify(err)}`);
                            status.innerText = "You must accept signing the transaction to donate. Please click send again and accept."
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