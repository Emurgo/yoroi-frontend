# Abstract

Add a feature to migrate V2 derivation schemes to an existing Yoroi wallet

# Motivation

Users may want to migrate:
- a wallet that exists in another application to Yoroi
- a Yoroi wallet to a Hardware wallet
- an existing Yoroi wallet to another Yoroi wallet

# Background

Currently Yoroi only supports a single wallet. 

Suppose a user has a wallet A and wants to create a new wallet B and transfer all their funds.
They would need to
1) Delete their wallet A
1) Create wallet B and save the receiving address somewhere
1) Delete wallet B
1) Restore wallet A
1) Send all funds to B
1) Delete wallet A
1) Restore wallet B

This is a very poor user experience -- especially if a user is trying to migrate to a hardware wallet.

# Proposal

## Easiest implementation (Selected)

We introduce a `Migrate Yoroi wallet` feature similar to the `Migrate Daedalus` wallet feature by simply copy pasting code. 

To do this from the `frontend` point-of-view, the only hard part is coming up with an icon. Here is a draft for a possiblity I made.

![image](https://user-images.githubusercontent.com/2608559/48978256-1fb98480-f0ec-11e8-8e4a-3cad7e81e542.png)

I think we need to change the Daedalus migration since
- The current icon is not clear what it is supposed to do 
- Helps contrast with the Yoroi → Yoroi option

However, Yoroi → Yoroi is possibly doesn't convey the right message since you would be able to use this feature for any wallet that uses the V2 address scheme. Therefore we may want to use more generic icons such as

![image](https://user-images.githubusercontent.com/2608559/48978357-cbaf9f80-f0ed-11e8-8f2c-029c2ef7d138.png)

## Slightly more complicated implementation

Instead of having two migrate features, we have a single migration feature instead. Depending on the length of the mnemonic, we judge whether or not the wallet is a Daedalus wallet. The problem is it may be less clear for the user this is how to migrate Daedalus wallets. 

## Pre-requesite

The `send all` feature in the Rust library (to send the user's entire balance with no change address) needs to be ported to also work with V2 derivation scheme addresses. 
