# Abstract

Add a feature to create "memos" for transactions. 

# Motivation

A memo is a description or a brief note about a transaction, intended to help the user to identify the motive behind the transaction. E.g. "Debt payment to Bob". With this feature, a user will be able to check the memo for a particular transaction at any time and recollect what the transaction was about. The Cardano blockchain does not have native support for transaction memos, thus there is the need for implementing an off-chain solution in Yoroi. 

# Proposal

## Background

As stated before, the Cardano blockchain does not have native support for transaction memos, so there is the need for an off-chain solution using either a local-only storage scheme or a combined local-external storage scheme.

It's important to notice that Yoroi periodically asks a centralized server for an updated list of transactions. A user having the same wallet in two devices and making a transaction in one device would eventually see the updated list of transactions in the other device as well. In other words, there is a concurrency scenario that is taken care of by design. The same scenario should be considered for memos.

Transactions should not include memos by default, as not all users would want to add a memo for a transaction, and a memo should be available only for its author. If Alice sends a transaction with the memo "Debt payment" to Bob, then only Alice will see this memo on her wallet and Bob will not be aware of it. Note that a memo could include sensitive information about either the sender, the receiver or the transaction itself, so it's important to take into consideration confidentiality and privacy issues.

## Storage model

Local storage lasts until the wallet is installed in the browser, and given that memos will be off-chain data, switching a wallet installation from one device to another (ie. restoring a wallet) will imply losing the memos. Also, using the same wallet on two or more devices at the same time (the concurrency scenario) will not reflect the memos on all the devices if only local storage is used.

External storage is persistent, restorable and shareable across devices. The main advantage is that the concurrency scenario can be solved by the external service and replicated to multiple instances of the same wallet. This solution would require connecting to an external API such as Dropbox or Google Drive and periodically syncing to save and load memos. An official "app" should be registered with the external service and be available for public use, so the user will be asked to connect his/her personal account to this app and grant read/write permissions to it.

That being said, the proposal is to implement a combined local-external storage scheme. That is, save memos locally and upload/download them after specific events. The first strategy would be to use a unique file per wallet to store all memos. If a wallet contains 10,000 memos, then there will be a single big file. In such a case, it would be convenient to know if it's possible to query a file from the external service without completely downloading it, as it will not be always the case of requesting all memos at once (e.g. requesting only the last 10 memos). Also, if two instances of a wallet write to the same file with different source files -in case they are unsynced or if they created different transactions at the same time- there will be a concurrency problem. Depending on the external service, this could lead to explicitly having to merge conflicting copies.

An alternative strategy is to create a folder per wallet, with separate files inside containing the memos. In this case, there should be only one file per transaction. This approach would make it easier to check for the existence of a memo (simply check if the file exists). Also, the concurrency scenario seems to be more solvable by using this second strategy. Two instances of the same wallet will not conflict if they write different files to the same folder. It's safe to assume that they will write different files as files are per transactions. Two instances of the same wallet will never create the same transaction.

### Privacy considerations

The file(s) containing the memos must be locally encrypted before being sent to the external service. In the case of unauthorized access to the file, the memos will be unreadable. 

The user must acknowledge that connecting to an external service that is not provided by Yoroi will be subject to its own security regulations and it will be at his/her own risk. If the user loses access to his/her external service account, the memo file could be exposed and reveal metadata about the transaction history of a wallet (e.g. transaction dates could be inferred based on file(s) activity).

## Requirements

Based on the above, we consider the following requirements depending on the chosen strategy:

### Single file per wallet

* Memos must be saved to local storage and synced with an external service after a determined event. These events include: wallet restoration, new transactions received, new transaction sent, transaction history. 
* Memos must be saved in a file in JSON format as a dictionary, where each entry must be a mapping from a transaction id to a memo encoded as a UTF-8 string.
* Before syncing with the external service, the file must be encrypted using the private key (SK) as a password.  
* The external service must store a unique file per wallet. The file name must be a cryptographic hash of the wallet address (PK), specifically SHA1(PK).
* If a user restores the same wallet on more than one device, then each device must ask for the same file from the external service (based on the above requirement).
* If a transaction is not present in the file, then it can be assumed that the transaction does not have a memo.

### Single folder per wallet, single file per transaction

* Memos must be saved to local storage and synced with an external service after a determined event. These events include: wallet restoration, new transactions received, new transaction sent, transaction history. 
* A memo must be saved in a unique file per transaction. The file name must be a cryptographic hash of the transaction ID (PK), specifically SHA1(TX).
* Before syncing with the external service, the file must be encrypted using the private key (SK) as a password.  
* The file must be uploaded to the wallet folder. The folder name must be a cryptographic hash of the wallet address (PK), specifically SHA1(PK).
* If a user restores the same wallet on more than one device, then each device must ask for the files in the same folder from the external service (based on the above requirement).
* If a file for a transaction doesn't exist, then it can be assumed that the transaction does not have a memo.

## External service

The proposed external service is Dropbox with its [Javascript SDK](https://github.com/dropbox/dropbox-sdk-js#readme). Dropbox API allows to [create](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesUpload__anchor), [download](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesDownload__anchor) and [search](https://dropbox.github.io/dropbox-sdk-js/Dropbox.html#filesSearch__anchor) for folders and files. 

Using Dropbox would require to [create an app](https://www.dropbox.com/developers/reference/developer-guide). The user will have to connect his/her account and grant permissions, after which an [access token](https://www.dropbox.com/developers/reference/oauth-guide) will be generated. This access token must be stored locally in order to make authorized requests on behalf of the user. Also, it's important to notice that [API rate limits](https://www.dropbox.com/developers/reference/data-ingress-guide) apply per user/app.

## User flow

The proposed user flow is the following:

1. The user opens the send transaction dialog.
2. The memo textarea is closed by default. The user can click "Add memo" label and one of the following scenarios occurs:
   - If the user hasn't synced his external storage account yet, he/she will see the text "In order to add private memos to   transactions you need to link Dropbox account." and a link to the settings page.
   		- In the settings page, the user can click "Connect Yoroi to Dropbox".
   - If the user has already synced his external storage account, the memo textarea will be shown.
3. If the user clicks "Add memo" again:
   - If the textarea is empty, it will be just closed.
   - If it isn't empty, the user will see a dialog window with the text "Remove memo?" and two buttons, "Yes" and "No".
     - If the user clicks "No", the dialog closes and the memo textarea remains opened with the same content.
     - If the user clicks "Yes", the dialog window closes and the textarea become cleared.
4. If user has entered the memo and makes a transaction, the memo will be saved to local storage and external storage.
5. When the user goes to his summary of transactions and clicks on a transaction to expand it, he/she will see the transaction memo at the very bottom of the transaction item (if the memo exists).
6. When the user links his/her external storage account to Yoroi, there is a check for memos in the external storage. If memos are found, they are downloaded and saved to local storage. 

# Further discussion

We could have the case were a user who only uses a single instance of a wallet and wants to use memos but he/she is not willing to sync with an external service. In such a case, he/she could use local storage only and if he/she needs to migrate to a different device then he/she could be able to export memos to a file and load them again after restoration.
