// @flow

import type { RemoteUnspentOutput } from '../../lib/state-fetch/types';
import BigNumber from 'bignumber.js';
import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import {
  cardanoValueFromMultiToken,
  cardanoValueFromRemoteFormat,
  createMultiToken,
  multiTokenFromRemote,
} from '../utils';
import { MultiToken } from '../../../common/lib/MultiToken';
import { NotEnoughMoneyToSendError } from '../../../common/errors';

// Not gonna be adding over 50 inputs in order to improve the tx ADA value
const TX_IMPROVING_INPUT_LIMIT = 50;

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
): {|
  hasRequiredAssets: boolean,
  countExtraAssets: number,
|} {
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

/**
 * The passed utxos are mapped and wrapped each into the `UtxoDescriptor` object
 * which contains the utxo itself and also fields describing the important properties of that utxo.
 */
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

/**
 * Function accepts a collection of utxo DESCRIPTORS (see `describeUtxos` function)
 * and returns a single classification object that sorts
 * and separates the utxos into multiple separate specialized collections.
 */
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

/**
 * Accepts a collection of utxos and the required total value.
 * Produces the classification of these utxos, according to the requirement.
 * Protocol parameter `coins_per_utxo_word` is also required as the third parameter.
 */
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

function joinSumMultiTokens(mts: Array<MultiToken>): MultiToken {
  if (mts == null || mts.length === 0) {
    throw new Error('Cannot process empty required values!')
  }
  // $FlowFixMe[incompatible-exact]
  return mts.length === 1 ? MultiToken.from(mts[0])
    : mts.reduce((mt1: MultiToken, mt2: MultiToken) => mt1.joinAddCopy(mt2));
}

function calculateMinRequiredAda(
  value: MultiToken,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
): BigNumber {
  const wasmValue = cardanoValueFromMultiToken(value);
  const minRequiredWasmAda: RustModule.WalletV4.BigNum =
    wasmValue.is_zero() ? RustModule.WalletV4.BigNum.zero()
      : RustModule.WalletV4.min_ada_required(wasmValue, false, coinsPerUtxoWord);
  return new BigNumber(minRequiredWasmAda.to_str());
}

export function takeUtxosForValues(
  utxos: Array<RemoteUnspentOutput>,
  requiredValues: Array<MultiToken>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
  networkId: number,
): {|
  utxoTaken: Array<RemoteUnspentOutput>,
  utxoRemaining: Array<RemoteUnspentOutput>,
|} {
  const totalRequiredValue = joinSumMultiTokens(requiredValues);
  const totalRequiredWasmValue: RustModule.WalletV4.Value =
    cardanoValueFromMultiToken(totalRequiredValue);
  let aggregatedValue: ?MultiToken = null;
  let aggregatedWasmValue: RustModule.WalletV4.Value = RustModule.WalletV4.Value.zero();
  let requiredSatisfied = false;
  let utxoIndex = 0;
  const utxoTaken: Array<RemoteUnspentOutput> = [];
  for (; utxoIndex < utxos.length; utxoIndex++) {
    const utxo = utxos[utxoIndex];
    utxoTaken.push(utxo);
    const utxoValue: MultiToken = multiTokenFromRemote(utxo, networkId);
    aggregatedValue = aggregatedValue == null ? utxoValue
      : aggregatedValue.joinAddCopy(utxoValue);
    aggregatedWasmValue = aggregatedWasmValue.checked_add(cardanoValueFromRemoteFormat(utxo));
    const excessiveWasmValue = aggregatedWasmValue.clamped_sub(totalRequiredWasmValue);
    const minRequiredExcessiveWasmAda: RustModule.WalletV4.BigNum =
      excessiveWasmValue.is_zero() ? RustModule.WalletV4.BigNum.zero()
        : RustModule.WalletV4.min_ada_required(excessiveWasmValue, false, coinsPerUtxoWord);
    if (!requiredSatisfied) {
      const remainingRequiredValue = totalRequiredValue
        .joinAddCopy(createMultiToken(
          minRequiredExcessiveWasmAda.to_str(),
          [],
          networkId,
        ))
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
  return { utxoTaken, utxoRemaining: utxos.slice(utxoIndex + 1) };
}

export function improveTakenUtxos(
  classification: UtxoDescriptorClassification,
  requiredValues: Array<MultiToken>,
  takenUtxo: Array<RemoteUnspentOutput>,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
  networkId: number,
): Array<RemoteUnspentOutput> {
  const {
    withOnlyRequiredAssets,
    withRequiredAssets,
    pure,
    dirty,
    collateralReserve,
  } = classification;
  const totalRequiredValue = joinSumMultiTokens(requiredValues);
  const totalRequiredWasmValue: RustModule.WalletV4.Value =
    cardanoValueFromMultiToken(totalRequiredValue);
  const totalRequiredADA = totalRequiredValue.getDefault();
  const newDesiredCollateralsCount = Math.max(5 - collateralReserve.length, 0);
  // Desired total ADA input is:
  const totalDesiredADA = totalRequiredADA
    .multipliedBy(2) // the required amount multiplied by two to create a similar pure utxo
    .plus(2 * ONE_ADA_LOVELACES) // plus 2 ada to make sure we cover fees
    .plus(newDesiredCollateralsCount * ONE_ADA_LOVELACES); // plus the required new collaterals
  const takenUtxoIdSet = new Set<string>(
    takenUtxo.map(u => u.utxo_id),
  );
  const improvedTakenUtxo = [...takenUtxo];
  function isManyUtxosAlready(): boolean {
    return improvedTakenUtxo.length >= TX_IMPROVING_INPUT_LIMIT;
  }
  let totalTakenWasmValue: RustModule.WalletV4.Value = cardanoValueFromMultiToken(
    joinSumMultiTokens(
      takenUtxo.map(u => multiTokenFromRemote(u, networkId)),
    ),
  );
  let minRequiredExcessiveAda: ?BigNumber;
  function updateTotalTakenValueAndReturnADA(
    utxo: ?RemoteUnspentOutput,
  ): BigNumber {
    if (utxo != null) {
      totalTakenWasmValue = totalTakenWasmValue.checked_add(cardanoValueFromRemoteFormat(utxo));
    }
    const excessiveWasmValue = totalTakenWasmValue.clamped_sub(totalRequiredWasmValue);
    const minRequiredExcessiveWasmAda = excessiveWasmValue.is_zero()
      ? RustModule.WalletV4.BigNum.zero()
      : RustModule.WalletV4.min_ada_required(excessiveWasmValue, false, coinsPerUtxoWord);
    minRequiredExcessiveAda = new BigNumber(minRequiredExcessiveWasmAda.to_str())
    return new BigNumber(totalTakenWasmValue.coin().to_str()).minus(minRequiredExcessiveAda);
  }
  {
    // Calculate total taken before making any changes and return in case already enough
    const totalTakenADA: BigNumber = updateTotalTakenValueAndReturnADA(null);
    if (totalTakenADA.gte(totalDesiredADA) || isManyUtxosAlready()) {
      return improvedTakenUtxo;
    }
  }
  for (const { utxo } of [
    ...withOnlyRequiredAssets,
    ...pure,
    ...withRequiredAssets,
    ...dirty,
  ]) {
    if (takenUtxoIdSet.has(utxo.utxo_id)) {
      // skip utxo if already taken
      continue;
    } else {
      // take and mark as taken otherwise
      improvedTakenUtxo.push(utxo);
      takenUtxoIdSet.add(utxo.utxo_id);
    }
    const totalTakenADA: BigNumber = updateTotalTakenValueAndReturnADA(utxo);
    if (totalTakenADA.gte(totalDesiredADA) || isManyUtxosAlready()) {
      return improvedTakenUtxo;
    }
  }
  return improvedTakenUtxo;
}

export function coinSelectionForValues(
  utxos: Array<RemoteUnspentOutput>,
  requiredValues: Array<MultiToken>,
  mustForceChange: boolean,
  coinsPerUtxoWord: RustModule.WalletV4.BigNum,
  networkId: number,
): {|
  selectedUtxo: Array<RemoteUnspentOutput>,
  recommendedChange: Array<MultiToken>,
|} {
  if (utxos.length === 0) {
    throw new NotEnoughMoneyToSendError();
  }
  const totalRequiredValue = requiredValues.length === 0
    ? createMultiToken(0, [], networkId)
    : joinSumMultiTokens(requiredValues);
  const classification = classifyUtxoForValues(
    utxos,
    [totalRequiredValue],
    coinsPerUtxoWord,
  );
  const {
    withOnlyRequiredAssets,
    withRequiredAssets,
    pure,
    dirty,
    collateralReserve,
  } = classification;
  /**
   * Classified utxo categories are organised to force the order of utxo taking.
   *
   * - Utxos with only required assets are spent first for obvious reasons,
   *   they are the best choice, when sending some assets. If the entire required amount can be
   *   satisfied by only this category - that is the perfect outcome.
   *
   * - Utxos with SOME required assets are spent as second priority. This is our own
   *   choice and the reasoning is that adding at least SOME of the required assets to the mix,
   *   even at the cost of adding some unrequired dirt, is better than spending precious pure utxos.
   *   It will give at least some side-effect improvement of grouping required assets together.
   *
   * - Pure utxos are spent after that, because it's the lowest cost addition out of what is left.
   *
   * - Dirty utxos that don't contain any of the required assets are added after that.
   *   This is a bad option, because it mixes in unrequired dirt into the transaction,
   *   without making any improvements, apart from the ADA value itself. Which is why
   *   this is the lowest priority non-critical category.
   *
   * - Collateral reserve is used as the last critical resort, this is the worst option,
   *   as the collateral reserve should normally never be spent at all.
   */
  const sortedUtxos: Array<RemoteUnspentOutput> = [
    ...withOnlyRequiredAssets,
    ...withRequiredAssets,
    ...pure,
    ...dirty,
    ...collateralReserve,
  ].map((u: UtxoDescriptor) => u.utxo);
  const { utxoTaken } = takeUtxosForValues(
    sortedUtxos,
    [totalRequiredValue],
    coinsPerUtxoWord,
    networkId,
  );
  const improvedTakenUtxo = improveTakenUtxos(
    classification,
    [totalRequiredValue],
    utxoTaken,
    coinsPerUtxoWord,
    networkId,
  )
  const totalExtraValue = joinSumMultiTokens(
    improvedTakenUtxo.map(u => multiTokenFromRemote(u, networkId)),
  ).joinSubtractCopyWithLimitZero(totalRequiredValue);
  const minRequiredAda =
    calculateMinRequiredAda(totalExtraValue, coinsPerUtxoWord);
  let availableExtraAda =
    totalExtraValue.getDefault().minus(minRequiredAda);
  const recommendedChange = [];
  {
    // Adding recommended collaterals
    const missingCollaterals = 5 - collateralReserve.length;
    for (let i = 0; i < missingCollaterals; i++) {
      if (availableExtraAda.isGreaterThan(ONE_ADA_LOVELACES)) {
        recommendedChange.push(createMultiToken(ONE_ADA_LOVELACES, [], networkId));
        availableExtraAda = availableExtraAda.minus(ONE_ADA_LOVELACES);
      }
    }
  }
  {
    const requiredAda = totalRequiredValue.getDefault();
    if (requiredAda.gt(0) && availableExtraAda.isGreaterThan(requiredAda.multipliedBy(1.5))) {
      recommendedChange.push(createMultiToken(requiredAda, [], networkId));
    }
  }
  return {
    selectedUtxo: improvedTakenUtxo,
    recommendedChange,
  };
}