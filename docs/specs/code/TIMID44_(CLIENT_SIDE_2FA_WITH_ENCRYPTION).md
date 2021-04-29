# "Timid44" - single-interaction single-symmetric-ratchet 44bit evolving client-side "2FA" private key encryption protocol (Proof of owning the same secret on another device)

## About

### Abstract

This spec describes how we can implement "2FA" authentication for desktop Yoroi, using mobile Yoroi as the authentication device. This "2FA" is actually can be called like this, because it includes actual second-layer encryption of the private key on the desktop Yoroi, which only can then be decrypted via the same private key on the mobile device (or any other device, technically). The critical part - is proving that you possess and have full access to the same secret key on another device, without actually exposing it. At the same time the desktop private key is encrypted with additional layer of security (apart from the password) for the whole time - hence the "2FA".

### Name explanation

#### Timid

Protocol is called so because we have the private key on the main party being kinda hidden (encrypted) by itself, and then it only can be unlocked with participation of another copy of the same key. So key is locked by itself, and only can be unlocked back by itself too )

#### Single-interaction

Because this scheme requires only a single initial **one-way** direct exchange of data in order to initiate the "binding seed" on both sides, that is then used in the non-interactive mode, where devices don't require direct data-exchange, **apart** from the "2FA"-component itself, where user enters the secret message every time they want to send a transaction (or use the private key in any other way).

#### Single-symmetric-ratchet

After the initial binding interaction both sides set-up the single KES-ratchet, which is used in the matching way on both sides which allows devices to arrive to a deterministic shared key-scheme in the non-interactive way.

#### 44bit

We describe using of 44-bit long pseudo-random passwords to encrypt the private key on the desktop side. This values might be easily increased, but it would be a trade-of on the ease of use. Our proposal is to generate 44 bits of randomness and use english bip39 dictionary to select 4 words, **without any checksum validation**, because it is not necessary in this particular case when "mnemonic phrase" is short and when wrong combination would be apparent by failure to decrypt the private key.

#### Evolving

We describe the scheme in which the password, used to encrypt the desktop private key is changed (evolved) after every use. This is required by the fact that, by design, we cannot store any additional secret (without the same 2FA protection) on the desktop reliably, under the assumption that client spending password is already compromised (the whole point for the "2FA"). This means that the "2FA" code that user reads off the auth-device IS the second private-key password. And if we would use static key-schema - losing a single "2FA" code would mean the private key is compromised again. So the proposal is to encrypt the private key with a new password after every time it is used.

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

### "Timid44" (same wallet on both devices)

Two devices with a shared key: desktop (D) - assumed to be less secure and requires 2FA; and mobile (M) - assumed to be more secure and already has secure storage and 2FA with biometrics. User has the same wallet restored on both devices, so D and M assumed to have a shared secret (private key).

Devices use single initial one-way interaction (thru user) where they share any random number (44 bit) - the ratchet seed. And after this D derives a hash from this random number **and** the private key, and uses 44 bits of the resulting hash as the password to encrypt the key, and then also encrypts the result with the usual password. Any information about the ratchet seed is forgotten. Now D is two-level encrypted and cannot be used until two passwords are provided. M just stores the ratchet seed under some name (S) and optionally encrypted, and does nothing.

Next time when user tries to send a transactions from the D - they enter their usual spending password, when D decrypts the key - it detects that it's encrypted with the second level, and asks user to enter the second password (44 bit). At this point user opens M and selects the previously stored S, and clicks "generate next key" - now M asks user for their usual spending password, decrypts the local private key, and **performs the same matching operation** by deriving the hash of the ratchet seed **and** the private key, and then takes the same 44 bit of the result and uses english bip39 disctionary to display user 4 mnemonic words (no checksum validation is involved). User enters the 4 words into the D, which turnes them back into the 44 bit password (P) and uses it to decrypt the key, and send the transaction. At this short period of time D has access to the private key, and it creates the hash of the private key **and** the P, and then uses 44 bit of the result as the next password (P'), to encrypt the key again, and then second-encrypt it back with the spending password, and store it in the storage. M at this point **stores the generated key P** and does nothing else.

