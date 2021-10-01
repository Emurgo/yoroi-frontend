# Yoroi Cardano Coin Selection Explained

## Intro

**It is highly recommended to read this document about asset deposits as an intro: [Cardano Token Deposit Explained](./cardano-token-deposit-explained.md)**

The document linked above introduces a "storage boxes" analogy for UTxO blockchain systems (Cardano is one of these, like Bitcoin, and unlike Ethereum) and introduces the notion of "repackaging" the contents of some boxes into new different boxes, during a transaction sending.

This is crucial for the topic of **this** document to understand that ANY Cardano transaction is an act of such repackaging. No UTxO (or a "box of ADA and tokens") is ever "sent" anywhere in its unchanged form, once it has been created as belonging to your wallet (an address from your wallet) - it cannot change, it only can be destroyed for the contents to be repackaged.

So now you can always imagine your wallet as a storage unit with some boxes inside. Any time you receive a transaction, one (usually) new box with some ADA and maybe some tokens gets added to your unit. Any time you send a transaction, **SOME** of the boxes from your unit are opened up and destroyed and the contents are repackaged into new different boxes.

And this poses the crucial question: **WHICH** boxes out of your entire storage unit should be used for a specific transaction?

Just using all of them, or in the order as they came in, or always using biggest ones or smallest ones is not that great, all this is already covered in IOHK research that you can check out here (not required): https://iohk.io/en/blog/posts/2018/07/03/self-organisation-in-coin-selection/

But that research is only perfectly suitable for the case when your wallet has no other assets except the ADA itself, in reality the problem gets more complicated.

## Elements of coin selection

// todo