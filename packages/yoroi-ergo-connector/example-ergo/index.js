import * as wasm from "ergo-lib-wasm-browser";
import JSONBigInt from 'json-bigint';
const ergoAccessBtn = document.querySelector('#request-access')
const getUnUsedAddresses = document.querySelector('#get-unused-addresses')
const getUsedAddresses = document.querySelector('#get-used-addresses')
const getChangeAddress = document.querySelector('#get-change-address')
const getBalance = document.querySelector('#get-balance')
const getUtxos = document.querySelector('#get-utxos')
const submitTx = document.querySelector('#submit-tx')
const signTx = document.querySelector('#sign-tx')
const alertEl = document.querySelector('#alert')
const spinner = document.querySelector('#spinner')
const signTxContainer = document.querySelector('#sign-tx-container')

let accessGranted = false
let utxos
let changeAddress
let transactionHex


ergoAccessBtn.addEventListener('click', (e) => {
    toggleSpinner(true)
    ergo_request_read_access().then(access_granted => {
        if (access_granted) {
            accessGranted = true
            alertSuccess('You have access now')
        } else {
            accessGranted = false
            alertError('Wallet access denied')
        }
        toggleSpinner(false)
    })
})

getBalance.addEventListener('click', () => {
    if(!accessGranted) {
        alertError('Should request access first')
    } else {
        toggleSpinner(true)
        ergo.get_balance().then(function(balance) {
            toggleSpinner(false)
            alertSuccess(`Account Balance: ${balance}`)
        });
    }
})

