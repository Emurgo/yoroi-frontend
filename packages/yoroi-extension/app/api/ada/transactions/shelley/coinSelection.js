// @flow

import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import BigNumber from 'bignumber.js';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  cardanoValueFromRemoteFormat,
  cardanoValueFromMultiToken,
  multiTokenFromRemote,
} from '../utils';
import { MultiToken } from '../../../common/lib/MultiToken';
import { NotEnoughMoneyToSendError } from '../../../common/errors';

export type UtxoDescriptor = {|
  utxo: RemoteUnspentOutput,
  isPure: boolean,
  hasRequiredAssets: boolean,
  countExtraAssets: number,
  spendableValue: number,
  isCollateralReserve: boolean,
|}

function describeUtxoAssets(
  u: RemoteUnspentOutput,
  requiredAssetIds: Set<string>,
): {
  hasRequiredAssets: boolean,
  countExtraAssets: number,
} {
  if (requiredAssetIds.size === 0) {
    return {
      hasRequiredAssets: false,
      countExtraAssets: u.assets.length,
    }
  }
  return u.assets.reduce(({ hasRequiredAssets, countExtraAssets }, { assetId }) => {
    if (requiredAssetIds.has(assetId)) {
      return { hasRequiredAssets: true, countExtraAssets }
    }
    return { hasRequiredAssets, countExtraAssets: countExtraAssets + 1 };
  }, {
    hasRequiredAssets: false,
    countExtraAssets: 0,
  });
}

const ONE_ADA_LOVELACES = 1_000_000;

export function describeUtxos(
  utxos: Array<RemoteUnspentOutput>,
  requiredAssetIds: Set<string>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
): Array<UtxoDescriptor> {
  let collateralCompatibleCount = 0;
  return utxos.map((u: RemoteUnspentOutput): UtxoDescriptor => {
    const amount = RustModule.WalletV4.BigNum.from_str(u.amount);
    if (u.assets.length === 0) {
      const isCollateralCompatibleValue = new BigNumber(u.amount).lte(2_000_000);
      return {
        utxo: u,
        isPure: true,
        hasRequiredAssets: false,
        countExtraAssets: 0,
        spendableValue: parseInt(amount.to_str(), 10),
        isCollateralReserve: isCollateralCompatibleValue && ((collateralCompatibleCount++) < 5),
      }
    }

    const { hasRequiredAssets, countExtraAssets } =
      describeUtxoAssets(u, requiredAssetIds);

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
      countExtraAssets,
      isCollateralReserve: false,
      spendableValue: Math.floor(spendable / ONE_ADA_LOVELACES) * ONE_ADA_LOVELACES,
    }
  });
}

function utxoDescriptorSortBySpendableValueTopHigh(u1: UtxoDescriptor, u2: UtxoDescriptor): number {
  return u2.spendableValue - u1.spendableValue;
}

function utxoDescriptorSortByRandom(_u1: UtxoDescriptor, _u2: UtxoDescriptor): number {
  return Math.random() - 0.5;
}

export type UtxoDescriptorClassification = {|
  withOnlyRequiredAssets: Array<UtxoDescriptor>,
  withRequiredAssets: Array<UtxoDescriptor>,
  pure: Array<UtxoDescriptor>,
  dirty: Array<UtxoDescriptor>,
  collateralReserve: Array<UtxoDescriptor>,
|};

export function classifyUtxoDescriptors(
  descriptors: Array<UtxoDescriptor>,
): UtxoDescriptorClassification {
  const withOnlyRequiredAssets = [];
  const withRequiredAssets = [];
  const pure = [];
  const dirty = [];
  const collateralReserve = [];
  descriptors.forEach((u: UtxoDescriptor) => {
    if (u.hasRequiredAssets) {
      if (u.countExtraAssets === 0) {
        withOnlyRequiredAssets.push(u);
      } else {
        withRequiredAssets.push(u);
      }
    } else if (u.isCollateralReserve) {
      collateralReserve.push(u);
    } else if (u.isPure) {
      pure.push(u);
    } else {
      dirty.push(u)
    }
  });
  return {
    withOnlyRequiredAssets: withOnlyRequiredAssets.sort(utxoDescriptorSortBySpendableValueTopHigh),
    withRequiredAssets: withRequiredAssets.sort(utxoDescriptorSortBySpendableValueTopHigh),
    pure: pure.sort(utxoDescriptorSortByRandom),
    dirty: dirty.sort(utxoDescriptorSortBySpendableValueTopHigh),
    collateralReserve: collateralReserve.sort(utxoDescriptorSortBySpendableValueTopHigh),
  }
}

