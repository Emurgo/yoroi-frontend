export const normalizeTokenId = (id?: string | null) => (id === '' ? '.' : id);

// import {CSL} from '@emurgo/cardano-serialization-lib-browser'

export const useGetInputs = (walletUtxos: any[]) => {
  const getInputs = async (amounts: { [tokenId: string]: string }) => {
    // const {csl, release} = getCSL()
    console.log('getInputs', {amounts, walletUtxos});
    try {
      const tokenId = Object.keys(amounts)[0];
      const requiredAmount = BigInt(amounts[tokenId]);

      const matching = walletUtxos
        .map(utxo => {
          const token = utxo.output.tokens.find(t => {
            return tokenId === '.' ? t.Token.Metadata.ticker === 'ADA' : t.Token.Identifier === tokenId;
          });

          return token
            ? {
                utxo,
                amount: BigInt(token.TokenList.Amount),
              }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => (a!.amount > b!.amount ? -1 : 1)) as {
        utxo: any;
        amount: bigint;
      }[];

      console.log('matching', matching);

      const selected: any[] = [];
      let total = 0n;

      for (const { utxo, amount } of matching) {
        selected.push(utxo);
        total += amount;
        if (total >= requiredAmount) break;
      }
      console.log('selected', selected);

      if (total < requiredAmount) {
        console.log('Not enough balance');
        // throw new Error('Not enough balance');
      }

      const inputs = await Promise.all(
        selected.map(async u => {
          const txHash = u.output.Transaction.Hash;
          const index = u.output.UtxoTransactionOutput.OutputIndex;

          console.log('txHash', txHash, 'index', index);
          //   const receiver = CSL.Address.from_bytes(Buffer.from(u.address, 'hex')).to_bech32()

          //   const input = csl.TransactionInput.new(
          //     csl.TransactionHash.fromHex(txHash),
          //     index,
          //   )

          //   const value = csl.Value.new(csl.BigNum.from_str('0'))

          //   for (const token of u.output.tokens) {
          //     const amt = csl.BigNum.from_str(token.TokenList.Amount)

          //     if (token.Token.Metadata.ticker === 'ADA') {
          //       value.set_coin(amt)
          //     } else {
          //       const policyId = csl.ScriptHash.fromHex(
          //         token.Token.Metadata.policyId,
          //       )
          //       const assetName = csl.AssetName.new(
          //         Buffer.from(token.Token.Metadata.assetName, 'hex'),
          //       )

          //       const multiasset = value.multiasset() || csl.MultiAsset.new()
          //       const assets =
          //         multiasset.get(policyId) || csl.Assets.new()
          //       assets.insert(assetName, amt)
          //       multiasset.insert(policyId, assets)
          //       value.set_multiasset(multiasset)
          //     }
          //   }

          //   const output = csl.TransactionOutput.new(
          //     csl.Address.from_bech32(receiver),
          //     value,
          //   )

          //   const utxo = csl.TransactionUnspentOutput.new(input, output)
          //   return Buffer.from(utxo.to_bytes()).toString('hex')
        })
      );

      return inputs;
    } finally {
      //   release()
    }
  };

  return { getInputs };
};
