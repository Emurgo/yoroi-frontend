// @flow

// Handles interfacing w/ cardano-serialization-lib to create transaction

import BigNumber from 'bignumber.js';
import type {
  V4UnsignedTxUtxoResponse,
  V4UnsignedTxAddressedUtxoResponse,
  CardanoAddressedUtxo,
} from '../types';
import type { RemoteUnspentOutput, } from '../../lib/state-fetch/types';
import {
  NotEnoughMoneyToSendError,
  AssetOverflowError,
  NoOutputsError,
  CannotSendBelowMinimumValueError,
} from '../../../common/errors';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';
import { derivePrivateByAddressing } from '../../lib/cardanoCrypto/utils';

import {
  Bip44DerivationLevels,
} from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing,
} from '../../lib/storage/models/PublicDeriver/interfaces';
import {
  getCardanoSpendingKeyHash, normalizeToAddress,
} from '../../lib/storage/bridge/utils';
import {
  MultiToken,
} from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';
import {
  cardanoValueFromRemoteFormat,
  multiTokenFromCardanoValue,
  cardanoValueFromMultiToken,
  parseTokenList,
} from '../utils';
import { hexToBytes } from '../../../../coreUtils';
import { classifyUtxoForValues } from './coinSelection';
import type { UtxoDescriptor } from './coinSelection';

/**
 * based off what the cardano-wallet team found worked empirically
 * note: slots are 1 second in Shelley mainnet, so this is 2hrs
 */
const defaultTtlOffset = 7200;

type TxOutput = {|
  ...Address,
  amount: MultiToken,
  dataHash?: string,
|};

type TxMint = {|
  policyScript: string, // HEX of the WASM policy script,
  assetName: string, // HEX
  amount: string,
|};

type TxAuxiliaryData = {|
  metadata: ?TxMetadata,
  nativeScripts: ?Array<string>,
|}

type TxMetadata = {
  [tag: string]: string,
};

