# Abstract

Add a layer for security and privacy with a lock feature, similarly to how it is done in yoroi-mobile. 

When the feature is enabled, the user will be required to enter a chosen password to open the app. The password will be used to encrypt all locally stored data (transactions, addresses, wallets, etc).

# Motivation

Although user's funds are secured with a spending password, the balance, addresses, and transactions are immediately visible when the app is opened. Additionally, the same sensitive data is stored locally (in localStorage and IndexedDB) unencrypted.

We want to allow users to protect their privacy with the lock feature.

# Proposal

Terminology:
We will use the word 'passcode' to refer to the password used for this feature.

Stanford JavaScript Crypto Library will be used for data encryption/decryption and hashing (SHA256).

Lock feature implementation plan:

## 1. Lovefield Schema updates
Update Lovefield DB Schema of existing tables: add auto-incremented primary key columns to all tables, update foreign keys, make sure that proper action is set on foreign keys (CASCADE).

Because the data currently stored in IDB is not critical, and because of the significant change in the schema, it is okay to drop the existing database, and recreate a new version with the new schema. The only data we need to migrate are accounts and wallets information currently stored in localStorage. After migration this information has to be purged from localStorage.

## 2. Refactor the database API to allow passcode protection and encryption.

Here is what will be happening when the user enables passcode lock:

- Create an object containing validation hash (hash(hash(passcode))), and the current date.
- Encrypt this object with a newly generated salt and initialization vector (this will give us encrypted cipher)
- Using single transaction, encrypt all data stored in IDB using same salt and IV, and save the encrypted cipher in IDB (Security table)

During database initialization we will check the contents of Security table. If we find an encrypted cipher stored there, we will try to decrypt it with a passcode provided by the user. Database initialization won't succeed unless a correct passcode is provided.

Here is a sandboxed reference implementation of database encryption:
https://github.com/ebeloded/indexed-db-encryption

### Note regarding timestamps

The proposed implementation of Database encryption leaves one type of values unencrypted - dates stored as UNIX timestamps. We cannot encrypt these values because date fields are indexed DateTime types, and we cannot replace them with arbitrary ciphertext.

Dates of transactions, however, are sensitive values. A committed investigator with the right tools could potentially infer information about transactions by analyzing the timestamps.

I propose to add random noise to all dates during encryption in order to hide real timestamps.

In practical terms, I suggest to generate a random number when the user initiates DB encryption and add it to every date field in the database. We will store this number, encrypted, in the cipher data object, and use it during decryption to get the real date value.

This will allow us to retain the order of dates and DB index, while making sure that locally stored data doesn’t expose any sensitive information directly.

## 3. Add Lock feature in settings:

Lock feature will be a part of a new "Security and Privacy" section in settings (apart from lock feature, we will later add an option to show/hide balance, and likely other options).

Implement the following functionality
  - Set a new passcode, which will encrypt the IDB contents
  - Show age of the passcode
  - Disable lock (requires passcode), which will decrypt contents of IDB
  - Change passcode (requires current and new passcode), which will decrypt-encrypt IDB contents

## 4. Show lock screen if the database cannot be opened without a passcode
