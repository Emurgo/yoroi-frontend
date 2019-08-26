# Abstract

This document describes the design of an off-chain solution to add **memos** to transactions by using an event-driven architecture and cryptographically-safe storage to ensure privacy and security. 

# Motivation

A memo is a description or a brief note about a transaction, intended to help the user to identify the motive behind his/her transaction. E.g. "Debt payment to Bob". With this feature, a user will be able to check the details for a particular transaction at any time and recollect what the transaction was about. The Cardano blockchain does not have native support for transaction memos, thus there is the need for implementing an off-chain solution in Yoroi. 

# Proposal

## Introduction

Cardano blockchain does not have native support for transaction memos so there is the need for an off-chain solution using either a local-only storage scheme or a combined local-external storage scheme.

In terms of architecture, it's worth noticing that Yoroi periodically asks for an updated list of transactions to a centralized server. A user having the same wallet in two devices and making a transaction in one device would eventually see the updated list of transactions in the other device. Concurrency is avoided by using this event-driven architecture, in which each instance of the same wallet acts as an observer. A similar setup should be considered for memos if we want them be consistent across devices.

Not all transactions will include a memo, as users might want to add a memo only for a specific subset of transactions, or even not to add memos at all. Thus, memos must be considered optional. Additionally, memos will only be available for their authors. If Alice sends a transaction with the memo "Debt payment" to Bob, then only Alice will see the memo on her wallet and Bob will not be aware of it. Lastly, a memo could include sensitive information about either the sender, the receiver or the transaction itself, so we must ensure confidentiality and privacy.

## Storage model

There are two basic schemes for storing data, namely local and external. Local storage refers to data that is stored persistently after the app is closed, but is removed after the app is uninstalled. For instance, migrating a wallet installation from one device to another (ie. restoring a wallet) will result in losing the wallet's local data. If a wallet is being used on two or more devices at the same time, then local data will not necessary be the same for all of the devices, as one device can create a memo which is not propagated to the other devices. 

On the other hand, external storage can be considered persistent, restorable and shareable across devices. Like the event-driven architecture used for transactions history, we can consider a centralized (and external) storage service to replicate memos across multiple devices acting as observers. In practical terms, this storage service will require to connect to an external API (such as Dropbox) and periodically synchronize to upload/download data. 

## Storage proposal

We propose a combined local-external storage scheme. Specifically, we propose to save memos locally and upload/download them after specific events. Regarding the format of the stored data, we discuss two strategies:

### Single file per wallet

The first strategy is to store memos in a single file per wallet. The file would contain a JSON dictionary in which each entry is a mapping from a transaction ID to a UTF-8 encoded memo. The advantage of this strategy is the simplicity of having a single file to be encrypted, signed, uploaded and downloaded. Nevertheless, this also has a few notably disadvantages:

 * The file will eventually get bigger and bigger as memos are added. A file versioning scheme could be considered in that case.
 * Querying for a subset of memos (ie. last 10 memos) would require querying for the entire file from the external service.
 * If two instances of the same wallet upload a memo at the same time, there will be a merge conflict. In the case of Dropbox, they handle this scenario by creating a **conflicting copy** of the file and maintining both files, passing on the responsability of merging them to the app.

### Single folder per wallet, single file per transaction.

The second strategy is to store memos in separated files inside a single folder per wallet. There would be one file per transaction, in which the content of the file is the corresponding UTF-8 enconded memo. The advantages of this approach are the following:

 * Merge conflicts are avoided because two instances of the same wallet will not conflict if they write different files to the same folder. Two instances of the same wallet will never create the same transaction, therefore it's safe to assume that they will write different files.
 * It would be easier to query for a subset of memos because in this case it implies querying for specific files. If the file doesn't exists, then the transaction doesn't have a memo. 

The main disadvantage of this approach would be to handle a number of files instead of one. That is, encrypting, signing, uploading and downloading multiple files.

Despite of this minor setback, we consider this strategy to be the most suitable for implementing the memo feature.

## Privacy

A memo could include sensitive or personal information about either the sender, the receiver or the transaction itself. In order to maintain privacy, each file containing a memo must be locally encrypted before uploaded to the external service. In the case of an unauthorized access to the external service, memo data will be unreadable. The user must acknowledge, however, that connecting to an external service will be at his/her own risk. If the user loses access to his/her account in the external service, the files could expose metadata about transactions history based on file creation dates.

## Encryption

To safely store data in the external service we have to use encryption and digital signatures. For this purpose, we refer to the [key derivation]() specification to create a private key chain that allows us to sign and encrypt with different keys.

