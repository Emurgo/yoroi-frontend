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

 * The file will eventually get bigger and bigger as memos are added, and it could eventually surpass the local storage limits (~10MB). A file versioning scheme could be considered in that case.
 * Querying for a subset of memos (ie. last 10 memos) would require querying for the entire file (from the external service).
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

To safely store data in the external service we have to use encryption and digital signatures. However, before going any further we must notice an important limitation about **hardware wallets**. For security reasons, hardware wallets only provide access to the device's public keys, **NOT** private keys. Then, the proposed approach relies on using solely the *account* public key (available in all wallets) as input to create a new private key chain. More specifically:

* Take the **Public Deriver** public key (*aka* account public key) and hash it with `Blake2b`.
* Use the result from the previous step as a seed to a key derivation function, which will generate a new key pair. 
* Use a public key child derivation function with the key pair from the previous step to derive 2 new child keys.
* From the resulting key pairs, use one to encrypt and the other to sign.

For both encrypting and signing we refer to the corresponding Yoroi specifications for [encryption](https://github.com/Emurgo/yoroi-frontend/blob/737595fec5a89409aacef827d356c9a1605515c0/docs/specs/code/ENCRYPT.md) and [message signing](https://github.com/Emurgo/yoroi-frontend/blob/336f763a7b7085e2887b4965a979ccd24719787a/docs/specs/code/SIGNING.md).

## External service

The proposed external service is Dropbox. Based on its [Javascript SDK](https://github.com/dropbox/dropbox-sdk-js#readme), the API endpoints of our interest are:

* [Create folder](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesCreateFolder__anchor): Create a folder at a given path.
* [Upload single file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesUpload__anchor): Create a new file with the contents provided in the request.
* [Download single file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor): Download a file from a user's Dropbox.
* [Search individual file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesSearch__anchor): Searches for files and folders. Note: Recent changes may not immediately be reflected in search results due to a short delay in indexing.
* [Download folder as a ZIP file](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownloadZip__anchor): Download a folder from the user's Dropbox, as a zip file. The folder must be less than 20 GB in size and have fewer than 10,000 total files. The input cannot be a single file. Any single file must be less than 4GB in size.

Using Dropbox will require to [create an app](https://www.dropbox.com/developers/reference/developer-guide). The user will have to connect his/her account and grant permissions, after which an [access token](https://www.dropbox.com/developers/reference/oauth-guide) will be generated. This access token must be safely stored locally in order to make authorized requests on behalf of the user (refer to the [encryption](https://github.com/Emurgo/yoroi-frontend/blob/737595fec5a89409aacef827d356c9a1605515c0/docs/specs/code/ENCRYPT.md) spec). 

Note: API rate limits will apply in a [per user/app basis](https://www.dropbox.com/developers/reference/data-ingress-guide), so it shouldn't be a concern for Yoroi itself.

## User flow

The proposed user flow is the following:

1. The user opens the send transaction dialog.
2. The memo textarea is closed by default. The user can click *"Add memo"* label and one of the following scenarios occurs:
   - If the user hasn't synced his external storage account yet, he/she will see the text "In order to add private memos to   transactions you need to link Yoroi to a Dropbox account." and a link to the settings page.
   		- In the settings page, the user can click *"Connect Yoroi to Dropbox"*.
   - If the user has already synced his external storage account, the memo textarea will be shown.
3. If the user clicks *"Add memo"* again:
   - If the textarea is empty, it will be closed.
   - If it isn't empty, the user will see a dialog window with the text *"Do you want to discard this memo?"* and two buttons showing "Yes/No".
     - If the user clicks *"No"*, the dialog closes and the memo textarea remains opened with the same content.
     - If the user clicks *"Yes"*, the dialog window closes and the textarea become cleared.
4. If user has entered the memo and makes a transaction, the memo will be saved to local storage and then to external storage. If there is a problem saving to external storage, then the user will see an error message: *"An error occurred while syncing with your Dropbox account. You can try to sync again or discard the memo"*. In that case, one of the following scenarios occurs:
	- If the user clicks on *"Discard the memo"*, the memo will be removed from local storage.
	- If the user clicks on *"Try again"* Yoroi will try to upload the file again. The message will remain until the message is successfully uploaded.
5. When the user goes to his summary of transactions and clicks on a transaction to expand it, he/she will see the transaction memo at the very bottom of the transaction item (if the memo exists). The user will also see an option to remove the memo. If the user clicks it, a dialog message will show up with a message and two buttons showing *"Yes/No"*. The message is: *"Are you sure you want to remove the memo for this transaction? Doing so will erase all copies of it and you will not be able to restore it in the future"*.
6. When the user goes to the "Connect Yoroi to Dropbox" subsection in the settings page, he/she will see a button to connect his/her account if it's not connected already. 
7. When the user restores a wallet, he/she will be shown a message: *"If you previously connected your Dropbox account to use transactions memos, then you can restore them by going to Settings -> Connect Yoroi to Dropbox"*

# Requirements

We consider the following requirements:

* The user must be able to connect Yoroi to Dropbox, which will ask to grant permissions and it will return a new access token if the permission is granted. The access token must be encrypted and saved to local storage.
* The user must be able to add or dismiss memos when sending a transaction.
* The memo must be encrypted and saved to local storage after the transaction is sent. The stored object consists on the encrypted content of the memo along with a *boolean* value indicating if the memo has been uploaded/downloaded.
* After the memo is saved to local storage, it must be uploaded to the external storage. To upload a file, a [FilesCommitInfo](https://dropbox.github.io/dropbox-sdk-js/global.html#FilesCommitInfo) object must be constructed, where `contents` is the stored encrypted content of the memo and `path` is a concatenation of the wallet folder and the hash of the transaction.
* The name of the folder in the external storage is given by the wallet's account number plate. If a user synchronizes the same wallet on more than one device, then each device must sync with the same folder.
* Memos must be fetched after any of the following events:
	* A new transaction is sent.
	* A new transaction is received, in which the originating address is the current account. This is intended for transactions that are originated from other devices but in the same wallet.
	* Querying transactions history.
* When querying for the transactions history, the user must be able to see the existing memo for the transactions, and be able to delete them.
* For a given transaction, if the corresponding memo file doesn't exist, then it can be assumed that the transaction does not have a memo.
* The user must be able to revoke the permissions granted to the Yoroi Dropbox app.