export function sendAllUnsignedTx(
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  allUtxos: Array<CardanoAddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): V4UnsignedTxAddressedUtxoResponse {
  const addressingMap = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  for (const utxo of allUtxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      utxo_id: utxo.utxo_id,
      assets: utxo.assets,
    }, utxo);
  }
  const unsignedTxResponse = sendAllUnsignedTxFromUtxo(
    receiver,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
    metadata,
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(sendAllUnsignedTx)} utxo reference was changed. Should not happen`);
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates: [],
  };
}

const AddInputResult = Object.freeze({
  VALID: 0,
  // not worth the fee of adding it to input
  TOO_SMALL: 1,
  // token would overflow if added
  OVERFLOW: 2,
  // doesn't contribute to target
  NO_NEED: 3,
});
function addUtxoInput(
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  remaining: void | {|
    hasInput: boolean, // every tx requires at least one input
    value: RustModule.WalletV4.Value,
  |},
  input: RemoteUnspentOutput,
  /* don't add the input if the amount is smaller than the fee to add it to the tx */
  excludeIfSmall: boolean,
  protocolParams: {|
    networkId: number,
  |},
): $Values<typeof AddInputResult> {
  const wasmAddr = normalizeToAddress(input.receiver);
  if (wasmAddr == null) {
    throw new Error(`${nameof(addUtxoInput)} input not a valid Shelley address`);
  }
  const txInput = utxoToTxInput(input);
  const wasmAmount = cardanoValueFromRemoteFormat(input);

  const skipOverflow: void => $Values<typeof AddInputResult> = () => {
    /**
     * UTXOs can only contain at most u64 of a value
     * so if the sum of UTXO inputs for a tx > u64
     * it can cause the tx to fail (due to overflow) in the output / change
     *
     * This can be addressed by splitting up a tx to use multiple outputs / multiple change
     * and this just requires more ADA to cover the min UTXO of these added inputs
     * but as a simple solution for now, we just block > u64 inputs of any token
     * This isn't a great workaround since it means features like sendAll may end up not sending all
    */
    const currentInputSum = txBuilder
      .get_explicit_input()
      .checked_add(txBuilder.get_implicit_input());
    try {
      currentInputSum.checked_add(wasmAmount);
    } catch (e) {
      return AddInputResult.OVERFLOW;
    }
    return AddInputResult.VALID;
  }
  const skipInput: void => $Values<typeof AddInputResult> = () => {
    if (remaining == null) return skipOverflow();

    const defaultEntry = {
      defaultNetworkId: protocolParams.networkId,
      defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
    };
    const tokenSetInInput = new Set(input.assets.map(asset => asset.assetId));
    const remainingTokens = multiTokenFromCardanoValue(
      remaining.value,
      defaultEntry,
    );
    const includedTargets = remainingTokens.nonDefaultEntries().filter(
      entry => tokenSetInInput.has(entry.identifier)
    );

    if (remainingTokens.getDefaultEntry().amount.gt(0) && new BigNumber(input.amount).gt(0)) {
      includedTargets.push(remainingTokens.getDefaultEntry());
    }

    // it's possible to have no target left and yet have no input added yet
    // due to refunds in Cardano
    // so we still want to add the input in this case even if we don't care about the coins in it
    if (includedTargets.length === 0 && remaining.hasInput) {
      return AddInputResult.NO_NEED;
    }

    const onlyDefaultEntry = (
      includedTargets.length === 1 &&
      includedTargets[0].identifier === defaultEntry.defaultIdentifier
    );
    // ignore UTXO that contribute less than their fee if they also don't contribute a token
    if (onlyDefaultEntry && excludeIfSmall) {
      const feeForInput = new BigNumber(
        txBuilder.fee_for_input(
          wasmAddr,
          txInput,
          wasmAmount
        ).to_str()
      );
      if (feeForInput.gt(input.amount)) {
        return AddInputResult.TOO_SMALL;
      }
    }

    return skipOverflow();
  }

  const skipResult = skipInput();
  if (skipResult !== AddInputResult.VALID) {
    return skipResult;
  }

  txBuilder.add_input(
    wasmAddr,
    txInput,
    wasmAmount
  );
  return AddInputResult.VALID;
}

export function sendAllUnsignedTxFromUtxo(
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  allUtxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): V4UnsignedTxUtxoResponse {
  const totalBalance = allUtxos
    .map(utxo => new BigNumber(utxo.amount))
    .reduce(
      (acc, amount) => acc.plus(amount),
      new BigNumber(0)
    );
  if (totalBalance.isZero()) {
    throw new NotEnoughMoneyToSendError();
  }

  const txBuilder = RustModule.WalletV4TxBuilder(protocolParams);
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());

  for (const input of allUtxos) {
    if (addUtxoInput(
      txBuilder,
      undefined,
      input,
      false,
      { networkId: protocolParams.networkId }
    ) === AddInputResult.OVERFLOW) {
      // for the send all case, prefer to throw an error
      // instead of skipping inputs that would cause an error
      // otherwise leads to unexpected cases like wallet migration leaving some UTXO behind
      throw new AssetOverflowError();
    }
  }

  if(metadata !== undefined){
    txBuilder.set_auxiliary_data(metadata);
  }

  if (totalBalance.lt(txBuilder.min_fee().to_str())) {
    // not enough in inputs to even cover the cost of including themselves in a tx
    throw new NotEnoughMoneyToSendError();
  }
  {
    const wasmReceiver = normalizeToAddress(receiver.address);
    if (wasmReceiver == null) {
      throw new Error(`${nameof(sendAllUnsignedTxFromUtxo)} receiver not a valid Shelley address`);
    }

    let couldSendAmount = false;
    try {
      // semantically, sending all ADA to somebody
      // is the same as if you're sending all the ADA as change to yourself
      // (module the fact the address doesn't belong to you)
      couldSendAmount = txBuilder.add_change_if_needed(wasmReceiver);
    } catch (e) {
      if (!String(e).includes('Not enough ADA')) {
        // any other error except not-enough-ada terminates here
        // eslint-disable-next-line no-console
        console.error('Failed to construct send-all output!', e);
        throw e;
      }
    }
    if (!couldSendAmount) {
      // if you couldn't send any amount,
      // it's because you couldn't cover the fee of adding an output
      throw new NotEnoughMoneyToSendError();
    }
  }

  const changeAddr = (() => {
    if (receiver.addressing== null) return [];
    const { addressing } = receiver;

    return [{
      addressing,
      address: receiver.address,
      values: multiTokenFromCardanoValue(
        txBuilder.get_explicit_output(),
        {
          defaultNetworkId: protocolParams.networkId,
          defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
        }
      ),
    }];
  })();

  return {
    senderUtxos: allUtxos,
    txBuilder,
    changeAddr,
  };
}

/**
 * we use all UTXOs as possible inputs for selection
 */
export function newAdaUnsignedTx(
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  allUtxos: Array<CardanoAddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
  allowNoOutputs: boolean,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): V4UnsignedTxAddressedUtxoResponse {
  const addressingMap = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  for (const utxo of allUtxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      utxo_id: utxo.utxo_id,
      assets: utxo.assets,
    }, utxo);
  }
  const unsignedTxResponse = newAdaUnsignedTxFromUtxo(
    outputs,
    changeAdaAddr,
    Array.from(addressingMap.keys()),
    absSlotNumber,
    protocolParams,
    certificates,
    withdrawals,
    allowNoOutputs,
    metadata,
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(newAdaUnsignedTx)} utxo reference was changed. Should not happen`);
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates,
  };
}

