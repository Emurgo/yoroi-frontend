# hwTransactions.js
This module is responsible for managing hardware wallet device sign transaction, and it's two step process.
- Prepare the payload data format to be consume by respective hawrdware wallets(Trezor/Ledger).
- Propagate the hardware wallet signed transaction to the blockchain.

## Prepare the payload data format to be consume by respective hawrdware wallets(Trezor/Ledger).
For that let's first understand Cardano's format(UnsignedTransactionExt).
```
const txExt = {
  "inputs": [
       {
            "ptr": {
                 "index": 0,
                 "id": "2610d9fe9af9ac321d631b231edc8433105a2facf2b1b7048d3365458ba0c060"
            },
            "value": {
                 "address": "Ae2tdPwUPEZHEU3j2jSAhuvwrCPvjSBHPjk4xTHEaiVGkrhneAGB6qzZMoD",
                 "value": "80000"
            },
            "addressing": {
                 "account": 0,
                 "change": 0,
                 "index": 1
            }
       },
       {
            "ptr": {
                 "index": 1,
                 "id": "e70f354a69f0e67ac2114ac57e27bd4f15bfa8c66e00603bd8e975d90400bf63"
            },
            "value": {
                 "address": "Ae2tdPwUPEZKVNJCH2CjBFNukyQBSEuq9xiU8hxdA4FxeT9ajY8L3dpevuR",
                 "value": "1484495"
            },
            "addressing": {
                 "account": 0,
                 "change": 1,
                 "index": 23
            }
       }
  ],
  "outputs": [
       {
            "address": "Ae2tdPwUPEZHAQPk7EHHmKXBWWS33QbEWb576v52yHMpPEt7HgjR42coDay",
            "value": 20004
       },
       {
            "address": "Ae2tdPwUPEZAa8d3kFZEJeSZvHk2EnWsnJ4mCowMD8NX8aStpuryFxunt9m",
            "value": 1368631,
            "isChange": true,
            "fullAddress": {
                 "cadAmount": {
                      "getCCoin": '0'
                 },
                 "cadId": "Ae2tdPwUPEZAa8d3kFZEJeSZvHk2EnWsnJ4mCowMD8NX8aStpuryFxunt9m",
                 "cadIsUsed": false,
                 "account": 0,
                 "change": 1,
                 "index": 24
            }
       }
  ]
}
```

- [Trezor.cardanoSignTransaction(trezorParams)](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md)
```
  const trezorParams = {
    "network": 2,
    "transactions": [
       "839f8200d81858248258206f9cf4bbad8fd0ac7487419ff7f1ed7ecfe90892f753325aaa74fbee73c227a601ff9f8282d818582183581cccb5b2e6aa52faa4a18e55c7712ee69ddc1bfafebf4c9e9fcb154a1ba0001a59f92a181a000138808282d818582183581c5f616829cd5536ba6b5931bc2aeca6016e6d8dd0a054a2e57650d617a0001a43d762111a001a4022ffa0",
       "839f8200d81858248258206f9cf4bbad8fd0ac7487419ff7f1ed7ecfe90892f753325aaa74fbee73c227a6008200d81858248258202610d9fe9af9ac321d631b231edc8433105a2facf2b1b7048d3365458ba0c06001ff9f8282d818582183581caae0559f67add7d768b91ef3e55f1ce0e400037a11da3cacd1c101b7a0001a6aefab2c19ea608282d818582183581ce35422b874147b84ab476cf799198f29f1f3dacfac6ec3738f92caffa0001aa6d6ed8c1a0016a6cfffa0"
    ],
    "inputs": [
       {
            "path": "m/44'/1815'/0'/0/1",
            "prev_hash": "2610d9fe9af9ac321d631b231edc8433105a2facf2b1b7048d3365458ba0c060",
            "prev_index": 0,
            "type": 0
       },
       {
            "path": "m/44'/1815'/0'/1/23",
            "prev_hash": "e70f354a69f0e67ac2114ac57e27bd4f15bfa8c66e00603bd8e975d90400bf63",
            "prev_index": 1,
            "type": 0
       }
    ],
    "outputs": [
       {
            "amount": "20004",
            "address": "Ae2tdPwUPEZHAQPk7EHHmKXBWWS33QbEWb576v52yHMpPEt7HgjR42coDay"
       },
       {
            "amount": "1368631",
            "path": "m/44'/1815'/0'/1/24"
       }
    ]
  }
```  

- [Ledger.signTransaction(ledgerParams)](https://github.com/vacuumlabs/ledgerjs/blob/1a85a888f7c2a0494b2dda0451e85916b43e7101/packages/hw-app-ada/src/Ada.js#L291)
```
  const ledgerParams = {
    "inputs" : [
       {
         txDataHex: trezorParams.transactions[0],
         outputIndex: trezorParams.inputs[0].prev_index,
         path: utils.str_to_path(trezorParams.inputs[0].path)
       },
       {
         txDataHex: trezorParams.transactions[1],
         outputIndex: trezorParams.inputs[1].prev_index,
         path: utils.str_to_path(trezorParams.inputs[1].path)
       }
    ],
    "outputs": [
        {
          amountStr: trezorParams.outputs[0].amount,
          address58: trezorParams.outputs[0].address
        },
        {
          amountStr: trezorParams.outputs[1].amount,
          path: utils.str_to_path(trezorParams.outputs[1].path)
        }
    ]
  }
```

## Propagate the hardware wallet signed transaction to the blockchain
TODO