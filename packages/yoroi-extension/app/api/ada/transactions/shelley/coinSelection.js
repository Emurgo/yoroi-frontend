// @flow

import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import BigNumber from 'bignumber.js';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { cardanoValueFromRemoteFormat } from '../utils';

export type UtxoDescriptor = {|
  utxo: RemoteUnspentOutput,
  isPure: boolean,
  hasRequiredAssets: boolean,
  spendableValue: number,
  isCollateralReserve: boolean,
|}

export function classifyUtxos(
  utxos: Array<RemoteUnspentOutput>,
  requiredAssetIds: Array<string>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
): {|
  utxoDescriptors: Array<UtxoDescriptor>,
  collateralCompatibleCount: number,
|} {
  let collateralCompatibleCount = 0;
  const isAssetsRequired = requiredAssetIds.size > 0;
  const utxoDescriptors = utxos.map((u: RemoteUnspentOutput): UtxoDescriptor => {
    const amount = RustModule.WalletV4.BigNum.from_str(u.amount);
    if (u.assets.length === 0) {
      const isCollateralCompatibleValue = new BigNumber(u.amount).lte(2_000_000);
      return {
        utxo: u,
        isPure: true,
        hasRequiredAssets: false,
        spendableValue: parseInt(amount.to_str(), 10),
        isCollateralReserve: isCollateralCompatibleValue && ((collateralCompatibleCount++) < 5),
      }
    }
    const hasRequiredAssets = isAssetsRequired
      && u.assets.some(a => requiredAssetIds.has(a.assetId));

    // <TODO:PLUTUS_SUPPORT>
    const utxoHasDataHash = false;

    const minRequired = RustModule.WalletV4.min_ada_required(
      cardanoValueFromRemoteFormat(u),
      utxoHasDataHash,
      coinsPerUtxoWord,
    );
    const spendable = parseInt(amount.clamped_sub(minRequired).to_str(), 10);
    // Round down the spendable value to the nearest full ADA for safer deposit
    // TODO: unmagic the constant
    return {
      utxo: u,
      isPure: false,
      hasRequiredAssets,
      spendableValue: Math.floor(spendable / 1_000_000) * 1_000_000,
      collateralCompatibleIndex: null,
    }
  });
  return { utxoDescriptors, collateralCompatibleCount };
}

export class CoinSelection {

  constructor(utxos: Array<RemoteUnspentOutput>) {

  }
}