import * as wasm from "ergo-lib-wasm-browser";

if (typeof ergo_request_read_access === "undefined") {
    alert("ergo not found");
} else {
    console.log("ergo found")
    ergo_request_read_access().then(function(access_granted) {
        if (!access_granted) {
            //alert("ergo access denied");
            const status = document.getElementById("status");
            status.innerText = "Wallet access denied";
        } else {
            const status = document.getElementById("status");
            status.innerText = "Wallet successfully connected";
            console.log("ergo access given");
            window.addEventListener("ergo_wallet_disconnected", function(event) {
                alert("wallet disconnected");
            });
            // ergo.get_unused_addresses().then(function(addresses) {
            //     //console.log(`get_unused_addresses() = {`);
            //     // for (const address of addresses) {
            //     //     const addr = wasm.NetworkAddress.from_bytes(Buffer.from(address, 'hex'));
            //     //     console.log(`${JSON.stringify(address)} -> ${addr.to_base58()}`);
            //     // }
            //     // console.log('}');
            //     console.log(`get_unused_addresses() = ${JSON.stringify(addresses)}`);
            // });
            // ergo.get_used_addresses().then(function(addresses) {
            //     //console.log(`get_used_addresses() = {`);
            //     // for (const address of addresses) {
            //     //     const addr = wasm.NetworkAddress.from_bytes(Buffer.from(address, 'hex'));
            //     //     console.log(`${JSON.stringify(address)} -> ${addr.to_base58()}`);
            //     // }
            //     // console.log('}');
            //     console.log(`get_used_addresses() = ${JSON.stringify(addresses)}`);
            // });
            ergo.get_balance().then(async function(result) {
                let tx = {};
                const div = document.getElementById("balance");
                div.innerText = "Balance: " + result;
                const valueEntry = document.createElement("input");
                valueEntry.setAttribute("type", "number");
                valueEntry.setAttribute("value", Math.floor(result / 2));
                const button = document.createElement("button");
                button.textContent = "Send";
                button.onclick = async function() {
                    status.innerText = "Creating transaction";
                    const donationAddr = "9fp6ERwLEF8u3Jvbii2msogFDUa9edxmvQKbwbwogXjLg7oXZSo";
                    const creationHeight = 398959;
                    const amountToSend = valueEntry.value;
                    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
                    const utxos = await ergo.get_utxos(amountToSend + wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num());
                    //alert(utxos.map(utxo => parseInt(utxo.value)));
                    const utxosValue = utxos.map(utxo => parseInt(utxo.value, 10)).reduce((a, b) => a + b, 0);
                    console.log(`${utxosValue} - ${amountToSend} - ${wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num()}`);
                    const changeValue = utxosValue - amountToSend - wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().as_num();
                    console.log(`${changeValue} | cv.ts() = ${changeValue.toString()}`);
                    const changeValueBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(changeValue.toString()));
                    const changeAddr = (await ergo.get_unused_addresses())[0];
                    console.log(`changeAddr = ${JSON.stringify(changeAddr)}`);
                    const selector = new wasm.SimpleBoxSelector();
                    const boxSelection = selector.select(
                        wasm.ErgoBoxes.from_boxes_json(utxos.map(utxo => {
                            // need to convert strings to numbers for sigma-rust for now
                            utxo.value = parseInt(utxo.value, 10);
                            return utxo;
                        })),
                        wasm.BoxValue.from_i64(amountToSendBoxValue.as_i64().checked_add(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64())),
                        new wasm.Tokens());
                    console.log(`boxes selected: ${boxSelection.boxes().len()}`);
                    const outputCandidates = wasm.ErgoBoxCandidates.empty();
                    const donationBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                        amountToSendBoxValue,
                        wasm.Contract.pay_to_address(wasm.Address.from_base58(donationAddr)),
                        creationHeight);
                    const changeBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                        changeValueBoxValue,
                        wasm.Contract.pay_to_address(wasm.Address.from_base58(changeAddr)),
                        creationHeight);
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
                        .sign_tx(tx)
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
                            status.innerText = "You must accept signing the transaction to donate. Please click send again and accept."
                        });
                }
                div.appendChild(valueEntry);
                div.appendChild(button);
            });
        }
    });
}
