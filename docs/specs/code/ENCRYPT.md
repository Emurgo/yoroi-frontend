# Abstract

Described how to encrypt data using a password - notably we care about encrypting keys in the case they have to be stored on disk.

# Motivation

We need a specification for encryption used in Yoroi so that

1) We can reference it in other specifications that need to access an encryption functionality ("encrypt in the same way mentioned in the encryption spec")
2) So that other wallets can implement the same encryption scheme for better ecosystem compatibility (ex: export your master key from one wallet and import it in another)
3) We can easily explain to engineers how the encryption works

# Related Specifications

## HMAC-SHA512

HMAC [[RFC 2104](https://tools.ietf.org/html/rfc2104)] takes a password and a hash function (in this case, SHA512 [[RFC 6234](https://tools.ietf.org/html/rfc6234#section-4.2)]) and computes the hash of the password in a way that is secure against attacks that work against the naive solution such as [length extension attacks](https://en.wikipedia.org/wiki/Length_extension_attack).

## PBKDF2 [[RFC 8018 - PKCS#5 section 5.2](https://tools.ietf.org/html/rfc8018#section-5.2)]

PBKDF2 is a way to recursively compute a hash function for a specified number of iterations to obtain a new key of a specified length.

## ChaCha20Poly1305 [[RFC 8439](https://tools.ietf.org/html/rfc8439)]

ChaCha20 is a cipher (algorithm for encrypting/decrypting)

Poly1305 is [MAC]((https://en.wikipedia.org/wiki/Message_authentication_code)) (can check authenticity and integrity of a message)

ChaCha20Poly1305 combines these together to give an algorithm that both encrypts the data and allows to check authenticity and integrity of a result (satisfied [AEAD](https://en.wikipedia.org/wiki/Authenticated_encryption#Authenticated_encryption_with_associated_data_(AEAD)))

# Proposal

### Encryption

1) Call `PBKDF2` with
    1) `HMAC-SHA512` applied to a user-provided password as the Pseudo-Random Function
    1) A randomly-initialized 32-byte array as the salt
    1) `19162` iterations
    1) Key size of 32 bytes
1) Call `ChaCha20Poly1305` encrypt with
    1) Result of `PBKDF2` as the key
    1) A randomly-initialized 12-byte array as the nonce
    1) Tag size of 16 bytes
1) Return a byte array representing the concatenation of
    1) The salt
    1) The nonce
    1) The MAC from `ChaCha20Poly1305`
    1) The encrypted byte array from `ChaCha20Poly1305`

### Decryption

1) Deconstruct the byte array returned from encryption
1) Construct the key using `PBKDF2` same as when doing encryption
1) Call `ChaCha20Poly1305` decrypt and check if tag matches

# Reference implementation

- [encryption](https://github.com/input-output-hk/js-cardano-wasm/blob/master/cardano-wallet/src/lib.rs#L1430)
- [decryption](https://github.com/input-output-hk/js-cardano-wasm/blob/master/cardano-wallet/src/lib.rs#L1474)
