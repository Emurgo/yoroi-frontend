# Abstract

Add a possibility to create "memos", the notification for transactions


# Concept

When user is about to make a new transaction, he or she can link his or her Dropbox account to the app. When the account is linked, user can write a note for the transaction.

When the transaction is being sent, the transaction memo will be stored in the localStorage and also in user's Dropbox. For the earliest concept user has one .txt file for one memo. We have to change this approach because if user has 10,000 transactions with memos, he will have the same amount of .txt files.

The default encoding of .txt file is probably ANSI, so we need to find a way to convert it to UTF-8, because currently we can't support cyrillic and japanese.

### Concurrency

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