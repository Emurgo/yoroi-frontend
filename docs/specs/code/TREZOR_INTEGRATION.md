# Abstract

1. Users would be able to use a Trezor Hardware Wallet with Yoroi Wallet.
2. Hardware wallet can be integrated by creating new Yoroi wallet, by using `Connect to Trezor Hardware Wallet` on `Add Wallet` page.
3. [TrezorConnect](https://github.com/trezor/connect) API will be used to communicate with hardware device.

# Motivation

1. Since private key never leave the hardware wallet so it's considered as one of the most secured way of using cryptocurrency wallets.
2. No need to remember spending passowrd, so its easy to use(although need to remember a pincode for screen unlocking).

# Background

Much needed functionality.

# Iteration-1

## Proposal
User will be able to:
1. Setup a new Yoroi Wallet without exposing its private key/ mnemonics.
2. Send ADA using the Trezor Wallet Security.

## Prerequisite

1. Trezor Model T - Version 2.0.8 or later. (Support for Trezor One is supposed to come by mid-next year according to some information in Reddit).
2. Initial configuration of the Trezor should have been already done.

## Trezor Integrated Wallet Creation

1. Install or update to a supported version of Yoroi.
2. Select `Connect to Trezor Hardware Wallet` in the `Add Wallet` page - where Restore Wallet and Create Wallet also appears.
4. Connect the Trezor device to the computer and follow the steps to export the master public key for a Cardano Wallet.
5. By default, Yoroi will use the Trezor device name as the wallet name, but it can be modified by the user.

## Send ADA using Trezor

1. Go to the Send Tab as usual, fill with the receiver's address and desire amount.
2. Press NEXT button and select option to Send using Trezor.
3. Approve the transaction on the Trezor device.

## Low Level Implementation Design

We will use [TrezorConnect](https://github.com/trezor/connect) API for integration.<br/>
For setup:
- PART1: add npm module using `npm -i trezor-connect`
- PART2: manual setup using [this](https://github.com/trezor/connect/tree/develop/src/js/webextension) and final build should have structure similar to [this](https://github.com/trezor/connect-explorer/tree/webextensions) **(We have to do these step every time when upgrading major TrezorConnect API version)**

We will use following TrezorConnect API:
- For Trezor Integrated Wallet Creation: [TrezorConnect.cardanoGetPublicKey(params)](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoGetPublicKey.md)
- For Send ADA using Trezor Sign Transaction: [TrezorConnect.cardanoSignTransaction(params)](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md)

### Trezor Integrated Wallet Creation

* getting public key from Trezor Wallet(sequence diagram).<br/>
![trezort-getpublickey-sequence](https://user-images.githubusercontent.com/19986226/51812399-b07f2d00-22f4-11e9-8c5f-00b673d11840.jpg)

* For a Yoroi Wallet, we need to create: `adaWallet` and `cryptoAccount` objects.<br/>
`adaWallet`     = no change on how we were using it before  
`cryptoAccount` = we need to create it manually, because to create it with rust-cardano we would need the master private key, which we don’t have. This object is created in the following way:
```
const cryptoAccount = {
  root_cached_key: 'master public key',
  derivation_scheme: 'V2',
  account: 0 // we currently only support one account in Yoroi.
};
```

* `localStorage` changes

Before:    
```
ACCOUNT = {
"account": 0,
"root_cached_key": "master public key",
"derivation_scheme": "V2"
}
```
```
LAST_BLOCK_NUMBER = "last_block_number"
```
```
WALLET = {
  "adaWallet": {
    "cwAmount": {
      "getCCoin": "1000000"
    },
    "cwId": "1",
    "cwMeta": {
      "cwAssurance": "CWANormal",
      "cwName": "TEST-ADA",
      "cwUnit": 0
    },
    "cwPassphraseLU": "2018-10-26T18:26:43+09:00"
  },
  "masterKey": "master private Key"
}
```

After:
```
ACCOUNT = {
"account": 0,
"root_cached_key": "master public key from Trezor device",
"derivation_scheme": "V2"
}
```
```
LAST_BLOCK_NUMBER = "last_block_number"
```
```
WALLET = {
  "adaWallet": {
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
      "vendor": "trezor.io",
      "deviceId": "device id",
      "label": "device label",
      "language": "english",
      "majorVersion": 2,
      "minorVersion": 0,
      "patchVersion": 8,
      "model": "T",
      "publicMasterKey": "master public key"
    }
  }
}
```

* app/domain/Wallet.js `Wallet` changes

```
  id: string = '';
  address: string = 'current address';
new-> type : WalletType = WalletTypeOption.WEB_WALLET;
new-> hardwareInfo : ?WalletHardwareInfo;
  @observable name: string = '';
  @observable amount: BigNumber;
  @observable assurance: AssuranceModeOption;
  @observable passwordUpdateDate: ?Date;
```

```
app/types/WalletTypes.js
// @flow
export type WalletType = 'CWTWeb' | 'CWTHardware';

export type WalletHardwareInfo = {
  vendor : string,
  model: string,
  deviceId: string,
  label: string,
  majorVersion: number,
  minorVersion: number,
  patchVersion: number,
  language: string,
  publicMasterKey: string,
};
```

### Send ADA using Trezor Sign Transaction

* Amount and Reciever's wallet address will be fetched from user(and passed to API) and need to prepare data as following<br>
[TrezorConnect.cardanoSignTransaction(params)](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md)
**NOTE: atm this [example](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md#example) seems to be outdated**
  - `inputs :`  obligatory https://github.com/trezor/connect/blob/09702b749a97631cd82eee32bcfc52e85a7ef9d4/src/js/types/cardano.js#L58

  - `outputs :` obligatory https://github.com/trezor/connect/blob/09702b749a97631cd82eee32bcfc52e85a7ef9d4/src/js/types/cardano.js#L64

  - `transactions :` obligatory `Array` of strings

  - `network :` obligatory `Integer` 1 for Testnet and 2 for Mainnet

* By calling [TrezorConnect.cardanoSignTransaction(params)](https://github.com/trezor/connect/blob/develop/docs/methods/cardanoSignTransaction.md) will return
```
{
    success: true,
    payload: {
        hash: string,
        body: string,
    }
}
```
Response will be passed to backend API through [signTx](https://github.com/Emurgo/yoroi-frontend/blob/bbbdad033b567f0298f61e59a985c1c26f30ee07/app/api/ada/lib/yoroi-backend-api.js#L126)

### other changes

we need to change following modules similar to `restoreWallet` implementation. 
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
```
chrome => add static files(js/html) needed for Trezor connection
```
```
chrome/manifest.[ENV].json => Add permission to allow Trezor Connect API and load static files needed for Trezor connection
```
```
scripts => change build script to move static files(js/html) needed for Trezor connection to build directory
```

# Iteration-2

## Proposal
1. Update [TrezorConnect](https://github.com/trezor/connect) API from [v6](https://connect.trezor.io/6/trezor-connect.js) to [v7](https://connect.trezor.io/7/trezor-connect.js).
  - Starting from [v7](https://github.com/trezor/connect/blob/develop/docs/index.md) [Trezor Connect Manifest](https://github.com/trezor/connect/blob/develop/docs/index.md#trezor-connect-manifest) has been made mandatory.
  - trezor-connect NPM from [6.0.2](https://www.npmjs.com/package/trezor-connect/v/6.0.2) to [7.0.1](https://www.npmjs.com/package/trezor-connect/v/7.0.1)

## Prerequisite  
  - Trezor device firmware must be updated to [2.1.0](https://github.com/trezor/trezor-core/releases/tag/v2.1.0)

## Implementation
https://github.com/Emurgo/yoroi-frontend/issues/277
https://github.com/Emurgo/yoroi-frontend/pull/334


# Iteration-3

TBD

# Reference

1. https://github.com/trezor/connect
2. https://github.com/trezor/connect/tree/develop/src/js/webextension
3. https://github.com/trezor/connect-explorer/tree/webextensions
4. https://github.com/trezor/connect/blob/develop/CHANGELOG.md
5. https://github.com/trezor/connect/blob/develop/docs/index.md
6. https://trezor.github.io/connect-explorer/#/
7. https://github.com/trezor/trezor-core
8. https://github.com/trezor/trezord-go
9. https://doc.satoshilabs.com/