export function newAdaUnsignedTxForConnector(
  outputs: Array<TxOutput>,
  mint: Array<TxMint>,
  auxiliaryData: TxAuxiliaryData,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  mustIncludeUtxos: Array<CardanoAddressedUtxo>,
  coinSelectUtxos: Array<CardanoAddressedUtxo>,
  absSlotNumber: BigNumber,
  validityStart: ?number,
  ttl: ?number,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
): V4UnsignedTxAddressedUtxoResponse {
  const removeAddressing = (utxo: CardanoAddressedUtxo): RemoteUnspentOutput => ({
    amount: utxo.amount,
    receiver: utxo.receiver,
    tx_hash: utxo.tx_hash,
    tx_index: utxo.tx_index,
    utxo_id: utxo.utxo_id,
    assets: utxo.assets,
  });
  const addressingMapForMustIncludeUtxos = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  const addressingMapForCoinSelectUtxos = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  for (const utxo of mustIncludeUtxos) {
    addressingMapForMustIncludeUtxos.set(removeAddressing(utxo), utxo);
  }
  for (const utxo of coinSelectUtxos) {
    addressingMapForCoinSelectUtxos.set(removeAddressing(utxo), utxo);
  }
  const unsignedTxResponse = newAdaUnsignedTxFromUtxoForConnector(
    outputs,
    mint,
    auxiliaryData,
    changeAdaAddr,
    Array.from(addressingMapForMustIncludeUtxos.keys()),
    Array.from(addressingMapForCoinSelectUtxos.keys()),
    absSlotNumber,
    validityStart,
    ttl,
    protocolParams,
  );

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMapForMustIncludeUtxos.get(utxo) ||
        addressingMapForCoinSelectUtxos.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(newAdaUnsignedTx)} utxo reference was changed. Should not happen`);
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    txBuilder: unsignedTxResponse.txBuilder,
    changeAddr: unsignedTxResponse.changeAddr,
    certificates: [],
  };
}

function minRequiredForChange(
  txBuilder: RustModule.WalletV4.TransactionBuilder,
  changeAdaAddr: {| ...Address, ...Addressing |},
  value: RustModule.WalletV4.Value,
  protocolParams: {
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    ...,
  },
): RustModule.WalletV4.BigNum {
  const wasmChange = normalizeToAddress(changeAdaAddr.address);
  if (wasmChange == null) {
    throw new Error(`${nameof(minRequiredForChange)} change not a valid Shelley address`);
  }

  // <TODO:PLUTUS_SUPPORT>
  const utxoHasDataHash = false;

  const minimumAda = RustModule.WalletV4.min_ada_required(
    value,
    utxoHasDataHash,
    protocolParams.coinsPerUtxoWord
  );

  // we may have to increase the value used up to the minimum ADA required
  const baseValue = (() => {
    if (value.coin().compare(minimumAda) < 0) {
      const newVal = RustModule.WalletV4.Value.new(minimumAda);
      const assets = value.multiasset();
      if (assets) {
        newVal.set_multiasset(assets);
      }
      return newVal;
    }
    return value;
  })();
  const minRequired = txBuilder
      .fee_for_output(RustModule.WalletV4.TransactionOutput.new(
        wasmChange,
        baseValue,
      ))
      .checked_add(minimumAda);
  return minRequired;
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export function newAdaUnsignedTxFromUtxo(
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
  allowNoOutputs: boolean,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): V4UnsignedTxUtxoResponse {

  const { withOnlyRequiredAssets, withRequiredAssets, pure, dirty, collateralReserve } = classifyUtxoForValues(
    utxos,
    outputs.map(o => o.amount),
    protocolParams.coinsPerUtxoWord,
  )

  // prioritize inputs
  const sortedUtxos: Array<RemoteUnspentOutput> = [
    ...withOnlyRequiredAssets,
    ...withRequiredAssets,
    ...pure,
    ...dirty,
    ...collateralReserve,
  ].map((u: UtxoDescriptor) => u.utxo);

  /*
    This is an ad-hoc optimization for one specific senario:
    If the input is enough to cover the output and the fee, but the remaining amount
    is less than the minimum UTXO amount (1 ADA as of now), then
    `txBuilder.add_change_if_need` will "burn" the remaining as fee instead of adding
    a change.
    The optimization is to include one extra UTXO input to force the change amount
    to be larger than the minimum UTXO amount.
  */
  const result = _newAdaUnsignedTxFromUtxo(
    outputs,
    changeAdaAddr,
    sortedUtxos,
    absSlotNumber,
    protocolParams,
    certificates,
    withdrawals,
    allowNoOutputs,
    metadata,
    false,
  );
  const fee = result.txBuilder.get_fee_if_set();

  const resultWithOneExtraInput = _newAdaUnsignedTxFromUtxo(
    outputs,
    changeAdaAddr,
    sortedUtxos,
    absSlotNumber,
    protocolParams,
    certificates,
    withdrawals,
    allowNoOutputs,
    metadata,
    true,
  );
  const feeWithOneExtraInput = resultWithOneExtraInput.txBuilder.get_fee_if_set();

  if (feeWithOneExtraInput && fee && feeWithOneExtraInput.compare(fee) < 0) {
    return resultWithOneExtraInput;
  }
  return result;
}

function _newAdaUnsignedTxFromUtxo(
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
  allowNoOutputs: boolean,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
  oneExtraInput: boolean,
): V4UnsignedTxUtxoResponse {
  /**
   * Shelley supports transactions with no outputs by simply burning any leftover ADA as fee
   * This is can happen in the following:
   * - if you have a 3ADA UTXO and you register a staking key, there will be 0 outputs
   * However, if there is no output, there is no way to tell the network of the transaction
   * This allows for replay attacks of 0-output transactions on testnets that use a mainnet snapshot
   * To protect against this, we can choose to force that there is always even one output
   * by simply enforcing a change address if no outputs are specified for the transaction
   * This is use to be enforced by hardware wallets (will error on 0 outputs) but may no longer be
   *
   * Additionally, it's not possible to burn tokens as fees at the moment
   * but this functionality may come at a later date
   */
  const shouldForceChange = (
    assetsForChange: RustModule.WalletV4.MultiAsset | void
  ): boolean => {
    const noOutputDisallowed = !allowNoOutputs && outputs.length === 0;
    if (noOutputDisallowed && changeAdaAddr == null) {
      throw new NoOutputsError();
    }
    if (assetsForChange != null && assetsForChange.len() > 0) {
      return true;
    }
    return noOutputDisallowed;

  };
  const emptyAsset = RustModule.WalletV4.MultiAsset.new();
  shouldForceChange(undefined);

  const txBuilder = RustModule.WalletV4TxBuilder(protocolParams);
  if (certificates.length > 0) {
    const certsWasm = certificates.reduce(
      (certs, cert) => { certs.add(cert); return certs; },
      RustModule.WalletV4.Certificates.new()
    );
    txBuilder.set_certs(certsWasm);
  }
  if (metadata !== undefined){
    txBuilder.set_auxiliary_data(metadata);
  }
  if (withdrawals.length > 0) {
    const withdrawalWasm = withdrawals.reduce(
      (withs, withdrawal) => {
        withs.insert(
          withdrawal.address,
          withdrawal.amount,
        );
        return withs;
      },
      RustModule.WalletV4.Withdrawals.new()
    );
    txBuilder.set_withdrawals(withdrawalWasm);
  }
  txBuilder.set_ttl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  {
    for (const output of outputs) {
      const wasmReceiver = normalizeToAddress(output.address);
      if (wasmReceiver == null) {
        throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} receiver not a valid Shelley address`);
      }
      try {
        txBuilder.add_output(
          RustModule.WalletV4.TransactionOutput.new(
            wasmReceiver,
            cardanoValueFromMultiToken(output.amount),
          )
        );
      } catch (e) {
        if (String(e).includes('less than the minimum UTXO value')) {
          throw new CannotSendBelowMinimumValueError();
        }
        throw e;
      }
    }
  }

  // output excluding fee
  const targetOutput = txBuilder.get_total_output();

  // pick inputs
  const usedUtxos: Array<RemoteUnspentOutput> = [];
  {
    // this flag is set when one extra input is added
    let oneExtraAdded = false;
    // add utxos until we have enough to send the transaction
    for (let i = 0; i < utxos.length; i++) {
      const utxo = utxos[i];
      if (oneExtraAdded) {
        break;
      }
      const currentInputSum = txBuilder.get_total_input();
      const neededInput = targetOutput
        .checked_add(RustModule.WalletV4.Value.new(txBuilder.min_fee()));
      const excessiveInputAssets = currentInputSum.multiasset()
        ?.sub(neededInput.multiasset() ?? emptyAsset);

      const remainingNeeded = neededInput.clamped_sub(currentInputSum);
      // update amount required to make sure we have ADA required for change UTXO entry
      if (shouldForceChange(excessiveInputAssets)) {
        if (changeAdaAddr == null) throw new NoOutputsError();
        const difference = currentInputSum.clamped_sub(neededInput);
        const minimumNeededForChange = minRequiredForChange(
          txBuilder,
          changeAdaAddr,
          difference,
          protocolParams,
        );
        const adaNeededLeftForChange = minimumNeededForChange.clamped_sub(difference.coin());
        if (remainingNeeded.coin().compare(adaNeededLeftForChange) < 0) {
          remainingNeeded.set_coin(adaNeededLeftForChange);
        }
      }

      // stop if we've added all the assets we needed
      const isNonEmptyInputs = usedUtxos.length > 0;
      {
        const remainingAssets = remainingNeeded.multiasset();
        const isRemainingNeededCoinZero = isBigNumZero(remainingNeeded.coin());
        const isRemainingNeededAssetZero = (remainingAssets?.len() ?? 0) === 0;
        if (isRemainingNeededCoinZero && isRemainingNeededAssetZero && isNonEmptyInputs) {
          const changeTokenIdSet = new Set(
            parseTokenList(excessiveInputAssets).map(r => r.assetId)
          );
          let packed = false;
          for (let j = i; j < utxos.length; j++) {
            const packCandidate = utxos[j];
            if (
              packCandidate.assets.length >= 1 &&
                packCandidate.assets.every(({ assetId }) => changeTokenIdSet.has(assetId))
            ) {
              if (
                addUtxoInput(
                  txBuilder,
                  undefined,
                  packCandidate,
                  false,
                  { networkId: protocolParams.networkId }
                ) === AddInputResult.VALID
              ) {
                usedUtxos.push(packCandidate);

                packed = true;
                break;
              }
            }
          }
          if (oneExtraInput && !packed) {
            // We've added all the assets we need, but we add one extra.
            // Set the flag so that the adding loop stops after this extra one is added.
            oneExtraAdded = true;
          } else {
            break;
          }
        }
      }

      const added = addUtxoInput(
        txBuilder,
        oneExtraAdded ?
          undefined : // avoid 'NO_NEED'
          {
            value: remainingNeeded,
            hasInput: isNonEmptyInputs,
          },
        utxo,
        true,
        { networkId: protocolParams.networkId },
      );
      if (added !== AddInputResult.VALID) continue;

      usedUtxos.push(utxo);
    }
    if (usedUtxos.length === 0) {
      throw new NotEnoughMoneyToSendError();
    }
    // check to see if we have enough balance in the wallet to cover the transaction
    {
       const currentInputSum = txBuilder.get_total_input();

      // need to recalculate each time because fee changes
      const output = targetOutput
          .checked_add(RustModule.WalletV4.Value.new(txBuilder.min_fee()));

      const compare = currentInputSum.compare(output);
      const enoughInput = compare != null && compare >= 0;

      const forceChange = shouldForceChange(
        currentInputSum.multiasset()?.sub(output.multiasset() ?? emptyAsset)
      );
      if (forceChange) {
        if (changeAdaAddr == null) throw new NoOutputsError();
        if (!enoughInput) {
          throw new NotEnoughMoneyToSendError();
        }
        const difference = currentInputSum.checked_sub(output);
        const minimumNeededForChange = minRequiredForChange(
          txBuilder,
          changeAdaAddr,
          difference,
          protocolParams,
        );
        if (difference.coin().compare(minimumNeededForChange) < 0) {
          throw new NotEnoughMoneyToSendError();
        }
      }
      if (!forceChange && !enoughInput) {
        throw new NotEnoughMoneyToSendError();
      }
    }
  }

  const changeAddr = (() => {
    const totalInput = txBuilder.get_explicit_input().checked_add(txBuilder.get_implicit_input());
    const difference = totalInput.checked_sub(targetOutput);

    const forceChange = shouldForceChange(difference.multiasset() ?? emptyAsset);
    if (changeAdaAddr == null) {
      if (forceChange) {
        throw new NoOutputsError();
      }
      const minFee = txBuilder.min_fee();
      if (difference.coin().compare(minFee) < 0) {
        throw new NotEnoughMoneyToSendError();
      }
      // recall: min fee assumes the largest fee possible
      // so no worries of cbor issue by including larger fee
      txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(difference.coin().to_str()));
      return [];
    }
    const outputBeforeChange = txBuilder.get_explicit_output();

    const wasmChange = normalizeToAddress(changeAdaAddr.address);
    if (wasmChange == null) {
      throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} change not a valid Shelley address`);
    }
    let changeWasAdded: boolean;
    try {
      changeWasAdded = txBuilder.add_change_if_needed(wasmChange);
    } catch (e) {
      if (String(e).includes('Not enough ADA')) {
        throw new NotEnoughMoneyToSendError();
      }
      // eslint-disable-next-line no-console
      console.error('Failed to construct tx change!', e);
      throw e;
    }
    if (forceChange && !changeWasAdded) {
      // note: this should never happened since it should have been handled by earlier code
      throw new Error(`No change added even though it should be forced`);
    }
    const output = multiTokenFromCardanoValue(
      // since the change is added as an output
      // the amount of change is the new output minus what the output was before we added the change
      txBuilder.get_explicit_output().checked_sub(outputBeforeChange),
      {
        defaultNetworkId: protocolParams.networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );
    return changeWasAdded
      ? [{
        ...changeAdaAddr,
        values: output,
      }]
      : [];
  })();

  return {
    senderUtxos: usedUtxos,
    txBuilder,
    changeAddr,
  };
}

function newAdaUnsignedTxFromUtxoForConnector(
  outputs: Array<TxOutput>,
  mint: Array<TxMint>,
  auxiliaryData: TxAuxiliaryData,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  mustIncludeUtxos: Array<RemoteUnspentOutput>,
  coinSelectUtxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  validityStart: ?number,
  ttl: ?number,
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
    coinsPerUtxoWord: RustModule.WalletV4.BigNum,
    poolDeposit: RustModule.WalletV4.BigNum,
    keyDeposit: RustModule.WalletV4.BigNum,
    networkId: number,
  |},
): V4UnsignedTxUtxoResponse {
  const allowNoOutputs = true;
  /**
   * Shelley supports transactions with no outputs by simply burning any leftover ADA as fee
   * This is can happen in the following:
   * - if you have a 3ADA UTXO and you register a staking key, there will be 0 outputs
   * However, if there is no output, there is no way to tell the network of the transaction
   * This allows for replay attacks of 0-output transactions on testnets that use a mainnet snapshot
   * To protect against this, we can choose to force that there is always even one output
   * by simply enforcing a change address if no outputs are specified for the transaction
   * This is use to be enforced by hardware wallets (will error on 0 outputs) but may no longer be
   *
   * Additionally, it's not possible to burn tokens as fees at the moment
   * but this functionality may come at a later date
   */
  const shouldForceChange = (
    assetsForChange: RustModule.WalletV4.MultiAsset | void
  ): boolean => {
    const noOutputDisallowed = !allowNoOutputs && outputs.length === 0;
    if (noOutputDisallowed && changeAdaAddr == null) {
      throw new NoOutputsError();
    }
    if (assetsForChange != null && assetsForChange.len() > 0) {
      return true;
    }
    return noOutputDisallowed;

  };
  const emptyAsset = RustModule.WalletV4.MultiAsset.new();
  shouldForceChange(undefined);

  const txBuilder = RustModule.WalletV4TxBuilder(protocolParams);
  if (validityStart != null) {
    txBuilder.set_validity_start_interval(validityStart)
  }
  if (ttl != null) {
    txBuilder.set_ttl(ttl);
  } else {
    txBuilder.set_ttl((absSlotNumber.plus(defaultTtlOffset).toNumber()));
  }
  {
    for (const output of outputs) {
      const wasmReceiver = normalizeToAddress(output.address);
      if (wasmReceiver == null) {
        throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} receiver not a valid Shelley address`);
      }
      try {
        const newOutput = RustModule.WalletV4.TransactionOutput.new(
          wasmReceiver,
          cardanoValueFromMultiToken(output.amount),
        );
        if (output.dataHash != null) {
          newOutput.set_data_hash(RustModule.WalletV4.DataHash.from_bytes(
            Buffer.from(output.dataHash, 'hex')
          ));
        }
        txBuilder.add_output(
          newOutput
        );
      } catch (e) {
        if (String(e).includes('less than the minimum UTXO value')) {
          throw new CannotSendBelowMinimumValueError();
        }
        throw e;
      }
    }
  }
  {
    for (const m of mint) {
      const mintScript = RustModule.WalletV4.NativeScript.from_bytes(
        Buffer.from(m.policyScript, 'hex'),
      );
      const mintName = RustModule.WalletV4.AssetName.new(
        Buffer.from(m.assetName, 'hex'),
      );
      const amountBignum = new BigNumber(m.amount);
      const wasmAmountBignum = RustModule.WalletV4.BigNum.from_str(amountBignum.abs().toString());
      const wasmAmount = amountBignum.isPositive() ?
        RustModule.WalletV4.Int.new(wasmAmountBignum)
        : RustModule.WalletV4.Int.new_negative(wasmAmountBignum);
      txBuilder.add_mint_asset(
        mintScript,
        mintName,
        wasmAmount,
      );
    }
  }
  {
    const metadata = auxiliaryData.metadata ?? {};
    for (const tag of Object.keys(metadata)) {
      txBuilder.add_json_metadatum(
        RustModule.WalletV4.BigNum.from_str(String(tag)),
        metadata[tag],
      )
    }
    const nativeScripts = auxiliaryData.nativeScripts ?? [];
    if (nativeScripts.length > 0) {
      const wasmAuxiliaryData = txBuilder.get_auxiliary_data()
        ?? RustModule.WalletV4.AuxiliaryData.new();
      const wasmNativeScripts = wasmAuxiliaryData.native_scripts()
        ?? RustModule.WalletV4.NativeScripts.new();
      for (const scriptHex of nativeScripts) {
        const wasmNativeScript = RustModule.WalletV4.NativeScript.from_bytes(hexToBytes(scriptHex));
        wasmNativeScripts.add(wasmNativeScript);
      }
      wasmAuxiliaryData.set_native_scripts(wasmNativeScripts);
      txBuilder.set_auxiliary_data(wasmAuxiliaryData);
    }
  }

  // output excluding fee
  const targetOutput = txBuilder
    .get_explicit_output()
    .checked_add(RustModule.WalletV4.Value.new(txBuilder.get_deposit()));

  // pick inputs
  const usedUtxos: Array<RemoteUnspentOutput> = [];
  {
    for (const utxo of mustIncludeUtxos) {
      const added = addUtxoInput(
        txBuilder,
        undefined,
        utxo,
        true,
        { networkId: protocolParams.networkId },
      );
      if (added !== AddInputResult.VALID) {
        throw new Error('could not add designated UTXO');
      }

      usedUtxos.push(utxo);
    }

    // add utxos until we have enough to send the transaction
    for (const utxo of coinSelectUtxos) {
      const currentInputSum = txBuilder.get_total_input();
      const neededInput = targetOutput
        .checked_add(RustModule.WalletV4.Value.new(txBuilder.min_fee()));
      const excessiveInputAssets = currentInputSum.multiasset()
        ?.sub(neededInput.multiasset() ?? emptyAsset);

      const remainingNeeded = neededInput.clamped_sub(currentInputSum);
      // update amount required to make sure we have ADA required for change UTXO entry
      if (shouldForceChange(excessiveInputAssets)) {
        if (changeAdaAddr == null) throw new NoOutputsError();
        const difference = currentInputSum.clamped_sub(neededInput);
        const minimumNeededForChange = minRequiredForChange(
          txBuilder,
          changeAdaAddr,
          difference,
          protocolParams
        );
        const adaNeededLeftForChange = minimumNeededForChange.clamped_sub(difference.coin());
        if (remainingNeeded.coin().compare(adaNeededLeftForChange) < 0) {
          remainingNeeded.set_coin(adaNeededLeftForChange);
        }
      }

      // stop if we've added all the assets we needed
      const isNonEmptyInputs = usedUtxos.length > 0;
      {
        const remainingAssets = remainingNeeded.multiasset();
        const isRemainingNeededCoinZero = isBigNumZero(remainingNeeded.coin());
        const isRemainingNeededAssetZero = (remainingAssets?.len() ?? 0) === 0;
        if (isRemainingNeededCoinZero && isRemainingNeededAssetZero && isNonEmptyInputs) {
          break;
        }
      }

      const added = addUtxoInput(
        txBuilder,
        {
          value: remainingNeeded,
          hasInput: isNonEmptyInputs,
        },
        utxo,
        true,
        { networkId: protocolParams.networkId },
      );
      if (added !== AddInputResult.VALID) continue;

      usedUtxos.push(utxo);
    }
    if (usedUtxos.length === 0) {
      throw new NotEnoughMoneyToSendError();
    }
    // check to see if we have enough balance in the wallet to cover the transaction
    {
       const currentInputSum = txBuilder.get_total_input();

      // need to recalculate each time because fee changes
      const output = targetOutput
          .checked_add(RustModule.WalletV4.Value.new(txBuilder.min_fee()));

      const compare = currentInputSum.compare(output);
      const enoughInput = compare != null && compare >= 0;

      const forceChange = shouldForceChange(
        currentInputSum.multiasset()?.sub(output.multiasset() ?? emptyAsset)
      );
      if (forceChange) {
        if (changeAdaAddr == null) throw new NoOutputsError();
        if (!enoughInput) {
          throw new NotEnoughMoneyToSendError();
        }
        const difference = currentInputSum.checked_sub(output);
        const minimumNeededForChange = minRequiredForChange(
          txBuilder,
          changeAdaAddr,
          difference,
          protocolParams
        );
        if (difference.coin().compare(minimumNeededForChange) < 0) {
          throw new NotEnoughMoneyToSendError();
        }
      }
      if (!forceChange && !enoughInput) {
        throw new NotEnoughMoneyToSendError();
      }
    }
  }

  const changeAddr = (() => {
    const totalInput = txBuilder.get_explicit_input().checked_add(txBuilder.get_implicit_input());
    const difference = totalInput.checked_sub(targetOutput);

    const forceChange = shouldForceChange(difference.multiasset() ?? emptyAsset);
    if (changeAdaAddr == null) {
      if (forceChange) {
        throw new NoOutputsError();
      }
      const minFee = txBuilder.min_fee();
      if (difference.coin().compare(minFee) < 0) {
        throw new NotEnoughMoneyToSendError();
      }
      // recall: min fee assumes the largest fee possible
      // so no worries of cbor issue by including larger fee
      txBuilder.set_fee(RustModule.WalletV4.BigNum.from_str(difference.coin().to_str()));
      return [];
    }
    const outputBeforeChange = txBuilder.get_explicit_output();

    const wasmChange = normalizeToAddress(changeAdaAddr.address);
    if (wasmChange == null) {
      throw new Error(`${nameof(newAdaUnsignedTxFromUtxo)} change not a valid Shelley address`);
    }
    let changeWasAdded: boolean;
    try {
      changeWasAdded = txBuilder.add_change_if_needed(wasmChange);
    } catch (e) {
      if (String(e).includes('Not enough ADA')) {
        throw new NotEnoughMoneyToSendError();
      }
      // eslint-disable-next-line no-console
      console.error('Failed to construct tx change!', e);
      throw e;
    }
    if (forceChange && !changeWasAdded) {
      // note: this should never happened since it should have been handled by earlier code
      throw new Error(`No change added even though it should be forced`);
    }
    const output = multiTokenFromCardanoValue(
      // since the change is added as an output
      // the amount of change is the new output minus what the output was before we added the change
      txBuilder.get_explicit_output().checked_sub(outputBeforeChange),
      {
        defaultNetworkId: protocolParams.networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Cardano,
      }
    );
    return changeWasAdded
      ? [{
        ...changeAdaAddr,
        values: output,
      }]
      : [];
  })();

  return {
    senderUtxos: usedUtxos,
    txBuilder,
    changeAddr,
  };
}

