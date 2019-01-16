# Abstract

Add a possibility to create "memos", the notification for transactions


# Motivation

This feature can help our users to recollect why did they make some transactions. The users will be able to check anytime what did whey note for a particular transaction and in this way recollect what's it about. Users can use Latin and also Cyrillic, Japanese, traditional Chinese and simplified Chinese symbols. Currently we use Dropbox for saving memos, and it basically saves the file in ANSI encoding, if there are only Latin symbols, and UTF-8, if there are Cyrillic, Japanese ones and so on.

# Background

### Components and UI
A new container was added: `/containers/settings/categories/AccountsSettingsPage.js`.
It renders an AccountsSettings component.

A new component was added: `/components/settings/categories/AccountsSettings.js`.
Here user can link his external storage account (only Dropbox for now) to Yoroi.

A new route was added for the AccountsSettingsPage.

A new component was added: `/components/wallet/send/WalletCloseMemoDialog.js`.
It serves for getting a confirmation if user wants to close a memo textarea when it's not empty.

A new textarea was added to `/components/wallet/send/WalletSendForm.js`

### Flow

The user flow is the following:
1. User is going to make a transaction. He is looking at `/components/wallet/send/WalletSendForm.js`.
2. The memo textarea is closed by default. User can click "Add memo" label.
3. If user clicked "Add memo", he or she can see the following:
   - If user haven't synced his external storage account yet, he or she will see the text "In order to attach private memos to   transactions you need to link Dropbox account." and a link to AccountsSettingsPage.
     - If user clicks the link, he or she will be redirected to AccountsSettingsPage. Here user can click "Authorize Yoroi in    Dropbox". If user does, he or she will be asked to authorize Yoroi in Dropbox. After that user will be redirected to a    home page.
   - If user have already synced his external storage account, he or she will see an opened textarea where the user can enter    the memo.
4. If user clicks "Add memo" again:
   - If the textarea is empty, it will be just closed.
   - If it isn't empty, user will see the `/components/wallet/send/WalletCloseMemoDialog.js` dialog window with the text "Remove memo?" and two buttons, "Yes" and "No".
     - If user clicks "No", the dialog closes and the memo textarea remain opened and have as content user's memo.
     - If user clicks "Yes", the dialog window closes and the textarea become cleared and closes too.
5. If user have entered the memo and makes a transaction, memo will be saved to localStorage and also to user's external storage.
6. When user goes to his summary - `/containers/wallet/WalletSummaryPage.js` and clicks on the transaction to expand it, he or she will see his memo at the very bottom of Transaction item (if memo exists).
7. When user links his external storage account to Yoroi, we check if there are some memos in his external storage. If there are, we download a content of each memo file via Dropbox API, read the content with FileReader object, then we save these memos to localStorage. In this way we can make user be able to install Yoroi on the another device, link his or her external storage account and get user's memos so they can be displayed in WalletSummary.

### Tech spec

#### External storages

We use official [Dropbox Javascript SDK](https://github.com/dropbox/dropbox-sdk-js#readme) for authenticating and making requests to Dropbox API. We can create folders, files, read them and change the content.

To make us able to auth user and manipulate his or her files, we need to [create an app in Dropbox](https://www.dropbox.com/developers/apps/create?_tk=pilot_lp&_ad=topbar5&_camp=create). When we create an app, we can get a `client_id` and we must provide a `redirect_uri` because Dropbox uses Oauth2. Both `client_id` and `redirect_uri` are used to create a link for user, which user should click to authenticate.

Uploading a file: 

When we read a content of Dropbox file, we need to read `Blob` to get the actual content, so we use a `FileReader` object.

#### Storage model

For now we have a separate file for each transaction memo. This approach has it's own pros and cons.
Pros:
- It's really easier and requires less code when we know that each file has the only one memo as it's content;
- There can't be any issues with concurrency when user has multiple instances of the app and both are linked to the same Dropbox account;
Cons:
- If user has 10,000 transactions with memos, we'll have to read through Dropbox api 10,000 files, which is bad for application performance.

As for now, the file's name is a transaction id, and the content is the actual memo. In the localStorage memos are saved as an array of objects, where each object looks like this: `{ memoId: someTransactionId, memoText: actualMemoText }`.

#### Concurrency

The border case #1: the user has multiple instances of the app and both are linked to the same Dropbox account

The result of additional researches is: if the user tries to create a new transaction from two instances at the same time, the worst case is Dropbox will create a conflicting copy of the memo file, so we'll have two files with memos, and the last saved version will become a conflicting copy. It's really good for us because we can read both files and merge them to one.

We could ensure it will work by creating some kind of unique identifier for every physical device (maybe we can think about using an IP address, or work around the Navigator object). This is not an easy part, but even if we do nothing to detect a new physical device or browser instance, we'll be saved by this conflicting copy of our .txt with memos.



The border case #2: the user has multiple instances of the app with the same wallet

For now we don't have any logic binded to wallet about memos, so it depends on linked Dropbox account - if it's the same account or there are two different ones. In the first case we basically have the border case #1. In the second case each memo from each Dropbox account will be added to a localStorage of a particular instance of app.

We actually can create a memo file per wallet to make this sync more efficient.

### Another storages

When we'll be adding another storages like Google Drive, we could reuse the same logic, but use the different API to interact with an another storage. I'd propose to do sync in the following way:
after the user adds an another storage, all the memos from the localStorage will be saved to user's linked storage.
Maybe we can restrict user to one storage per instance, so he or she can't use both Dropbox and Google drive (can be discussed).