When user wants to send next transaction - they enter spending password again, D again detects the second-level decryption and asks the user for the 4-word password. User opens M, selects binding S and clicks "generate next key" and enters their spending password, at which point M now takes the hash of the private key and **P** - the previously generated key, and produces new 4-word password P'. D again decrypts private key with the P' and uses hash of private key **and** P' to produce next password (P'') and encrypt the private key again.

If user loses access to M - they have no way to access the same instance of D, they should immediatelly re-restore the wallet from the full mnemonics, and move funds to a new safe wallet. If user loses access to D - they are basically now secured by their spending password and additional 44 bits of a password, which is not **ideal**, so they should immediatelly use the mobile instance of the same wallet to move their funds to a new safe wallet.

So in this protocol we have a "timid private key" that locks itself away from everyone else.

![image](https://user-images.githubusercontent.com/5585355/52477905-a393f080-2bb4-11e9-8691-2e213e1651b8.png)

### "Timid44ES" (without the same wallet on mobile)

So the original "Timid44" implies the initial setup where both parties already have a shared secret. This setup is super convinient to work with, but we might want to not force users to necessarily have the same wallet restored on mobile, in order for the 2FA to work. For case like this we introduce sub-protocol called **"Timid44ES"** ("External Secret"), which requires double initial interaction.

In this protocol we assume existence of the same desktop setup (D) with a wallet we want to protect with 2FA, and a mobile client (M), which provides special functionality, but does not have the same wallet restored in it (and does not require it). This setup is a bit weaker, because now we need to also establish the initial shared secret, in order for the main protocol to work, but it is tolerable, because it is done thru the user in our case, and not thru a compromised network.

So when user decides to initiate the desktop 2FA thru a mobile client without having a shared secret - user opens the M and initiates a new "2FA binding". At this point M generates 44-bit 4-word bip39 secret and displays it to the user. User initiates the "2FA binding" on D (for existing wallet) - and it asks him to enter the 4-word secret. When user enters the secret - we basically end up in a setting somewhat similar to the original "Timid44", **but** with this custom secret being shared, instead of the private key itself (private key we have **only** on D now), so the following protocol is **basically** the same but with some changes which we will describe exclusively.

So D now generates back the 44-bit 4-word **ratched seed**, and user now enters it back into M. Now we have this setup:

| Desktop       | Mobile            |
|---------------|-------------------|
| Shared secret | Shared secret     |
| Ratchet key   | Ratchet key       |
| Private key   |                   |

So what D now does is gets the hash of the secret **and** the ratchet key, and uses 44 bits of the resulting hash as the password to encrypt **the tuple of `(secret, private key)`**, and then the result is encrypted with the spending password, and the ratchet key is forgotten. So D now still has a single secret it needs to store, but this secret containes both the actual private key **and** the custom secret, which makes them both 2FA-protected. At this point M just stores the (secret, ratcher-key) pair with a password. When user calls M to "Generate Next Key" - it asks for the password and then runs the same procedure of getting a hash of secret **and** the ratchet key, and then generates a 4-word phrase (P) using the 44-bits of the result, which can be used to decrrypt the `(secret, private key)` tuple on D. After this hash of the secret **and** the P is used to get the 44 bits of the next key.

So in this protocol we have a "timid external secret" which also takes the private key along, when it locks itself.

**Note:** that in this scheme we still have the evolving "ratched key" (second interaction from D to M), but static secret (similar to static private key), even tho the secret is custom and meaningless in this case. But it is simpler to have it consistent with how the original protocol works.

![image](https://user-images.githubusercontent.com/5585355/52478125-6a0fb500-2bb5-11e9-95ea-4a24bdf1cd55.png)

## Tech-spec

In this section we will describe a detailed spec for the `TimidES`, because this version is an extension of the regular `Timid` which means that the regular version can be implemented by using the `ES` version, but NOT vice versa.

### Encryption bits

Further we will always refer to the protocols as Timid and TimidES without specifying the exact number of encryption bits, just because it's not a protocol-critical value and every implementation or application can use whatever value they deem the best, or even make it a configurable setting.

The only thing to remember is that we will describe the value as always being `11*N` bits, where `N` is the number of BIP39 mnemonic **words**. We use and describe mnemonics because protocol implies relatively long "arbitrary" numeric values being passed via user reading/typing. Implementors might choose any alternative schemes of encoding that might not require the 11-divisibility. It does not affect the scheme.

For the clarity of this value being an open variable - in the technical spec we will always denote it as `BITS`

```
BITS = the bit-length of the generated (evolving) encryption key 
``` 

### Terminology

#### TimidES operates with these values:   
1. Payload (PL) - the value that requires protection
2. Secret (S) - the static secret shared by both parties
3. Ratchet seed (K) - the initial key `K0` used to setup the ratchet on both sides
4. Ratchet key (Kn) - and iteration of the evolving key used for the encryption  
5. Secret body (B) - the combined message body, prepared to be hidden
6. Encrypted secret body (BE) - the combined message body, hidden under Timid
7. Counter (n) - Evolving key iteration counter

(Regular Timid is implemented on top of TimidES just by using the wallet private key as `S` and making `PL` empty.)

#### Parties

1. Desktop (D) - the party that holds the `PL` and needs it protected
2. Mobile (M) - the party that is assumed to be more secure than `D`
3. User (U) - the party that facilitates the interaction between `D` and `M`, **assumed to be secure** and able to transfer messages.

(Note: the names are used just for the sake of clarity in accordance to the default setting of our wallets, but this protocol might as well be implemented in a setting where the same roles are executed by parties that has nothing to do with desktops, or mobiles, or real human users.)

### Functions 

This section lists all the functions required to implement TimidES, format is:
```
<party>:: <function>(<arguments>): <result>
  1. Function operations
  ...
```

Parties implementing functions are `D` and `M`, while `U` is the "caller" party, and calling algorithms are described later.

```
M::init_secret( id, password ): Words(S)
  1. Generate S of length >= BITS (mod 11)
  2. SE = encrypt(S, password)  
  3. Store local: (id, SE)
  4. Return: Words(S)
```  

```
D::init_binding( S, PL ): ( Words(K), Timid(n, BE) )
  1. Generate K of length >= BITS (mod 11)
  2. Kn = key( K, S )
  3. B = body( S, PL )
  4. BE = encrypt(b, Kn)
  5. Return: ( Words(K), Timid(1, BE) )
```

```
E::init_binding( id, K ): ()
  1. Read local: (id) -> (_, SE)
  2. Assert: (SE)
  3. Store local: ( id, K, SE, 0 )
```

```
E::next( id, password ): ( Words(Kn), n )
  1. Read local: (id) -> ( _, K, SE, n )
  2. Assert: (SE)
  3. S = decrypt(SE, password)
  4. Kn = key( K, S )
  5. Store local: ( id, Kn, SE, n+1 )
  6. Return: ( Words(Kn), n+1 )
```

```
D::next( Timid(n, BE), Kn, n2 ): ( S, PL, Timid(n, BE) )
  1. Assert: (n == n2) // Or key iteration error 
  2. B = decrypt(BE, Kn)
  3. Assert: validate(b) // Or key error
  4. ( S, PL ) = debody(b)
  5. Kn2 = key( Kn, S )
  6. BE2 = encrypt(b, Kn2)
  7. Return: ( S, PL, Timid(n+1, BE) )
```

```
::key( Kn, S ): Kn
  1. h = hash( Kn || S )
  2. Kn2 = right_bits( h, BITS )
  3. Return: Kn2
```

```
D::body( S, PL ): B
  1. B = "timid:" || hex(S) || ":" || hex(PL)
  2. Return: B
```

```
D::debody( B ): ( S, PL )
  1. ( _, s, pl ) = split( B, ":" )
  2. Return: ( unhex(s), unhex(pl) )
```

```
D::validate( B ): bool
  1. v = starts_width( B, "timid:" )
  2. Return: v
```

Where:
- `Words` is the class implementing user-friendly conversion with BIP39 mnemonics.
- `encrypt/decrypt` is any symmetric cryptography function of choice
- `right_bits(a,b)` takes any value and returns `b` last bits of it
- `hash` is any hashing function with result size of `>= BITS`

## UX

TODO

### Numbered chain

TODO
