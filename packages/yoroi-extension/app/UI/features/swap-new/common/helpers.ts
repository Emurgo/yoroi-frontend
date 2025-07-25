import { RustModule } from '../../../../api/ada/lib/cardanoCrypto/rustLoader';
export const normalizeTokenId = (id?: string | null) => (id === '' ? '.' : id);

export const useGetInputs = (walletUtxos: any[]) => {
  const getInputs = async (amounts: { [tokenId: string]: string }) => {
    try {
      const tokenId = Object.keys(amounts)[0];
      if (tokenId === undefined) {
        throw new Error('No tokenId provided in amounts');
      }
      const requiredAmount = BigInt(Number(amounts[tokenId]));

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

      const selected: any[] = [];
      let total = BigInt(0);

      for (const { utxo, amount } of matching) {
        selected.push(utxo);
        total += amount;
        if (total >= requiredAmount) break;
      }

      if (total < requiredAmount) {
        throw new Error('Not enough balance');
      }

      const inputs = await Promise.all(
        selected.map(async u => {
          const txHash = u.output.Transaction.Hash;
          const index = u.output.UtxoTransactionOutput.OutputIndex;

          const receiver = await RustModule.WalletV4.Address.from_bytes(Buffer.from(u.address, 'hex')).to_bech32();

          const input = RustModule.WalletV4.TransactionInput.new(RustModule.WalletV4.TransactionHash.from_hex(txHash), index);

          const value = RustModule.WalletV4.Value.new(RustModule.WalletV4.BigNum.from_str('0'));

          for (const token of u.output.tokens) {
            const amt = RustModule.WalletV4.BigNum.from_str(token.TokenList.Amount);

            if (token.Token.Metadata.ticker === 'ADA') {
              value.set_coin(amt);
            } else {
              const policyId = RustModule.WalletV4.ScriptHash.from_hex(token.Token.Metadata.policyId);
              const assetName = RustModule.WalletV4.AssetName.new(Buffer.from(token.Token.Metadata.assetName, 'hex'));

              const multiasset = value.multiasset() || RustModule.WalletV4.MultiAsset.new();
              const assets = multiasset.get(policyId) || RustModule.WalletV4.Assets.new();
              assets.insert(assetName, amt);
              multiasset.insert(policyId, assets);
              value.set_multiasset(multiasset);
            }
          }

          const output = RustModule.WalletV4.TransactionOutput.new(RustModule.WalletV4.Address.from_bech32(receiver), value);

          const utxo = RustModule.WalletV4.TransactionUnspentOutput.new(input, output);
          return Buffer.from(utxo.to_bytes()).toString('hex');
        })
      );

      return inputs;
    } catch {
      console.warn('Failed to get inputs');
    }
  };

  return { getInputs };
};
