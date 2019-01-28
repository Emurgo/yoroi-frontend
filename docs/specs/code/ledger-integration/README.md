# Abstract

Briefly describe the proposal

# Motivation

Why you think the proposal is necessary

# Background

Background information related to the proposal (current implementation, rationale for the implementation you will propose)

# Iteration-1

# Proposal
User will be able to:
1. Setup a new Yoroi Wallet without exposing its private key/ mnemonics in a computer.
2. Send ADA using the Ledger Nano S Wallet Security.

## Prerequisite
TBD

## Ledger Integrated Wallet Creation
TBD

## Send ADA using Ledger Sign Transaction
1. Go to the Send Tab as usual, fill with the receiver's address and desire amount.
2. Press NEXT button and select option to sign transaction.
3. Approve the transaction on the Ledger device.

## Low Level Implementation Design
For current development we will be using [vacuumlabs/ledgerjs-cardano](https://github.com/vacuumlabs/ledgerjs-cardano).<br/>
Later on we will adopt to [LedgerHQ/ledgerjs](https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-ada) API for integration ([NPM package](https://www.npmjs.com/package/@ledgerhq/hw-app-ada)).<br/>

Ledger device app installation:
- Update [ledger device frimware](./FRIMWARE_UPDATE.md) to `FRIMWARE_VERSION = 1.5.5` and `MCU_VERSION = 1.7`.
- BOLOS development environment [set up](./BOLOS_SDK_SETUP.md)
- [Clone](https://github.com/vacuumlabs/ledger-cardano-app) for the Ledger APP, `make load` should do the job assuming your BOLOS env is correct.
- [Clone](https://github.com/vacuumlabs/ledgerjs) and check out `cardano_app` branch
- `yarn watch` there, now you should be able to run `packages/example-node/lib/index.js`

At this moment we have:
- https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L70
- https://github.com/vacuumlabs/ledgerjs/blob/3dedc966c65166d677f78d0dd0e1f326025c9312/packages/hw-app-ada/src/Ada.js#L67
- https://github.com/vacuumlabs/ledger-cardano-app
- https://github.com/LedgerHQ/ledgerjs/blob/ba896756a54bd45d175029ab5dc98aa66694c848/packages/hw-app-ada/src/Ada.js#L59

**NOTE: Actual API endpoint name may change in very near future**

We will use following API:
* For Ledger Integrated Wallet Creation:
  - [Ada.getExtendedPublicKey(index: number)](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L70)
  - [Ada.getVersion()](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L88)

* For Send ADA using Ledger Sign Transaction:
  - [Ada.signTransaction(inputs: Array<InputTypeUTxO>, outputs: Array<OutputTypeAddress | OutputTypeChange>)](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L284)

### Ledger Integrated Wallet Creation
* [Ada.getExtendedPublicKey(index: number)](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L70) will return<br/>
```
{
  publicKeyHex: string, // <-- we will use this as [root_cached_key: master public key]
  chainCodeHex: string
}
```
  `index = 0`, will always be first `44'/1815'/0'/[index] => 44'/1815'/0'/0` BIP 32 index (**similar to Trezor Integration**)

* [Ada.getVersion()](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L88) will return<br/>
```
{
  major: string,
  minor: string,
  patch: string
}
```
we will store everthing in `localStorage` at `WALLET.cwHardwareInfo`

* For a new Yoroi Wallet, we need to create: `adaWallet` and `cryptoAccount` objects. **[this part is almost similar to Trezor Integration]**<br/>
`adaWallet`     = no change on how we were using it before  
`cryptoAccount` = we need to create it manually, because to create it with rust-cardano we would need the master private key, which we don’t have. This object is created in the following way:
```
const cryptoAccount = {
  root_cached_key: 'master public key',
  derivation_scheme: 'V2',
  account: 0 // we currently only support one account in Yoroi.
};
```

* `localStorage` structure **[this part is almost similar to Trezor Integration]**
```
ACCOUNT = {
"account": 0,
"root_cached_key": "master public key",  // root_cached_key => Ada.getExtendedPublicKey(index: number).publicKeyHex
"derivation_scheme": "V2"
}
```
```
LAST_BLOCK_NUMBER = "last_block_number"
```
```
WALLET = {
  "adaWallet": {
    "cwAccountsNumber": 1,
    "cwAmount": {
      "getCCoin": "1000000"
    },
    "cwId": "1",
    "cwMeta": {
      "cwAssurance": "CWANormal",
      "cwName": "TEST-ADA",
      "cwUnit": 0
    },
    "cwType": "CWTHardware",
    "cwHardwareInfo": {
      "vendor": "ledger.com",
      "deviceId": "device id" // presently there is no way get deviceId, but if possible will try to figure out 
      "majorVersion": 2,      // majorVersion => getVersion().major
      "minorVersion": 0,      // minorVersion => getVersion().minor
      "patchVersion": 8,      // patchVersion => getVersion().patch
      "model": "NanoS",       // presently there is no way get model, but if possible will try to figure out 
      "publicMasterKey": "master public key" // publicMasterKey => Ada.getExtendedPublicKey(index: number).publicKeyHex
      "chainCodeHex": "chain code Hex"       // chainCodeHex => Ada.getExtendedPublicKey(index: number).chainCodeHex
    }
  }
}
```

### Send ADA using Ledger Sign Transaction
* Amount and Reciever's wallet address will be fetched from user(and passed to API) and need to prepare data as following
  - `inputs: Array<InputTypeUTxO>` ([InputTypeUTxO](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L46))
  ```
  Example:
  inputs = [
    {
      txDataHex:
        "839f8200d8185824825820918c11e1c041a0cb04baea651b9fb1bdef7ee5295f" +
        "032307e2e57d109de118b8008200d81858248258208f34e4f719effe82c28c8f" +
        "f45e426233651fc03686130cb7e1d4bc6de20e689c01ff9f8282d81858218358" +
        "1cb6f4b193e083530aca83ff03de4a60f4e7a6732b68b4fa6972f42c11a0001a" +
        "907ab5c71a000f42408282d818584283581cb5bacd405a2dcedce19899f8647a" +
        "8c4f45d84c06fb532c63f9479a40a101581e581c6b8487e9d22850b7539db255" +
        "e27dd48dc0a50c7994d678696be64f21001ac5000d871a03dc396fffa0",
      outputIndex: 0,
      path: utils.str_to_path("44'/1815'/0'/0/0") // Ledger API call Ada.utils.str_to_path("44'/1815'/0'/1/0")
    }
  ];
  ```
  - `outputs: Array<OutputTypeAddress | OutputTypeChange>` ([OutputTypeAddress](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L46) , [OutputTypeChange](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L51))
  ```
  Example:
  outputs = [
    {
      amountStr: "700000",
      address58:
        "DdzFFzCqrhsoarXqLakMBEiURCGPCUL7qRvPf2oGknKN2nNix5b9SQKj2YckgXZK" +
        "6q1Ym7BNLxgEX3RQFjS2C41xt54yJHeE1hhMUfSG"
    },
    {
      amountStr: "100000",
      path: utils.str_to_path("44'/1815'/0'/1/0") // Ledger API call Ada.utils.str_to_path("44'/1815'/0'/1/0")
    }
  ];
  ```

  - By calling [Ada.signTransaction(inputs: Array< InputTypeUTxO >, outputs: Array<OutputTypeAddress | OutputTypeChange>)](https://github.com/vacuumlabs/ledgerjs-cardano/blob/efb244fd07dac79f71f7a81e56f57a9b3bf0500b/hw-app-ada/src/Ada.js#L284) will return
  ```
  Example:
  {
    txHashHex: '01f54c866c778568c01b9e4c0a2cbab29e0af285623404e0ef922c6b63f9b222',
    witnesses: [
      {
        path: [Array],
        witnessHex: 'f89f0d3e2ad34a29c36d9eebdceb951088b52d33638d0f55d49ba2f8baff6e29056720be55fd2eb7198c05b424ce4308eaeed7195310e5879c41c1743245b000'
      }
    ]
  }
  ```
  Response will be passed to backend API through [signTx](https://github.com/Emurgo/yoroi-frontend/blob/bbbdad033b567f0298f61e59a985c1c26f30ee07/app/api/ada/lib/yoroi-backend-api.js#L126)
  
### other changes 
we need to change following modules similar to Trezor integration implementation.
```
app/api => Wallet creation and Send SignedTx
```
```
app/action => Action for Connect to Trezor
```
```
app/store => Pass Action from View to API
```
```
app/containers => View containers(dialog)
```
```
app/components => View base components
```  

# Iteration-2
TBD

# Reference
1. https://github.com/vacuumlabs/ledgerjs-cardano/blob/master/hw-app-ada/src/Ada.js
2. https://github.com/vacuumlabs/ledgerjs/blob/cardano_app/packages/hw-app-ada/src/Ada.js
3. https://github.com/vacuumlabs/ledgerjs/blob/cardano_app/packages/example-node-ada/src/index.js
4. https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-ada
5. http://ledgerhq.github.io/ledgerjs/docs/#ada
6. https://ledger-dev.slack.com/