export function classifyUtxoForValues(
  utxos: Array<RemoteUnspentOutput>,
  requiredValues: Array<MultiToken>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
): UtxoDescriptorClassification {
  const requiredAssetIds = requiredValues.reduce((set, mt: MultiToken) => {
    mt.nonDefaultEntries()
      .map(v => v.identifier)
      .filter(id => id.length > 0)
      .forEach(id => set.add(id));
    return set;
  }, new Set<string>());
  const utxoDescriptors = describeUtxos(
    utxos,
    requiredAssetIds,
    coinsPerUtxoWord,
  );
  return classifyUtxoDescriptors(utxoDescriptors);
}

export function coinSelectionForValues(
  utxos: Array<RemoteUnspentOutput>,
  requiredValues: Array<MultiToken>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
  networkId: number,
): Array<RemoteUnspentOutput> {
  if (utxos.length === 0) {
    throw new Error('Cannot coin-select for empty utxos!')
  }
  if (requiredValues.length === 0) {
    throw new Error('Cannot coin-select for empty required value!')
  }
  const totalRequiredValue = requiredValues
    .reduce((mt1: MultiToken, mt2: MultiToken) => mt1.joinAddCopy(mt2));
  const totalRequiredWasmValue: RustModule.WalletV4.Value =
    cardanoValueFromMultiToken(totalRequiredValue);
  const totalRequiredDefaultAssetAmount = totalRequiredValue.getDefault();
  // Desired ADA amount is twice the required amount or at least the required plus 1 ADA
  const totalDesiredDefaultAssetAmount = BigNumber.max(
    totalRequiredDefaultAssetAmount.multipliedBy(2),
    totalRequiredDefaultAssetAmount.plus(ONE_ADA_LOVELACES),
  );
  const {
    withOnlyRequiredAssets,
    withRequiredAssets,
    pure,
    dirty,
    collateralReserve,
  } = classifyUtxoForValues(
    utxos,
    requiredValues,
    coinsPerUtxoWord,
  );
  // prioritize inputs
  const sortedUtxos: Array<RemoteUnspentOutput> = [
    ...withOnlyRequiredAssets,
    ...withRequiredAssets,
    ...pure,
    ...dirty,
    ...collateralReserve,
  ].map((u: UtxoDescriptor) => u.utxo);
  const resultUtxos: Array<RemoteUnspentOutput> = [];
  let aggregatedValue: ?MultiToken = null;
  let aggregatedWasmValue: RustModule.WalletV4.Value = RustModule.WalletV4.Value.zero();
  let requiredSatisfied = false;
  let utxoIndex = 0;
  for (; utxoIndex < sortedUtxos.length; utxoIndex++) {
    const utxo = sortedUtxos[utxoIndex];
    resultUtxos.push(utxo);
    const utxoValue: MultiToken = multiTokenFromRemote(utxo, networkId);
    aggregatedValue = aggregatedValue == null ? utxoValue
      : aggregatedValue.joinAddCopy(utxoValue);
    aggregatedWasmValue = aggregatedWasmValue.checked_add(cardanoValueFromRemoteFormat(utxo));
    const excessiveWasmValue = totalRequiredWasmValue.clamped_sub(aggregatedWasmValue);
    const minRequiredExcessiveWasmAdaValue: RustModule.WalletV4.BigNum =
      excessiveWasmValue.is_zero() ? RustModule.WalletV4.BigNum.zero()
        : RustModule.WalletV4.min_ada_required(excessiveWasmValue, false, coinsPerUtxoWord);
    if (!requiredSatisfied) {
      const remainingRequiredValue = totalRequiredValue
        .joinAddCopy(minRequiredExcessiveWasmAdaValue)
        .joinSubtractCopyWithLimitZero(aggregatedValue)
      requiredSatisfied = remainingRequiredValue.isEmpty();
      if (requiredSatisfied) {
        break;
      }
    }
  }
  if (!requiredSatisfied) {
    throw new NotEnoughMoneyToSendError();
  }
  return resultUtxos;
}