type UtxoOrAddressing = CardanoAddressedUtxo | {| ...Address, ...Addressing |};

export function signTransaction(
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx: RustModule.WalletV4.TransactionBuilder | RustModule.WalletV4.TransactionBody,
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  stakingKeyWits: Set<string>,
  metadata: ?RustModule.WalletV4.AuxiliaryData,
  witnessSet: ?RustModule.WalletV4.TransactionWitnessSet = null,
  otherRequiredSigners: Array<{| ...Address, ...Addressing |}> = [],
): RustModule.WalletV4.Transaction {
  const seenByronKeys: Set<string> = new Set();
  const seenKeyHashes: Set<string> = new Set();
  const deduped: Array<UtxoOrAddressing> = [];
  function addIfUnique(address: string, item: UtxoOrAddressing): void {
    const wasmAddr = normalizeToAddress(address);
    if (wasmAddr == null) {
      throw new Error(`${nameof(signTransaction)} utxo not a valid Shelley address`);
    }
    const keyHash = getCardanoSpendingKeyHash(wasmAddr);
    const addrHex = Buffer.from(wasmAddr.to_bytes()).toString('hex');
    if (keyHash === null) {
      if (!seenByronKeys.has(addrHex)) {
        seenByronKeys.add(addrHex);
        deduped.push(item);
      }
      return;
    }
    if (keyHash === undefined) {
      throw new Error(`${nameof(signTransaction)} cannot sign script inputs`);
    }
    {
      const keyHex = Buffer.from(keyHash.to_bytes()).toString('hex');
      if (!seenKeyHashes.has(keyHex)) {
        seenKeyHashes.add(keyHex);
        deduped.push(item);
      }
    }
  }
  for (const senderUtxo of senderUtxos) {
    addIfUnique(senderUtxo.receiver, senderUtxo);
  }
  for (const otherSigner of otherRequiredSigners) {
    addIfUnique(otherSigner.address, otherSigner);
  }

  const txBody = unsignedTx instanceof RustModule.WalletV4.TransactionBuilder
    ? unsignedTx.build()
    : unsignedTx;
  const txHash = RustModule.WalletV4.hash_transaction(txBody);

  const vkeyWits = RustModule.WalletV4.Vkeywitnesses.new();
  const bootstrapWits = RustModule.WalletV4.BootstrapWitnesses.new();

  addWitnesses(
    txHash,
    deduped,
    keyLevel,
    signingKey,
    vkeyWits,
    bootstrapWits,
  );

  const stakingKeySigSet = new Set<string>();
  for (const witness of stakingKeyWits) {
    if (stakingKeySigSet.has(witness)) {
      continue;
    }
    stakingKeySigSet.add(witness);
    vkeyWits.add(
      RustModule.WalletV4.Vkeywitness.from_bytes(
        Buffer.from(witness, 'hex')
      )
    );
  }

  witnessSet = witnessSet ?? RustModule.WalletV4.TransactionWitnessSet.new();
  if (bootstrapWits.len() > 0) witnessSet.set_bootstraps(bootstrapWits);
  if (vkeyWits.len() > 0) witnessSet.set_vkeys(vkeyWits);

  // Have to do this, because `Transaction.new` receives by value instead of reference
  // <TODO:SERLIB_REFERENCE_CALL_FIX>
  const metadataClone = metadata == null ? null
    : RustModule.WalletV4.AuxiliaryData
      .from_bytes(Buffer.from(metadata.to_bytes()));

  return RustModule.WalletV4.Transaction.new(
    txBody,
    witnessSet,
    // $FlowFixMe[incompatible-call]
    metadataClone,
  );
}

