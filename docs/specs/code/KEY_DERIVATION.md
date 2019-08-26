# Abstract

We describe a key derivation scheme to generate purpose-specific private keys. We include an example use case for the memo feature in Yoroi.

# Motivation

We need a specification to describe a general-purpose scheme for generating private key chains which can be adapted for specific functionalities. For example, the memo feature in Yoroi needs to sign and encrypt memo data with different keys without asking the user for a password. To do so, we look for a method to derive new keys from the existing wallet's account keys but also in the case of the wallet providing only the public key of the account, like in hardware wallets, or even when the wallet does not provide keys at all (public or private), like in the case of *balance tracker* wallets.

# Background

[BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#Specification_Key_derivation) introduced the concept of a hierarchical deterministic (HD) wallet, a logical hierarchy structure built using child key derivation functions (CKD) that allows to generate multiple wallets from a master seed. 

![image](https://raw.githubusercontent.com/bitcoin/bips/master/bip-0032/derivation.png)

[BIP43](https://github.com/bitcoin/bips/blob/master/bip-0043.mediawiki) added a purpose field for derivations (derivation path) and [BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) introduced the concept of multi-account hierarchy deterministic wallets, defining 5 leves of derivation.

`m / purpose' / coin_type' / account' / change / address_index`

You can find a list of registered purposes [here](https://wiki.trezor.io/Cryptocurrency_standards). Yoroi is an example of a HD wallet following the BIP44 standard. Yoroi addresses use the following derivation path:

`m / 44' / 1815' / 0' / 0 / 1`

In this example derivation, the purpose is 44 (multi-account HD wallet), the coin type is 1815 (Cardano), the account index is 0 (first account), the change index is also 0, and the address index is 1 (second address in the account).

# Master seed and Private chain

There are three possibilites when considering the availability of the wallet account master key pair (which from now on we call the *account key pair*):

* **Standard Yoroi wallets**: Both the public and the private keys of the account key pair are available.
* **Hardware wallets**: Only the public key is available.
* **Balance tracker wallets**: No keys are available.

Based on the above, we identify two scenarios:

* **S1**: account public key is available
* **S2**: account public key is not available

In both cases, even if the account public key is available, we don't derive the child keys directly from the account as we don't want to conflict with any other derivations. We discuss each scenario in the following sections. 

## Public key is available

We create a new key pair from the account public key in the following way:

* Hash the account public key with `Blake2b` and specify an output length of 32 bytes.
* Use the above result as a seed to create a mnemonic: `bip39.entropyToMnemonic(blakeHash)`.
* Create entropy from the english mnemonic obtained in the previous step, using the Cardano WASM bindings: `RustModule.Wallet.Entropy.from_english_mnemonics(mnemonic)`.
* Create a new private key with the previous result: `RustModule.PrivateKey.new(entropy)`

The above generates a new **independent** key pair that doesn't share the same hierarchical structure for deterministic derivation with the account key pair. This means that the subsequent derivations in the private key chain will have the recently generated key pair as their master seed, with their own derivation path. However, the private key chain can be easily replicated from the account key pair, which is a major advantage if we need to repeat the private key chain creation in other instances of the same wallet.

## Public key is not available

If the account public key is not available we generate a random mnemonic by replacing the hash-based call with `bip39.generateMnemonic(160)`, where `160` stands for the bits of entropy. Notice that in this case the private key chain can not be replicated in other instances of the same wallet, as its seed is random.

# Key derivation

We apply the first derivation to specify the purpose of the keychain. In the case of the memo feature for Yoroi, we've chosen the purpose `190822` (date-based). The corresponding hexadecimal value for the chosen index is `2E966`, and to make it a [hardened index](https://bitcoin.org/en/wallets-guide#hardened-keys) we add the value `0x80000000` (so the index is greater than `2^31`). Then, we use the Cardano derivation scheme v2: 

```
privKey.derive(RustModule.DerivationScheme.v2(), 0x8002E966);
```

From now on, we derive based on the purpose of this new key chain. For example, for the memo feature we need to sign and encrypt data with different keys. Also, we might want to sign with different keys at a given point, in which case we would add the index of the key in the header of the signed message, so we call it the `header_index`. This leads us to the following derivation path:

```
m / 190822' /  sign_or_encrypt / header_index
```
