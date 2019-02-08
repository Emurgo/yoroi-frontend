# "Hashigo44" - single-interaction single-parallel-ratchet 44bit evolving client-side "2FA" private key encryption (Proof of owning the same secret on another device)

## About

### Abstract

This spec describes how we can implement "2FA" authentication for desktop Yoroi, using mobile Yoroi as the authentication device. This "2FA" is actually can be called like this, because it includes actual second-layer encryption of the private key on the desktop Yoroi, which only can then be decrypted via the same private key on the mobile device (or any other device, technically). The critical part - is proving that you possess and have full access to the same secret key on another device, without actully exposing it. At the same time the desktop private key is encrypted with additional layer of security (apart from the password) for the whole time - hence the "2FA".

### Name explanation

#### Single-interaction

Because this scheme requires only a single initial **one-way** direct exchange of data in order to initiate the "binding seed" on both sides, that is then used in the non-interactive mode, where devices don't require direct data-exchange, **apart** from the "2FA"-component itself, where user enters the secret message every time they want to send a transaction (or use the private key in any other way).

#### Single-parallel-ratchet

After the initial binding interaction both sides set-up the single KES-ratchet, which is used in the matching way on both sides which allows devices to arrive to a deterministic shared key-scheme in the non-interactive way.

#### 44bit

We describe using of 44-bit long pseudo-random passwords to encrypt the private key on the desktop side. This values might be easily increased, but it would be a trade-of on the ease of use. Our proposal is to generate 44 bits of randomness and use english bip39 dictionary to select 4 words, **without any checksum validation**, because it is not necessary in this particular case when "mnemonic phrase" is short and when wrong combination would be apparent by failure to decrypt the private key.

#### Evolving

We describe the scheme in which the password, used to encrypt the desktop private key is changed (evolved) after every use. This is required by the fact that, by design, we cannot store any additional secret (without the same 2FA protection) on the desktop reliably, under the assumtion that client spending password is already compromised (the whole point for the "2FA"). This means that the "2FA" code that user reads off the auth-device IS the second private-key password. And if we would use static key-schema - losing a single "2FA" code would mean the private key is compromised again. So the proposal is to encrypt the private key with a new password after every time is it used.

#### Client-side

Proposed scheme is fully compatible with the client-side based Yoroi architecture and does not require any remote interactions with a server or something.

#### Private key encryption

"Regular" shared-secret 2FA (e.g. google-auth) is of course completely incompatible with our client-side based Yoroi architecture, because it implies storing the shared secret in some secure way (like on a closed backend server) and then just using this secret at any time to generate a matching message, and thus verify the user input.

We cannot afford it, as mentioned, because as we are talking about the second-factor - we are constantly operating under the assumption that user-password is already compromised, so in our case:
1. The private key can be the only actual shared secret
2. The private key on the desktop side needs to have two-level encryption

Which means that our scheme describes the way to have symmetric shared-secret cryptography where one side has its shared secret encrypted with exactly this shared-secret cryptography for which the encrypted secret is used.

<img src="https://user-images.githubusercontent.com/5585355/52449639-1ebfbd00-2b49-11e9-97d7-104d9ae506d3.png" width="300" />

## The proposal

### Idea

Two devices with a shared key: desktop (D) - assumed to be less secure and requires 2FA; and mobile (M) - assumed to be more secure and already has secure storage and 2FA with biometrics.

Devices use single initial one-way interaction (thru user) where they share any random number (44 bit) - the ratchet seed. And after this D derives a hash from this random number **and** the private key, and uses 44 bits of the resulting hash as the password to encrypt the key, and then also encrypts the result with the usual password. Any information about the ratchet seed is forgotten. Now D is two-level encrypted and cannot be used until two passwords are provided. M just remembers the ratched seed number and does nothing so far.