function utxoToTxInput(
  utxo: RemoteUnspentOutput,
): RustModule.WalletV4.TransactionInput {
  return RustModule.WalletV4.TransactionInput.new(
    RustModule.WalletV4.TransactionHash.from_bytes(
      Buffer.from(utxo.tx_hash, 'hex'),
    ),
    utxo.tx_index,
  );
}

function addWitnesses(
  txHash: RustModule.WalletV4.TransactionHash,
  uniqueAddressings: Array<UtxoOrAddressing>, // pre-req: does not contain duplicate keys
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  vkeyWits: RustModule.WalletV4.Vkeywitnesses,
  bootstrapWits: RustModule.WalletV4.BootstrapWitnesses,
): void {
  // get private keys
  const privateKeys = uniqueAddressings.map(utxo => {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1;
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error(`${nameof(addWitnesses)} incorrect addressing size`);
    }
    return derivePrivateByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: signingKey,
      }
    });
  });

  // sign the transactions
  for (let i = 0; i < uniqueAddressings.length; i++) {
    const uniqueAddressing = uniqueAddressings[i];
    const resolveAddress = (): string => {
      if (uniqueAddressing.receiver != null)
        return uniqueAddressing.receiver;
      if (uniqueAddressing.address != null)
        return uniqueAddressing.address;
      throw new Error(`[addWitnesses] Unexpected addressing for signing: ${JSON.stringify(uniqueAddressing)}`)
    }
    const wasmAddr = normalizeToAddress(resolveAddress());
    if (wasmAddr == null) {
      throw new Error(`${nameof(addWitnesses)} utxo not a valid Shelley address`);
    }
    const byronAddr = RustModule.WalletV4.ByronAddress.from_address(wasmAddr);
    if (byronAddr == null) {
      const vkeyWit = RustModule.WalletV4.make_vkey_witness(
        txHash,
        privateKeys[i].to_raw_key(),
      );
      vkeyWits.add(vkeyWit);
    } else {
      const bootstrapWit = RustModule.WalletV4.make_icarus_bootstrap_witness(
        txHash,
        byronAddr,
        privateKeys[i],
      );
      bootstrapWits.add(bootstrapWit);
    }
  }
}

