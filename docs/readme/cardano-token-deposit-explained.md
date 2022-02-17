# Cardano Token Deposit Explained

## Intro

Storing any assets on the Cardano blockchain "costs" some money, but you are not actually paying them to anyone, instead you are just depositing them as a collateral to ensure that you have some motivation to not leave lots of worthless assets just lying around forever and forget about them.

For example, at the moment it takes at least ~1 ADA to store any ADA, which might sound weird, but in reality it just means that you cannot send any amount less than 1 ADA (for now, but it can be changed at any moment as a simple protocol parameter). This ensures that any non-empty wallet will have at least 1 ADA in it, which might be enough motivation to not just leave it there and rather get it out and send it into circulation.

Similar to that, storing any native tokens or NFTs requires having a minimum deposit of ADA and this number scales depending on how the assets are being stored in the wallet.

## "Storage boxes" analogy

Whenever someone else sends you a token or an NFT, you can imagine it as if you are receiving a separate new box with this token and some ADA in it. This is due to the Cardano blockchain having the UTxO technical model, more similar to Bitcoin and different from Ethereum. The received box is sitting in the wallet separately from all other boxes received previously, and the box is required to have enough ADA deposited to store the ADA itself and the token.

If you have received many NFTs or separate token transactions, your wallet has many separate small such boxes where each box has 1 NFT, for example, and enough ADA as a deposit for that NFT, for example 1.5 ADA. Any of these small boxes are not spendable by themselves, e.g. you cannot just send someone a 1.5 ADA box with an NFT, because the amount after paying the transaction fees might not be enough as the required deposit for a box like that.

This way, if you have received 20 NFTs as 20 separate boxes with 1.5 ADA in each box - Yoroi will display that you have ~30 ADA of **locked asset deposit**. So, for example, if you have 100 ADA in total and you see that you have 30 ADA of locked asset deposit - it might be **hard** to spend anything more than 70 ADA. Hard, but still possible, due to repackaging.

## "Repackaging"

The goods can be repackaged from existing boxes to new tighter boxes, though, and the main reason for it would be that storing multiple tokens together in the same box required **SMALLER** minimum deposit, than storing them separately. Storing a single NFT in a box might require 1.5 ADA for each one, but storing 5 NFTs together in one box might require ~3 ADA in total, instead of 7.5 ADA in 5 separate boxes.

This repackaging only can happen in a blockchain transaction, though, so it costs a fee to do it. This is why Yoroi is not doing any repackaging just on its own in the background until you send some transactions. But whenever you **do** send a transaction - a repackaging might happen, which will put your assets tighter together and therefore reduce the locked deposit value, which should not surprise you.

An example of such a reducing case would be if you have 100 ADA and 20 NFTs that you received all separately 1 by 1 - Yoroi will display that you have ~30 ADA of locked asset deposit. But then if you try to send 85 ADA - it might succeed, because then Yoroi will consider doing the repackaging and will estimate that putting all 20 NFTs together will only require ~10 ADA, so spending 85 ADA is fine. After this transaction you will see the deposit value going down from ~30 ADA to ~10 ADA and the total wallet balance is ~15 ADA now. But then next time trying to spend anything more than 4-5 ADA will not be allowed because all the NFTs are already packed together and cannot be repackaged anymore.

It is fairly complicated to make the final estimation of what would be the deposit when the NFTs are already all packed, until you actually try making that transaction, which is why Yoroi would have to display ~30 ADA deposit when the NFTs are all separate in individual boxes initially. And how exactly the repackaging should be done might also depend on user preferences and wallet settings.

But we are working on improving this process now as much as possible in next versions, so this deposit number should now become more and more useful. At the moment the main point is that when you see the **locked asset deposit** value in your wallet - know that it might be **hard or impossible** to reduce it and therefore you might get a **"Not enough funds"** error when trying to send a transaction not leaving enough ADAs in your wallet.

One additional feature that is being developed at the moment and is targeted to improve this process is allowing to combine multiple assets together to be sent in a single transaction, in case you want to send someone multiple NFTs at once or different tokens together. Once available, this not only will improve the user experience but will allow to send a lower ADA deposit along with those assets, because they will be sent in a single box together.

----
----

### References

For more technical details and the exact math plz check the IOHK document for "Min-Ada-Value Requirement" explanation: https://github.com/input-output-hk/cardano-ledger/blob/51c044cafa350bf6626a89d9b4cb3d4788aaae34/doc/explanations/min-utxo-alonzo.rst
