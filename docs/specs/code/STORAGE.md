# Abstract

Describe a new storage layer to replace the current architecture

# Motivation

The current architecture carries a lot of legacy (ex: strange variable names carried over from Cardano SL 1.0), is no flexible enough to add many features we'd like (multi-wallet support, balance checkers, etc.) and is not sufficient once Shelley is released.

# Background

### Bip44 and Bip32

Standard Yoroi wallets follow [bip44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) and [bip32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) format which have a few tricky points to them.

![image](https://raw.githubusercontent.com/bitcoin/bips/master/bip-0032/derivation.png)

We use the 5 levels defined in bip44

```
m / purpose' / coin_type' / account' / chain / address_index
```
Apostrophe in the path indicates that BIP32 hardened derivation is used.

Notably, one needs to be careful with the concept of hardened derivations. With non-hardened keys, you can prove a child public key is linked to a parent public key using just the public keys. You can also derive public child keys from a public parent key, which enables watch-only wallets. With hardened child keys, you cannot prove that a child public key is linked to a parent public key.

**Lemma 1**: public keys can’t create hardened child public keys

**Lemma 2**: knowledge of a parent extended public key plus any non-hardened private key descending from it is equivalent to knowing the parent extended private key (and thus every private and public key descending from it). 

See https://bitcoin.org/en/wallets-guide#hierarchical-deterministic-key-creation for more info

# Proposal

[Click here to view SQL for proposal](https://my.vertabelo.com/public-model-view/7V1JpphYlMr0b2svi296srrFXAyNnZIfFu7lHUsMw7Wg2WqCb0f0QXKjJtAjOnJW?x=1065&y=1389&zoom=0.2207)

### Definitions

**Define**: Adhoc derivation - when the wallet knows a key (public or private) without knowing the key of any of its parents. \
Ex: An Adhoc Account wallet is one with (possibly multiple) account keys but no key for Root, Purpose or CoinType. \
Ex: A Derived Account wallet is one with accounts all being derived from a known parent key.

**Define**: Read-only Wallet - one with only public keys

**Warning:** `public key` and `private key` may actually mean extended public keys (xpub) and extended private keys (xprv) in the bip44 case

**Define**: we define a numerical value for each derivation level and allow them to be compared with standard comparison operators like `<`. Here is the mapping we use
* Root level = 0
* Purpose level = 1
* [...]
* Account level = 5

The reason we pick this order is because although bip44 mandates levels `[0,5]`, any cryptocurrency could use more or less levels. That means the number of derivations is unbounded to the right and the following is entirely possible
```
m / purpose' / coin_type' / account' / chain / address_index / foo / bar / baz
```
Therefore, for our storage layer to be compatible with any cryptocurrency that supports HD wallets, we need to make the root level be level 0. This means that `root < ... < account < chain < address`, which may seem counter-intuitive.

### Requirements

We have to be able to support a wide variety of bip44 uses. Here are some of these combinations that already exist in the Cardano ecosystem: \
**Adalite v1**: Derived chain (only external chain was used) \
**Hardware wallets**: Adhoc accounts (no private key is knows and you only know the account public key) \
**Balance checkers**: Adhoc addresses

We will also need in the future to support wallet types unrelated to bip44:

- Staking keys for Cardano
- Smart contract wallet
- Multisig wallets
- Multiple currencies

We will need to support multiple models:
- Standard UTXO
- [Extended UTXO](https://github.com/input-output-hk/plutus/tree/master/docs/extended-utxo)
- Account-based transactions (required for Shelley)

### General notes

Note: you can’t detect new account creations automatically as you need the decrypted root key in Yoroi as accounts are hardened (storing the root public key wouldn’t help you by Lemma 1)

Note: we don’t store explicit addressing info anywhere for bip44 and instead it's inferred by the relation between derivations.

#### Privacy

IndexDB doesn’t allow us to encrypt the whole DB so we need to encrypt individual columns in the DB.

Since we can't encrypt primary keys, we need to make the primary key be something that doesn't reveal information such as a serial ID number (instead of TxHash, AddressHash, etc.)

Since we can't encrypt a column we use as an index (which we want to be able to quickly sort tables by block number), we need store the values in these tables with a secret offset.

Note that even with these tricks, an adversary can still

- Know time gap between transactions (but not when time a transaction occurred)
- Know how many entries are in each table (# wallets, # accounts, #addresses, etc)

#### Recoverability

Old Yoroi IndexDB used to be 100% recoverable just from network information. This is no longer the case since (unlike before) we store the keys as part of the IndexDB also and some tables contain information that cannot be inferred even if you knew the keys (such as name of a wallet).

#### Maintaining app state

This spec doesn’t explicitly state what should be stored to maintain app state for the UI since there is no reason to represent this as a table a key-value format for SQL and in fact this probably isn’t quite desirable because as we add more features, it would probably grow to a table full of possibly null values.

#### Versions

Cardano addresses (and the keys themselves) are actually versioned. Instead of repeating the version number in every table, we infer that all derivation levels below a key have the same version.

Note: `Version` (v1, v2, v3 addresses) is represented with an integer.

#### Names & Uniqueness

Names are limited to 40 characters to match the existing limit in Yoroi and Daedalus (too large causes problems in the UI)

Name uniqueness is not enforced by the storage layer. In fact, the storage layer allows you to add the exact same wallet multiple times.

#### Amounts

We use an amount size of `32` even though Cardano only requires `17` as other blockchains or sidechains may have different settings.

### Key Table

We use Key to represent any key in our application (public or private). This table doesn’t enforce a format on purpose because Shelley and Plutus will add more key types so this makes sure they can all go into this table and we can extend our storage spec for more key types when needed.

Note: multiple keys derived from the same parent key don’t need to be encrypted with the same password. This allows, for example, that every account can have its own password.

Note: you can't infer if a password is present just by the presence of `PasswordLastUpdate` as it is possible (ex: Daedalus) that a user removes a password. The key is no longer encrypted but you still want to show the user the time since the password was removed.

Note: although encrypting public keys kind of defeats the point (since you can no longer fetch new transactions from the network without typing in a password), our storage spec allow for it since disallowing it actually complicates the design and because plain-text public keys can lead to privacy loss or cause your Bip44 wallet to be compromised.

Note: this means our storage layer also does not enforce a password for the private key. Yoroi UI enforces this but Daedalus allows a no-password option. Encrypting the private with a password is strongly recommended.

Note: we don't enfroce a checksum in the storage layer. Deciding whether or not to use a checksum is up to the specific encryption method used.

### Bip44Derivation Table

This table represents a specific instance of a derivation level. We need this to represent the relation between a private key and a public key, and also need this to store whether or not a level is hardened.

Note: This allows our storage to represent any combination of hardened & unhardened levels for a wallet and not just the one recommended by bip44.

#### Bip44DerivationMapping Table

This allows us to keep track of how many derivation levels are used and associate an index with them.

### ConceptualWallet Table

This allows us to decouple the concept of wallets from Bip44 in the storage layer. This is important because in the future not all wallets will be related to bip44 (ex: some parts of staking are totally independent from your Bip44 wallet but they should still stored somewhere).

Note: we need to add “CoinType” to conceptual wallet in order to make the storage layer be able to support multiple currencies. You could infer this information IF a conceptual wallet contained a Bip44Purpose and then checking which index is used for the CoinType derivation, but this is not guaranteed to be the case (especially in the case of adhoc wallets). Additionally, we have no guarantee a conceptual wallet will be tied to something that uses Bip44 at all so we can’t resolve this by just enforcing the presence of a Bip44Purpose

Note: NetworkId is in the conceptual wallet even though you actually only need to know the protocol magic for when you derive an address. The tradeoff is between the two following behaviors:

1. Associate ProtocolMagic with address only: when user switches to testnet, all their wallets, accounts, etc. stay exactly the same but all their addresses & transactions change
1. Associate ProtocolMagic with ConceptualWallet: when user switches to testnet, all their wallets are placed by their testnet wallets. When they switch back to mainnet, all their original wallets are brought back just how they left them

### PublicDeriver Table

This allows every conceptual wallet to hold many adhoc derivations (which should be all of the same derivation level) and is a convenient place to hold settings to avoid duplicating the same setting across a whole derivation chain.

Note: NetworkId is not part of PublicDeriver but Version is
This is because Version is specific to Bip44 derivation but NetworkId is not (other wallet types we add in the future may not have versions or have their own version scheme)

Note: The Bip44DerivationId should NOT point to Bip44Purpose. Instead, it should point to the level you care about holding settings for and showing in the UI. and then populate the parent field in the DerivationMapping to add the parents

Note: LastBlockSynced is required for light wallets because we don’t want to constantly be syncing every ConceptualWallet the user has (too much bandwidth). Instead, we only sync the AdHocDerivation that the user has selected at the moment.

### Bip44Chain Table

Note: Rust codebase and Bip44 talk of “chain” as a boolean: \
0: External \
1: Internal

However, here we represent this implicitly through the index with respect to the parent (as an integer). This allows us to follow the convention when using a derived wallet with an Account table while allowing for multiple chains in the adhoc chain case (If you were to add a specific “IsInternal” field to the table instead, this wouldn’t make sense in the adhoc case)

LastReceiveIndex allows us to keep track of how many addresses to show on the receive page inside the application (instead of showing the full 20 addresses mandated by bip44). Is is nullable as bip44 only mandates this behavior on external chains.

#### Change address selection

The storage spec doesn't enforce anything for the change address. Note that in the adhoc chain and adhoc address case, we can't even tell what should be the change address and must rely on external input.

### Address Table

Address in table may not belong to the user at all. Notably, all addresses in the transaction history for the wallet are part of the Address table (even if the input came from a different wallet). Similar, Shelley introduces some addresses for keys that are not linked to bIp44 wallets.

Having the Address table generically usable also makes our spec more robust to change. For example, Cardano v3 addresses contain more information such as “address kinds”. These can be added in the future by creating a new table and associating kinds to address table entries.

### EpochLength and CardanoNetworkStart tables

Represents starting at which block number the epoch length changes and the new length. This is needed as the number of slots per epoch isn’t fixed so converting between the two representations requires a lookup.

Note: Number of slots per epoch can also change depending on which network you connect to or which which side chain you connect to

Additionally, we store the start time of the network. Each slot in Cardano is a specific amount of time so knowing this allows us to get a concrete time for each slot.

### Transaction Table

There are two ways to store blocks number

1. epoch and slot
1. absolute block number

(1) allows us to easily query for a given epoch (which might simplify code for query staking info) \
(2) is simpler because then we can easily sort on a single field instead of on two. \
Note: Yoroi legacy storage uses (2)

Note: We use block number instead of date because “date” can change depending on which node you connect to

Note: Transactions are linked to wallets indirectly through addresses.

Note: You can infer the fee by (input - output)

Note: We don't store raw transaction body. This must be provided externally if required.

Note: although UTXO can be derived from the Inputs + Outputs and maintained in memory, this can lead to longer app start times for large wallets so it’s better to store this.

#### Error status

We optionally store `ErrorMessage` but this should only be used if the API layer does not recognize the error code received by the server.

### UtxoTransactionInput / UtxoTransactionOutput tables

Note: `Amount` is explicit in the input even though when the input belongs to yourself, you can know the value by just looking up the value of the UTXO from the TransactionOutput table. This is because in the light client case, you can’t know the input amount when the input belongs to somebody else.

### PrivateKey Table

These aren’t available for
1. Hardware wallets
2. Address checkers

### Bip44Wrapper Table

This table allows us to decouple settings for a Bip44 wallet from the ConceptualWallet. Necessary to support non-UTXO wallets.

Note: although we don’t need to enforce that all the derivations associated to a conceptual wallet are of the same derivation level, this spec enforces this with a `PublicDeriverLevel` field that specifies the derivation level for the wallet. Allowing varying levels could make for a confusing UX and more importantly it would be slower because to detect what derivation level to display on a wallet UI, you’d have to try and union the Bip44DerivationId with every table to see which matches for each PublicDeriver.

Note: having Version inside this table and not ConceptualWallet allow adhoc derivation to have different versions within the same ConceptualWallet. This is possible undesirable,

### Separation of PrivateDeriverLevel and PublicDeriverLevel

PrivateDeriverLevel points to which key level to use when the user wants to generate a new account.
PrivateDeriverLevel can also be inferred (by searching through parent indices) but explicitly adding them significantly speeds up and simplifies the usage.

Say your wallet is PrivateDeriverLevel = root, PublicDeriverLevel = account.
Note: you may think we can combine these into a single pointer to a single level (i.e. make the PublicDeriverLevel = root). This is not possible because by Lemma 1, a root public key cannot derive an account public key (which you need to derive addresses) if hardened addresses are used (which is typically the case for account level as suggested by bip44 and is in practice used by hardware wallets and Yoroi).
Note: Yoroi actually uses PrivateDeriverLevel = root, PublicDeriverLevel = account

Note: Setting PrivateDeriverLevel to null means that this wallet is an Adhoc wallet and not a Derived wallet.

Note: You should always have PublicDeriverLevel >= PrivateDeriverLevel because of the following: \
Suppose PublicDeriverLevel < PrivateDeriverLevel \
Ex) \
PublicDeriverLevel: Account \
PrivateDeriverLevel: Chain

1. If the chain is a hard-derivation, then by Lemma 1, a hard derivation index (the chain) cannot be soft derived with the public key (the account) so you wouldn’t get a correct wallet state for this setup
2. If chain is unhardened, then by Lemma 2, you can use what you know to generate the private key for account (and therefore used it as the PrivateDeriverLevel)

### SignerLevel

We separate SignerLevel from PrivateDeriverLevel because there are two main cases we want to allow:
1. SignerLevel == PrivateDeriverLevel - This is how Yoroi currently works which means for all accounts you use the same spending password.
2. SignerLevel == PublicDeriverLevel - This allows (for example) every account to have its own password. Note this is required for adhoc wallets.

Allowing any level instead of using a boolean between the two above cases may be useful in multi-currency wallets where every currency can have a different spending password for example

Note: SignerLevel == null means EITHER this is a readonly wallet OR the signing key is stored externally (ex: hardware wallets)

Note: SignerLevel > PublicDeriverLevel is an invalid configuration

Note: SignerLevel == null implies PrivateDeriverLevel == null

### IsBundled

To explain this, imagine you have an ad-hoc addresses wallet.

When you send a transaction, should a transaction consider all addresses as possible inputs, or only addresses individually?
Similarly, should we show the transaction history with all addresses merged together or an independent transaction history per address? Some users may want this for adhoc address wallets but for everything else maybe it's not useful.
Note: for cases like accounts, we explicitly don’t want these to be considered bundled (in fact, bip44 requires it).

Note: in the IsBundled case, all private keys required have to be either unencrypted OR encrypted with the same password

Note: in the IsBundled case, every new adhoc derivation you add, you have to completely refresh the transaction history UI because any address previously deemed not to be yours may suddenly be considered yours.