Once the keys are generated, we refer to the corresponding Yoroi specifications for [encryption](https://github.com/Emurgo/yoroi-frontend/blob/737595fec5a89409aacef827d356c9a1605515c0/docs/specs/code/ENCRYPT.md) and [message signing](https://github.com/Emurgo/yoroi-frontend/blob/336f763a7b7085e2887b4965a979ccd24719787a/docs/specs/code/SIGNING.md). 

The signing specification describes an adapted version of the [CBOR](https://tools.ietf.org/html/rfc7049) Object Signing and Encryption ([COSE](https://tools.ietf.org/html/rfc8152)) specification. In our particular case, we must consider the following assumptions. Let `SK` and `EK` be the keys from the private key chain with the purpose of signing and encrypting, then:

* A1: We sign with a single key (SIGN_TAG = 18)
* A2: We use `SK` along with the `sign` and `verify` methods provided by Cardano WASM bindings.
* A3: Based in A2, we don't need to include the optional parameteres described in point `P1` from the signing spec as we already know which algorithm is used.
* A4: Encryption with the recipient's public key (COSE_Encrypt) is better suited for multiple receivers. For the sake of simplicty, we use password-based encryption (COSE_Encrypt0) with `EK` as the password for symmetric encryption. Note that the encryption method described in the Yoroi encryption specification is implemented in the Cardano JS WASM bindings and it's called `password_encrypt`.

The following are examples of signing and then encrypting a memo following the Cardano signed message format. To make the examples easier to read, they are represented using the extended CBOR diagnostic notation (CDDL).

**Cardano signed message**
```
18(
  [
    / protected / h'' / {
      \ is_ascii \ is_ascii:false \
    } / , 
    / unprotected / {
      \ version \ version:1 \
    } / , 
    / payload / 'test message', 
    / signature / h'af74d407b62c673dc1c8a591f32406e171172bf47069a20b4d2fb42ffa8672b473df8bb7abf3e7671e2523856f2f9971ac3817d48a116c62a878de069c63d30f'
  ]
)
```

The `payload` is signed with the `sign` WASM binding using `SK`. The signature is added in the `signature` field and the structure is encrypted using `password_encrypt` and `EK` as a password. The result is used as a value for the ciphertext field in the COSE structure for encrypted messages. 

**Cardano encrypted message**
```
16(
  [
    / protected / h'' / {
      \ is_ascii \ is_ascii:false \
    } / ,
    / unprotected / {
      \ enc_type \ enc_type:1 \
      \ version \ version:1 \
    } /, 
    / ciphertext / h'3d21b0d8c16a132c59f4f65a9bba41a3ec7002ea0eee255870839f8a2a158efa0972325d527cee06e5bf13c936e188fd9962de5866319bac3e8b581a8b16f8fd0393fc6a1a84e72dcd6e773a04a7bd6baa7e99e741b8c713decb3b05af32c3a897f4a68d274e527eaf9ffca7971b5d9d0c5caeb4a500344d6db4bba2a4cdfd8838d509e40d215645342cd6705d6d199b1b0914d96b42602b7f3125f6bfea1b7acb7c72871118628d41df17a3e6b6d56d362292f3f4fc9b4d2b3c68653d9dc385f0edeb426422390f76'
  ]
)
```

The structure is saved to a file named after the `Blake2b` hash of the transaction id for which the memo is intended and uploaded to the external storage. To decrypt we do the opposite process. 

**Observation**: Note that if the user needs to decrypt the file on his/her own, we only need to provide him/her with the `EK` used to encrypt, along with the file and a description of the algorithms involved. There is no need to give information about the private key chain itself, such as the master key or the mnemonics used to generate it.

## External storage

The proposed external storage is Dropbox. Based on its [Javascript SDK](https://github.com/dropbox/dropbox-sdk-js#readme), the API endpoints of our interest are:

* [Create folder](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesCreateFolder__anchor): Create a folder at a given path.
* [Upload single file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesUpload__anchor): Create a new file with the contents provided in the request.
* [Download single file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor): Download a file from a user's Dropbox.
* [Search individual file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesSearch__anchor): Searches for files and folders. Note: Recent changes may not immediately be reflected in search results due to a short delay in indexing.
* [Download folder as a ZIP file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownloadZip__anchor): Download a folder from the user's Dropbox, as a zip file. The folder must be less than 20 GB in size and have fewer than 10,000 total files. The input cannot be a single file. Any single file must be less than 4GB in size.

Using Dropbox will require to [create an app](https://www.dropbox.com/developers/reference/developer-guide). The user will have to connect his/her account and grant permissions, after which an [access token](https://www.dropbox.com/developers/reference/oauth-guide) will be generated. This access token must be safely stored locally in order to make authorized requests on behalf of the user (refer to the [encryption](https://github.com/Emurgo/yoroi-frontend/blob/737595fec5a89409aacef827d356c9a1605515c0/docs/specs/code/ENCRYPT.md) spec). 

Note: API rate limits will apply in a [per user/app basis](https://www.dropbox.com/developers/reference/data-ingress-guide), so it shouldn't be a concern for Yoroi itself.

As for the folder structure, we propose the following:

```
cardano / network_name / feature
```

For example:

```
cardano / mainnet / transaction-memos
```

### Fault tolerance

In the case of a failure in the external service, we must consider to keep the memos in local storage until they can be successfuly uploaded. There could be several sources of failure for a memo to be uploaded:

* External storage is unavailable
* The access token is expired
* The user revoked access for the Yoroi app registered in the external service
* The file already exists
* The user exceeded the limit of API calls to the external storage

Therefore, we must consider storing an error message field along with the memo when saving it to local storage. Also, notice that when a memo fails to be uploaded, another instance of the same wallet but in a different device could add a memo for the same transation. In this case, we apply the *first come, first served* principle and keep the first memo that was uploaded. 

## Local storage

We need to save the following items into local storage:

* LS1: `EXTERNAL_STORAGE` (JSON): dictionary with the supported external services, in which each element is named after the service (e.g. `dropbox`) and has a `token` field in it. In the case Dropbox, this will be the access token provided after the user granted access to the Yoroi app, used to connect to Dropbox API on behalf of the user.

As for the memos, to avoid unnecessary coupling of data, we propose a new IndexDB table with the following set of columns:

* `MemoId`: serial (PK)
* `TransactionId`: int (FK)
* `Memo`: varchar(256)
* `IsPending`: boolean
* `ErrorMessage`: varchar(256)


## User flow

The proposed user flow is the following: 

1. The user opens the send transaction dialog or clicks on the summary of a received transaction.
2. The memo textarea is closed by default. The user can click *"Add memo"* label and one of the following scenarios occurs:
   - If the user hasn't synced his external storage account yet, he/she will see the text "In order to add private memos to   transactions you need to link Yoroi to a Dropbox account." and a link to the settings page.
   		- In the settings page, the user can click *"Connect Yoroi to Dropbox"*.
   - If the user has already synced his external storage account, the memo textarea will be shown.
3. If the user clicks *"Add memo"* again:
   - If the textarea is empty, it will be closed.
   - If it isn't empty, the user will see a dialog window with the text *"Do you want to discard this memo?"* and two buttons showing "Yes/No".
     - If the user clicks *"No"*, the dialog closes and the memo textarea remains opened with the same content.
     - If the user clicks *"Yes"*, the dialog window closes and the textarea become cleared.
4. If user has entered the memo and makes a transaction, the memo will be saved to local storage and then to external storage. Note that there is a limit of 256 characters per memo. If there is a problem saving to external storage, then the user will see an error message: *"An error occurred while syncing with your Dropbox account. You can try to sync again or discard the memo"*. In that case, one of the following scenarios occurs:
	- If the user clicks on *"Discard the memo"*, the memo will be removed from local storage.
	- If the user clicks on *"Try again"* Yoroi will try to upload the file again. The message will remain until the message is successfully uploaded.
5. When the user goes to his summary of transactions and clicks on a transaction to expand it, he/she will see the transaction memo at the very bottom of the transaction item (if the memo exists). The user will also see an option to remove the memo. If the user clicks it, a dialog message will show up with a message and two buttons showing *"Yes/No"*. The message is: *"Are you sure you want to remove the memo for this transaction? Doing so will erase all copies of it and you will not be able to restore it in the future"*.
6. When the user goes to the "Connect Yoroi to Dropbox" subsection in the settings page, he/she will see a button to connect his/her account if it's not connected already. The user will also see a button to reveal the password used for encryption, in case he/she wants to decrypt the files without using Yoroi.
8. When the user restores a wallet, he/she will be shown a message: *"If you previously connected your Dropbox account to use transactions memos, then you can restore them by going to Settings -> Connect Yoroi to Dropbox"*

# Requirements

Based on the previous sections, we consider the following requirements: (TODO update according to the chosen encryption strategy)

* The user must be able to connect Yoroi to Dropbox, which will ask to grant permissions and it will return a new access token if the permission is granted. The access token must be encrypted and saved to local storage.
* The user must be able to add or dismiss memos when sending a transaction.
* The memo must be encrypted and saved to local storage after the transaction is sent. The stored object consists on the encrypted content of the memo along with a *boolean* value indicating if the memo has been successfuly synchronized.
* After the memo is saved to local storage, it must be uploaded to the external storage. To upload a file, a [FilesCommitInfo](https://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) object must be constructed, where `contents` is the stored encrypted content of the memo and `path` is a concatenation of the wallet folder and the hash of the transaction.
* Memos must be uploaded with a **first come, first served** strategy. That is, if an out-of-sync wallet uploads a duplicated memo, the first copy is kept and the conflicting copy is discarded.
* The folder structure in the external service is as follows: `cardano / network_name / transaction-memos /`.
* The name of the wallet folder in the external storage is given by the wallet's account number plate. If a user synchronizes the same wallet on more than one device, then each device must sync with the same folder.
* Memos must be uploaded/downloaded after any of the following events:
	* A new transaction is sent (upload).
	* A new transaction is received (download).
	* Querying transactions history (download).
* When querying for the transactions history, the user must be able to see the existing memo for the transactions, and be able to delete them.
* For a given transaction, if the corresponding memo file doesn't exist, then it can be assumed that the transaction does not have a memo.
* The user must be able to revoke the permissions granted to the Yoroi Dropbox app.