getUnUsedAddresses.addEventListener('click', () => {
    if(!accessGranted) {
       alertError('Should request access first')
    } else {
        toggleSpinner(true)
        ergo.get_unused_addresses().then(function(addresses) {
            toggleSpinner(false)
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
        toggleSpinner(true)
        ergo.get_used_addresses().then(function(addresses) {
            toggleSpinner(false)
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
        toggleSpinner(true)
        ergo.get_change_address().then(function(address) {
            toggleSpinner(false)
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
    toggleSpinner(true)
    ergo.get_utxos().then(utxosResponse => {
        toggleSpinner(false)
        if(utxosResponse.length === 0){
            alertWarrning('NO UTXOS')
        } else {
            utxos = utxosResponse
            alertSuccess(`Check the console`)
            alertEl.innerHTML = '<pre>' + JSON.stringify(utxosResponse, undefined, 2) + '</pre>'
        }
    })
})

signTx.addEventListener('click', async (e) => {
    if (!accessGranted) {
        alertError('Should request access first')
        return
    }
    toggleSpinner(true)
    ergo.get_balance().then(function(balance) {
        toggleSpinner(false)
        const sendTo = '9fEoLR5ZkPXiHpfUcxG11W3HGpUoTuXxgZeX8DeZbMMiC1EKUFv'
        signTxContainer.innerHTML += `
        <form id='send-form'>
            <div class="form-floating mb-3">
                <input type="text" class="form-control" id="address" value="${sendTo}" placeholder="${sendTo}">
                <label for="address">Send address</label>
            </div>
            <div class="form-floating">
                <input type="number" class="form-control" id="amount" value=${Math.floor(balance/10)} placeholder="amount">
                <label for="amount">Amount</label>
            </div>
            <button id='send' type='submit' class='form-btn mt-3 btn btn-primary'>Send</button>
        </form>
    `
        const sendBtn = document.getElementById('send')

        if (!sendBtn) {
            alertError("Can't find the send button!!")
            signTxContainer.classList.add('d-none')
        } else {
            signTxContainer.classList.remove('d-none')
        }
        document.getElementById('send-form').addEventListener('submit', e => {
            e.preventDefault()
        })

        async function getUtxos(amountToSend) {
            const fee = BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
            const fullAmountToSend = BigInt(1000) * amountToSend + fee;
            const utxos = await ergo.get_utxos(fullAmountToSend.toString());
            const filteredUtxos = [];
            for (const utxo of utxos) {
                try {
                    await wasm.ErgoBox.from_json(JSONBigInt.stringify(utxo));
                    filteredUtxos.push(utxo);
                } catch (e) {
                    console.error('[getUtxos] UTxO failed parsing:', utxo, e);
                }
            }
            return filteredUtxos;
        }

        sendBtn.addEventListener('click',  async (e) => {

            alertInfo("Creating transaction");
            const creationHeight = 398959;
            const amountToSend = BigInt(document.getElementById('amount').value);
            const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
            const utxos = await getUtxos(amountToSend);
            let utxosValue = utxos.reduce((acc, utxo) => acc += BigInt(utxo.value), BigInt(0));
            console.log('utxos', utxosValue, utxos);
            // Testing with p2S inputs since Yoroi won't return those as they don't belong to anyone's wallet
            //while (utxos.length > 1) { utxos.pop(); }
            //utxos.unshift({"boxId":"6dd679cc32afd1f56ad74696c7af53c45330148a703da29b3f6b3ca3b09851c3","value":1331719,"ergoTree":"1002040004f2c001d193e4c6b2a573000004047301","assets":[],"additionalRegisters":{},"creationHeight":398959,"transactionId":"d2fbf4b62f262f4bce7973924ae06685aa5ec2313e24716e8b1d86d62789c89b","index":0});
            const changeValue = utxosValue - amountToSend - BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
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
            const token = new wasm.Token(wasm.TokenId.from_box_id(wasm.BoxId.from_str(utxos[utxos.length - 1].boxId)), wasm.TokenAmount.from_i64(wasm.I64.from_str("1234567890123456789")));
            const donationBoxBuilder = new wasm.ErgoBoxCandidateBuilder(
                amountToSendBoxValue,
                wasm.Contract.pay_to_address(wasm.Address.from_base58(sendTo)),
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
            const tx = parseJson(txBuilder.build().to_json());
            console.log(`tx: ${JSONBigInt.stringify(tx)}`);
            console.log(`original id: ${tx.id}`);
            // sigma-rust doesn't support most compilation so manually insert it here
            // this is HEIGHT > 1337 but in hex and without the checksum/etc for the address of the contract
            //tx.outputs[0].ergoTree = "100104f214d191a37300";
            // and this is a register-using one
            //tx.outputs[0].ergoTree = "1002040004f2c001d193e4c6b2a573000004047301";
            // and we rebuild it using
            const correctTx = parseJson(wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json());
            console.log(`correct tx: ${JSONBigInt.stringify(correctTx)}`);
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
             alertInfo("Awaiting transaction signing");
            console.log(`${JSONBigInt.stringify(correctTx)}`);                    

            async function signTx(txToBeSigned) {
                try {
                    return await ergo.sign_tx(txToBeSigned);
                } catch (err) {
                    const msg = `[signTx] Error: ${JSON.stringify(err)}`;
                    console.error(msg, err);
                    alertError(msg)
                    return null;
                }
            }

            async function submitTx(txToBeSubmitted) {
                try {
                    return await ergo.submit_tx(txToBeSubmitted);
                } catch (err) {
                    const msg = `[submitTx] Error: ${JSON.stringify(err)}`;
                    console.error(msg, err);
                    alertError(msg)
                    return null;
                }
            }

            async function processTx(txToBeProcessed) {
                const msg = s => {
                    console.log('[processTx]', s);
                    alertInfo(s);
                };
                const signedTx = await signTx(txToBeProcessed);
                if (!signedTx) {
                    console.log(`No signed tx`);
                    return null;
                }
                msg("Transaction signed - awaiting submission");
                const txId = await submitTx(signedTx);
                if (!txId) {
                    console.log(`No submotted tx ID`);
                    return null;
                }
                msg("Transaction submitted - thank you for your donation!");
                return txId;
            }

            function displayTxId(txId) {
                alertSuccess(`<a href="https://explorer.ergoplatform.com/en/transactions/${txId}" target='_blank'> Transaction on the explorer</a>`)
            }

            processTx(correctTx).then(txId => {
                console.log('[txId]', txId);
                if (txId) {
                    displayTxId(txId);
                }
            });
        })
    });
})

if (typeof ergo_request_read_access === "undefined") {
    alertError("Ergo not found");
} else {
    console.log("Ergo found");
    window.addEventListener("ergo_wallet_disconnected", function(event) {
        alertError("Wallet Disconnect")
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

function alertInfo(text) {
    alertEl.className = 'alert alert-info'
    alertEl.innerHTML = text
}

function toggleSpinner(status){
    if(status) {
        spinner.className = 'spinner-border'
        alertEl.className = 'd-none'
    } else {
        spinner.className = 'd-none'
    }
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
            //     //     console.log(`${JSON.stringify(address)} -> ${addr.to_base58()}`);
            //     // }
            //     // console.log('}');
            //     console.log(`get_unused_addresses() = ${JSON.stringify(addresses)}`);
            // });
            /*function pagedUsedAddresses(page, limit) {
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

                async function getUtxos(amountToSend) {
                    const fee = BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
                    const fullAmountToSend = BigInt(1000) * amountToSend + fee;
                    const utxos = await ergo.get_utxos(fullAmountToSend.toString());
                    const filteredUtxos = [];
                    for (const utxo of utxos) {
                        try {
                            await wasm.ErgoBox.from_json(JSONBigInt.stringify(utxo));
                            filteredUtxos.push(utxo);
                        } catch (e) {
                            console.error('[getUtxos] UTxO failed parsing:', utxo, e);
                        }
                    }
                    return filteredUtxos;
                }

                button.onclick = async function() {
                    status.innerText = "Creating transaction";
                    const donationAddr = "9hD2Cw6yQL6zzrw3TFgKdwFkBdDdU3ro1xRFmjouDw4NYS2S5RD";
                    const creationHeight = 398959;
                    const amountToSend = BigInt(valueEntry.value);
                    const amountToSendBoxValue = wasm.BoxValue.from_i64(wasm.I64.from_str(amountToSend.toString()));
                    const utxos = await getUtxos(amountToSend);
                    let utxosValue = utxos.reduce((acc, utxo) => acc += BigInt(utxo.value), BigInt(0));
                    console.log('utxos', utxosValue, utxos);
                    // Testing with p2S inputs since Yoroi won't return those as they don't belong to anyone's wallet
                    //while (utxos.length > 1) { utxos.pop(); }
                    //utxos.unshift({"boxId":"6dd679cc32afd1f56ad74696c7af53c45330148a703da29b3f6b3ca3b09851c3","value":1331719,"ergoTree":"1002040004f2c001d193e4c6b2a573000004047301","assets":[],"additionalRegisters":{},"creationHeight":398959,"transactionId":"d2fbf4b62f262f4bce7973924ae06685aa5ec2313e24716e8b1d86d62789c89b","index":0});
                    const changeValue = utxosValue - amountToSend - BigInt(wasm.TxBuilder.SUGGESTED_TX_FEE().as_i64().to_str());
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
                    const token = new wasm.Token(wasm.TokenId.from_box_id(wasm.BoxId.from_str(utxos[utxos.length - 1].boxId)), wasm.TokenAmount.from_i64(wasm.I64.from_str("1234567890123456789")));
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
                    const tx = parseJson(txBuilder.build().to_json());
                    console.log(`tx: ${JSONBigInt.stringify(tx)}`);
                    console.log(`original id: ${tx.id}`);
                    // sigma-rust doesn't support most compilation so manually insert it here
                    // this is HEIGHT > 1337 but in hex and without the checksum/etc for the address of the contract
                    //tx.outputs[0].ergoTree = "100104f214d191a37300";
                    // and this is a register-using one
                    //tx.outputs[0].ergoTree = "1002040004f2c001d193e4c6b2a573000004047301";
                    // and we rebuild it using
                    const correctTx = parseJson(wasm.UnsignedTransaction.from_json(JSONBigInt.stringify(tx)).to_json());
                    console.log(`correct tx: ${JSONBigInt.stringify(correctTx)}`);
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

                    async function signTx(txToBeSigned) {
                        try {
                            return await ergo.sign_tx(txToBeSigned);
                        } catch (err) {
                            const msg = `[signTx] Error: ${JSON.stringify(err)}`;
                            console.error(msg, err);
                            status.innerText = msg
                            return null;
                        }
                    }

                    async function submitTx(txToBeSubmitted) {
                        try {
                            return await ergo.submit_tx(txToBeSubmitted);
                        } catch (err) {
                            const msg = `[submitTx] Error: ${JSON.stringify(err)}`;
                            console.error(msg, err);
                            status.innerText = msg
                            return null;
                        }
                    }

                    async function processTx(txToBeProcessed) {
                        const msg = s => {
                            console.log('[processTx]', s);
                            status.innerText = s;
                        };
                        const signedTx = await signTx(txToBeProcessed);
                        if (!signedTx) {
                            console.log(`No signed tx`);
                            return null;
                        }
                        msg("Transaction signed - awaiting submission");
                        const txId = await submitTx(signedTx);
                        if (!txId) {
                            console.log(`No submotted tx ID`);
                            return null;
                        }
                        msg("Transaction submitted - thank you for your donation!");
                        return txId;
                    }

                    function displayTxId(txId) {
                        const txTracker = document.createElement("a");
                        txTracker.appendChild(document.createTextNode(`Track TX ${txId}`));
                        txTracker.href = `https://explorer.ergoplatform.com/en/transactions/${txId}`;
                        status.appendChild(txTracker);
                    }

                    processTx(correctTx).then(txId => {
                        console.log('[txId]', txId);
                        if (txId) {
                            displayTxId(txId);
                        }
                    });
                }
                div.appendChild(valueEntry);
                div.appendChild(button);
            });
        }
    });
}

function parseJson(str) {
    let json = JSONBigInt.parse(str);
    return {
        id: json.id,
        inputs: json.inputs,
        dataInputs: json.dataInputs,
        outputs: json.outputs.map(output => ({
          boxId: output.boxId,
          value: output.value.toString(),
          ergoTree: output.ergoTree,
          assets: output.assets.map(asset => ({
            tokenId: asset.tokenId,
            amount: asset.amount.toString(),
          })),
          additionalRegisters: output.additionalRegisters,
          creationHeight: output.creationHeight,
          transactionId: output.transactionId,
          index: output.index
        })),
      };
}

// if (typeof ergo_request_read_access === "undefined") {
//     alert("ergo not found");
// } else {
//     console.log("ergo found");
//     window.addEventListener("ergo_wallet_disconnected", function(event) {
//         const status = document.getElementById("status");
//         status.innerText = "";
//         const div = document.getElementById("balance");
//         div.innerText = "Wallet disconnected.";
//         const button = document.createElement("button");
//         button.textContent = "Reconnect";
//         button.onclick = initDapp;
//         div.appendChild(button);
//     });
//     initDapp();
// }
