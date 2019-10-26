# Abstract

1. Users would be able to use a Ledger Hardware Wallet with Yoroi Wallet.
2. Hardware wallet can be integrated by creating new Yoroi wallet, by using `Connect to Ledger Hardware Wallet` on `Add Wallet` page.
3. [yoroi-extension-ledger-bridge](https://github.com/Emurgo/yoroi-extension-ledger-bridge) API will be used to communicate with hardware device.

# Motivation

1. Since private key never leaves the hardware wallet so it's considered as one of the most secuired way to use cryptocurrency wallets.
2. No need to remember spending passowrd, so its easy to use(although need to remember a pincode for screen unlocking).

# Background

As Yorio wallet has Trezor Hardware wallet support, Ledger Hardware wallet support will add up to the scope of user reach.

# Iteration-1

## Proposal

User will be able to:
1. Setup a new Yoroi Wallet without exposing its private key/ mnemonics.
2. Send ADA using the Ledger Wallet Security.

## Prerequisite

1. [Only Ledger Nano S model is supported for now.](https://www.ledger.com/products/ledger-nano-s)
2. Cardano ADA app must be installed on Ledger device.<br>
![image](https://user-images.githubusercontent.com/19986226/53296899-4b1d4e00-3858-11e9-9bf4-3829498676c2.png)
3. [Additional setting may be need depending on your OS.](https://support.ledger.com/hc/en-us/articles/115005165269-Fix-connection-issues)


## Ledger Integrated Wallet Creation

1. Install or update to a supported version of Yoroi.
2. Select `Connect to Ledger Hardware Wallet` in the `Add Wallet` page - where Restore Wallet and Create Wallet also appears.
4. Connect the Ledger device to the computer and follow the steps to export the master public key for a Cardano Wallet.
5. Default wallet name will be provided to be used as wallet name, but it can be modified by the user.

## Send ADA using Ledger Sign Transaction

1. Go to the Send Tab as usual, fill with the receiver's address and desire amount.
2. Press NEXT button and select option to Send using Ledger.
3. Approve the transaction on the Ledger device.

## Low Level Implementation Design

For communication with device We will be using [Emurgo/yoroi-extension-ledger-bridge](https://github.com/Emurgo/yoroi-extension-ledger-bridge), which is a wrapper of https://github.com/cardano-foundation/ledgerjs-hw-app-cardano.<br/>

NPM [package](https://www.npmjs.com/package/@cardano-foundation/ledgerjs-hw-app-cardano).

Transport layer can be:
- [hw-transport-u2f](https://www.npmjs.com/package/@ledgerhq/hw-transport-u2f)
- [hw-transport-webusb](https://www.npmjs.com/package/@ledgerhq/hw-transport-webusb)

Manual Ledger device Cardano ADA app installation:
- BOLOS development environment [set up](./BOLOS_SDK_SETUP.md)
- Update [ledger device FIRMWARE](./FIRMWARE_UPDATE.md) to `FIRMWARE_VERSION = 1.5.5` and `MCU_VERSION = 1.7`.
- [Clone](https://github.com/cardano-foundation/ledger-app-cardano) and `make load` should do the job assuming your BOLOS env is correct.

We will use following API:
* For Ledger Integrated Wallet Creation:
  - [Ada.getExtendedPublicKey(hdPath: BIP32Path)](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L66)
  - [Ada.getVersion()](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L49)

* For Send ADA using Ledger Sign Transaction:
  - [Ada.signTransaction(inputs: Array<InputTypeUTxO>, outputs: Array<OutputTypeAddress | OutputTypeChange>)](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L106)

### Ledger Integrated Wallet Creation
* [Ada.getExtendedPublicKey(hdPath: BIP32Path)](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L66) will return<br/>
```
{
  publicKeyHex: string,
  chainCodeHex: string
}
 // we will use this as [root_cached_key: ( publicKeyHex + chainCodeHex )master public key]
```
  [BIP32Path](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/blob/511a674a0801e4fdbf503bea6cfd96d565d2223a/src/Ada.js#L38) = [2147483692, 2147485463, 2147483648]

* [Ada.getVersion()](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L49) will return<br/>
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
"root_cached_key": "master public key",  // root_cached_key => Ada.getExtendedPublicKey()
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
      "vendor": "ledger.com",
      "deviceId": "device id" // presently there is no way get deviceId, but if possible will try to figure out 
      "majorVersion": 1,      // majorVersion => getVersion().major
      "minorVersion": 0,      // minorVersion => getVersion().minor
      "patchVersion": 0,      // patchVersion => getVersion().patch
      "model": "",       // presently there is no way get model, but if possible will try to figure out 
      "publicMasterKey": "master public key" // publicMasterKey => Ada.getExtendedPublicKey()
    }
  }
}
```

### Send ADA using Ledger Sign Transaction

* Amount and Reciever's wallet address will be fetched from user(and passed to API) and need to prepare data as following
  - `inputs: Array<InputTypeUTxO>` ([InputTypeUTxO](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/blob/511a674a0801e4fdbf503bea6cfd96d565d2223a/src/Ada.js#L40))
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
  - `outputs: Array<OutputTypeAddress | OutputTypeChange>` ([OutputTypeAddress](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/blob/511a674a0801e4fdbf503bea6cfd96d565d2223a/src/Ada.js#L46) , [OutputTypeChange](https://github.com/cardano-foundation/ledgerjs-hw-app-cardano/blob/511a674a0801e4fdbf503bea6cfd96d565d2223a/src/Ada.js#L51))
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

  - By calling [Ada.signTransaction(inputs: Array< InputTypeUTxO >, outputs: Array<OutputTypeAddress | OutputTypeChange>)](https://github.com/Emurgo/yoroi-extension-ledger-bridge/blob/4d573b50825d81927aca76b9b2a552e322647e4e/src/index.js#L106) will return
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
  Response will be serialized(different from Trezor) and passed to backend API through [signTx](https://github.com/Emurgo/yoroi-frontend/blob/bbbdad033b567f0298f61e59a985c1c26f30ee07/app/api/ada/lib/yoroi-backend-api.js#L126) for broadcasting the transaction.
  
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

## Proposal
Updated UI to for Ledger Nano X support using USB cable.

## Related PRs
Implementation: https://github.com/Emurgo/yoroi-frontend/pull/660

# Iteration-3

## Proposal
As in Windows 10, version 1903 (10th May 2019 update) native support for U2F has been added and it's affecting current Yoroi UI.<br>
Demo can be found here: https://youtu.be/Hlo6wOA16MA

In order fix UI problem, support for [WebAuthn Transport](https://www.npmjs.com/package/@ledgerhq/hw-transport-webusb) is proposed.

As WebAuthn Transport supports all [targetted browsers](https://caniuse.com/#search=Web%20Authentication%20API) it will be used as the default protocol.<br>
[U2F](https://www.npmjs.com/package/@ledgerhq/hw-transport-u2f) transport will still be available.<br>
[WebUSB](https://www.npmjs.com/package/@ledgerhq/hw-transport-webusb) transport support will also be added.

## Module structure
Till now we have two modules and one repository at: https://github.com/Emurgo/yoroi-extension-ledger-bridge<br>
`master` branch acts as connector module<br>
`gh-pages` branch is the actual `iframe` which communicates with the Ledger device<br>
Making one repository per module feels more better now and it will help proper testing of new URL before release.<br>
Hence proposing two new repository like:<br>
1. [yoroi-extension-ledger-connect](https://github.com/Emurgo/yoroi-extension-ledger-connect) as website which will communicate with the Ledger device
2. [yoroi-extension-ledger-connect-handler](https://github.com/Emurgo/yoroi-extension-ledger-connect-handler) as handler of opening, closing and communication with [yoroi-extension-ledger-connect](https://github.com/Emurgo/yoroi-extension-ledger-connect) (It will be npm published module, and only this module will be needed to import in Yoroi)

## Message Passing
![ledger-content-script](https://user-images.githubusercontent.com/19986226/66384568-f77fff00-e9f9-11e9-9d1d-dfe4b8afc5fc.png)

**Steps:**<br>
1. `Yoroi` requests `yoroi-extension-ledger-connect-handler`(Using function call).
2. `yoroi-extension-ledger-connect-handler` opens target Website.
3. `yoroi-extension-ledger-connect-handler` sends request message to `content-script`(Using extension port).
4. `content-script` passes request to the target Website app(Using `postMessage()`).
5. Target Website app processes the request and send response to `content-script`(Using `postMessage()`).
6. `content-script` passes response to `yoroi-extension-ledger-connect-handler`(Using extension port).
7. Finally, `yoroi-extension-ledger-connect-handler` passes response to `Yoroi`(Using function return).

**NOTE:**<br>
This will only work when Yoroi is running as a browser extension, when Yoroi is running as website needs additional fixes which in not implemented yet.

## Ledger Connect URL
WebAuthn-Transport-URL types:<br>
1. https://emurgo.github.io/yoroi-extension-ledger-connect/?locale=ja-JP<br>
**(Will be used from Yoroi)**<br>

2. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=webauthn<br>
(Will not be used from Yoroi)

3. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=webauthn&locale=en-US<br>
(Will not be used from Yoroi)

U2F-Transport-URL types(Will not be used from Yoroi):<br>
1. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=u2f<br>

2. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=u2f&locale=ja-JP<br>

WebUSB-Transport-URL types(Will not be used from Yoroi):<br>
1. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=webusb<br>

2. https://emurgo.github.io/yoroi-extension-ledger-connect/?transport=webusb&locale=ja-JP<br>

As this page will have i18n texts, locale can be set using query parameter `locale=LANGUAGE-CODE`. If no locale is provided then by default locale will be `en-US` and will not passed as query string.

For WebAuthn new tab is needed to process but for U2F+WebUSB it's not compulsury but still proposing processing in new tab for U2F+WebUSB transport as well just to keep it consistent and utilize rich and helpful UI for Ledger button oparations.

## Related PRs
Specification: https://github.com/Emurgo/yoroi-frontend/pull/696<br>
Implementation: https://github.com/Emurgo/yoroi-frontend/pull/884

# Iteration-4

TBD

# Reference

1. https://github.com/cardano-foundation/ledgerjs-hw-app-cardano
2. https://github.com/cardano-foundation/ledger-app-cardano
4. https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-ada
5. http://ledgerhq.github.io/ledgerjs/docs/#ada
6. https://ledger-dev.slack.com/
7. https://www.npmjs.com/package/@cardano-foundation/ledgerjs-hw-app-cardano