export function genFilterSmallUtxo(request: {|
  protocolParams: {|
    linearFee: RustModule.WalletV4.LinearFee,
  |},
|}): (
  RemoteUnspentOutput => boolean
) {
  const txBuilder = RustModule.WalletV4TxBuilder({
      linearFee: request.protocolParams.linearFee,
      // no need for the following parameters just to calculate the fee of adding a UTXO
      coinsPerUtxoWord: RustModule.WalletV4.BigNum.zero(),
      poolDeposit: RustModule.WalletV4.BigNum.zero(),
      keyDeposit: RustModule.WalletV4.BigNum.zero(),
  });

  return (utxo) => {
    const wasmAddr = normalizeToAddress(utxo.receiver);
    if (wasmAddr == null) {
      throw new Error(`${nameof(addUtxoInput)} input not a valid Shelley address`);
    }
    const wasmAmount = cardanoValueFromRemoteFormat(utxo);
    const feeForInput = new BigNumber(
      txBuilder.fee_for_input(
        wasmAddr,
        utxoToTxInput(utxo),
        wasmAmount
      ).to_str()
    );
    return feeForInput.lte(utxo.amount);
  };
}

function isBigNumZero(b: RustModule.WalletV4.BigNum): boolean {
  return b.compare(RustModule.WalletV4.BigNum.zero()) === 0;
}
