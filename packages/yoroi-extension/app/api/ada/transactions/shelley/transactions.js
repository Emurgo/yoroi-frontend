// @flow

// Handles interfacing w/ cardano-serialization-lib to create transaction

import BigNumber from 'bignumber.js';
import type {
  CardanoAddressedUtxo,
  CardanoUtxoScriptWitness,
  V4UnsignedTxAddressedUtxoResponse,
  V4UnsignedTxUtxoResponse,
} from '../types';
import type { RemoteUnspentOutput, } from '../../lib/state-fetch/types';
import {
  AssetOverflowError,
  CannotSendBelowMinimumValueError,
  NotEnoughMoneyToSendError,
  NoOutputsError,
} from '../../../common/errors';

import { RustModule } from '../../lib/cardanoCrypto/rustLoader';

import { Bip44DerivationLevels, } from '../../lib/storage/database/walletTypes/bip44/api/utils';
import type { Address, Addressing, IGetAllUtxosResponse, } from '../../lib/storage/models/PublicDeriver/interfaces';
import { getCardanoSpendingKeyHash, normalizeToAddress } from '../../lib/storage/bridge/utils';
import { MultiToken, } from '../../../common/lib/MultiToken';
import { PRIMARY_ASSET_CONSTANTS } from '../../lib/storage/database/primitives/enums';
import { cardanoValueFromMultiToken, cardanoValueFromRemoteFormat, multiTokenFromCardanoValue, asAddressedUtxo, multiTokenFromRemote } from '../utils';
import { hexToBytes, logErr } from '../../../../coreUtils';
import { getCardanoHaskellBaseConfig, getNetworkById } from '../../lib/storage/database/prepackaged/networks';
import { IPublicDeriver, IGetAllUtxos, IHasUtxoChains, } from '../../lib/storage/models/PublicDeriver/interfaces';
import { ConceptualWallet } from '../../lib/storage/models/ConceptualWallet/index';
import { builtSendTokenList } from '../../../common';
import type { TokenRow } from '../../lib/storage/database/primitives/tables';
import { setRuntime, WalletType } from '@emurgo/yoroi-eutxo-txs/dist/kernel'
import {
  UTxOSet as LibUtxoSet,
  Value as LibValue,
  Amount as LibAmount,
  Address as LibAddress,
  WalletAddress as LibWalletAddress,
  NativeAssets as LibNativeAssets,
} from '@emurgo/yoroi-eutxo-txs/dist/classes'
import {
  NotEnoughMoneyToSendError as LibNotEnoughMoneyToSendError,
  OverflowError as LibOverflowError,
  NoOutputError as LibNoOutputError,
} from '@emurgo/yoroi-eutxo-txs/dist/errors'
import { TxBuilder, SendRequest } from '@emurgo/yoroi-eutxo-txs/dist/tx-builder'
import blake2b from 'blake2b';
import { derivePrivateByAddressing } from '../../lib/cardanoCrypto/deriveByAddressing';

/**
 * based off what the cardano-wallet team found worked empirically
 * note: slots are 1 second in Shelley mainnet, so this is 2hrs
 */
const defaultTtlOffset = 7200;

export type TxOutput = {|
  ...Address,
  amount: MultiToken,
  dataHash?: string,
  data?: string,
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
  witness?: ?CardanoUtxoScriptWitness,
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
    // if (includedTargets.length === 0 && remaining.hasInput) {
    //   return AddInputResult.NO_NEED;
    // }

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

  if (witness == null) {
    logErr(
      () => {
        txBuilder.add_regular_input(
          wasmAddr,
          txInput,
          wasmAmount
        );
      },
      'Failed to add a regular input',
    );
  } else if (witness.nativeScript != null) {
    const nativeScript = logErr(
      // $FlowFixMe[prop-missing]
      () => RustModule.WalletV4.NativeScript.from_bytes(hexToBytes(witness.nativeScript)),
      `Failed to parse witness.nativeScript: ${JSON.stringify(witness)}`,
    );
    logErr(
      () => {
        txBuilder.add_native_script_input(
          nativeScript,
          txInput,
          wasmAmount,
        );
      },
      'Failed to add a native script input',
    );
  } else if (witness.plutusScript != null) {
    const plutusScript = logErr(
      // $FlowFixMe[prop-missing]
      () => RustModule.WalletV4.PlutusScript.from_bytes(hexToBytes(witness.plutusScript)),
      `Failed to parse witness.plutusScript: ${JSON.stringify(witness)}`,
    );
    const datum = logErr(
      // $FlowFixMe[prop-missing]
      () => RustModule.WalletV4.PlutusData.from_bytes(hexToBytes(witness.datum)),
      `Failed to parse witness.datum: ${JSON.stringify(witness)}`,
    );
    const redeemer = logErr(
      // $FlowFixMe[prop-missing]
      () => RustModule.WalletV4.Redeemer.from_bytes(hexToBytes(witness.redeemer)),
      `Failed to parse witness.redeemer: ${JSON.stringify(witness)}`,
    );
    logErr(
      () => {
        txBuilder.add_plutus_script_input(
          RustModule.WalletV4.PlutusWitness.new(plutusScript, datum, redeemer),
          txInput,
          wasmAmount,
        );
      },
      'Failed to add a plutus script input',
    );
  }
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
export async function newAdaUnsignedTx(
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  allUtxos: Array<CardanoAddressedUtxo>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFeeCoefficient: string,
    linearFeeConstant: string,
    coinsPerUtxoWord: string,
    poolDeposit: string,
    keyDeposit: string,
    networkId: number,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
  allowNoOutputs: boolean,
  metadata: RustModule.WalletV4.AuxiliaryData | void,
): Promise<V4UnsignedTxAddressedUtxoResponse> {
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
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxo(
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

export async function newAdaUnsignedTxForConnector(
  outputs: Array<TxOutput>,
  mint: Array<TxMint>,
  auxiliaryData: TxAuxiliaryData,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  mustIncludeUtxos: Array<[CardanoAddressedUtxo, ?CardanoUtxoScriptWitness]>,
  coinSelectUtxos: Array<CardanoAddressedUtxo>,
  absSlotNumber: BigNumber,
  validityStart: ?number,
  ttl: ?number,
  requiredSigners: ?Array<string>,
  protocolParams: {|
    linearFeeCoefficient: string,
    linearFeeConstant: string,
    coinsPerUtxoWord: string,
    poolDeposit: string,
    keyDeposit: string,
    networkId: number,
  |},
): Promise<V4UnsignedTxAddressedUtxoResponse> {
  const toRemoteUnspentOutput = (utxo: CardanoAddressedUtxo): RemoteUnspentOutput => ({
    amount: utxo.amount,
    receiver: utxo.receiver,
    tx_hash: utxo.tx_hash,
    tx_index: utxo.tx_index,
    utxo_id: utxo.utxo_id,
    assets: utxo.assets,
  });
  const mustIncludeRemoteOutputs: Array<[RemoteUnspentOutput, ?CardanoUtxoScriptWitness]> = [];
  const addressingMapForMustIncludeUtxos = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  const addressingMapForCoinSelectUtxos = new Map<RemoteUnspentOutput, CardanoAddressedUtxo>();
  for (const [utxo, witness] of mustIncludeUtxos) {
    const remoteUnspentOutput = toRemoteUnspentOutput(utxo);
    mustIncludeRemoteOutputs.push([remoteUnspentOutput, witness]);
    addressingMapForMustIncludeUtxos.set(remoteUnspentOutput, utxo);
  }
  for (const utxo of coinSelectUtxos) {
    addressingMapForCoinSelectUtxos.set(toRemoteUnspentOutput(utxo), utxo);
  }
  const unsignedTxResponse = await newAdaUnsignedTxFromUtxoForConnector(
    outputs,
    mint,
    auxiliaryData,
    changeAdaAddr,
    mustIncludeRemoteOutputs,
    Array.from(addressingMapForCoinSelectUtxos.keys()),
    absSlotNumber,
    validityStart,
    ttl,
    requiredSigners,
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

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export async function newAdaUnsignedTxFromUtxo(
  outputs: Array<TxOutput>,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  protocolParams: {|
    linearFeeCoefficient: string,
    linearFeeConstant: string,
    coinsPerUtxoWord: string,
    poolDeposit: string,
    keyDeposit: string,
    networkId: number,
  |},
  certificates: $ReadOnlyArray<RustModule.WalletV4.Certificate>,
  withdrawals: $ReadOnlyArray<{|
    address: RustModule.WalletV4.RewardAddress,
    amount: RustModule.WalletV4.BigNum,
  |}>,
  allowNoOutputs: boolean,
  auxiliaryData: RustModule.WalletV4.AuxiliaryData | void,
): Promise<V4UnsignedTxUtxoResponse> {
  await RustModule.load();
  setRuntime(RustModule.CrossCsl.init);

  const defaultNetworkConfig = {
    linearFee: {
      coefficient: protocolParams.linearFeeCoefficient,
      constant: protocolParams.linearFeeConstant,
    },
    coinsPerUtxoWord: protocolParams.coinsPerUtxoWord,
    poolDeposit: protocolParams.poolDeposit,
    keyDeposit: protocolParams.keyDeposit,
    maxValueSize: 5000,
    maxTxSize: 16384,
    memPriceFrom: 577,
    memPriceTo: 1000,
    stepPriceFrom: 721,
    stepPriceTo: 10000000,
  };

  const utxoSet = new LibUtxoSet(
    await Promise.all(
      utxos.map(toLibUTxO)
    )
  );

  const txBuilder = await TxBuilder.new(defaultNetworkConfig, utxoSet);

  // When both hash and datum are present - datum is added as extra witness
  const extraWitnessDatumsPresent =
    outputs.some(o => o.data != null && o.dataHash != null);

  const sendRequest = await SendRequest.from(outputs.map(output => {
    const defaultTokenAmount = output.amount.getDefaultEntry().amount.toString();
    const nondefaultTokens = output.amount.values.filter(
      ({ identifier }) => identifier !== outputs[0].amount.defaults.defaultIdentifier
    );

    return {
      data: output.data,
      dataHash: output.dataHash,
      receiver: output.address,
      value: new LibValue(
        new LibAmount(defaultTokenAmount),
        LibNativeAssets.from(
          nondefaultTokens.map(t => {
            const [policyId, assetName] = t.identifier.split('.');
            return {
              asset: {
                policy: Buffer.from(policyId, 'hex'),
                name: Buffer.from(assetName, 'hex'),
              },
              amount: new LibAmount(t.amount.toString()),
            };
          })
        ),
      ),
    };
  }));

  try {
    await txBuilder.withSendRequest(sendRequest);
  } catch (error) {
    if (error instanceof LibNotEnoughMoneyToSendError) {
      throw new NotEnoughMoneyToSendError();
    }
    if (error instanceof LibOverflowError) {
      throw new AssetOverflowError();
    }
    if (String(error).includes('less than the minimum UTXO value')) {
      throw new CannotSendBelowMinimumValueError();
    }
    throw error;
  }

  if (auxiliaryData) {
    await txBuilder.setAuxiliaryData(auxiliaryData.to_bytes());
  }

  if (certificates.length > 0) {
    const certsWasm = certificates.reduce(
      (certs, cert) => { certs.add(cert); return certs; },
      RustModule.WalletV4.Certificates.new()
    );
    await txBuilder.setCertificates(certsWasm.to_bytes());
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
    await txBuilder.setWithdrawals(withdrawalWasm.to_bytes());
  }

  // must set TTL before specifying change address, otherwise the TX builder
  // miscalculate the tx fee by several bytes fewer
  txBuilder.setTtl(absSlotNumber.plus(defaultTtlOffset).toNumber());

  const changeAddress = changeAdaAddr &&
    await LibWalletAddress.from(
      changeAdaAddr.address,
      WalletType.Shelley,
      {
        path: changeAdaAddr.addressing.path,
        start: changeAdaAddr.addressing.startLevel,
      }
    );

  if (extraWitnessDatumsPresent) {
    await txBuilder.calcScriptDataHash('default');
  }

  await txBuilder.addChangeAndFee(changeAddress);

  let unsignedTx;
  try {
    unsignedTx = await txBuilder.build();
  } catch (error) {
    if (error instanceof LibNoOutputError) {
      throw new NoOutputsError();
    }
    throw error;
  }

  const signRequestChangeAddr = [];
  if (unsignedTx.change) {
    signRequestChangeAddr.push({
      address: unsignedTx.change.address.hex,
      addressing: {
        path: unsignedTx.change.address.spendingKeyInfo.path,
        startLevel: unsignedTx.change.address.spendingKeyInfo.start,
      },
      values: libValueToMultiToken(
        unsignedTx.change.value,
        protocolParams.networkId,
        PRIMARY_ASSET_CONSTANTS.Cardano
      ),
    });
  }
  const utxosMap = new Map(utxos.map(u => [u.utxo_id, u]));
  return {
    senderUtxos: unsignedTx.inputs.asArray().map(u => utxosMap.get(u.tx + u.index)),
    txBuilder: unsignedTx.builder.wasm,
    changeAddr: signRequestChangeAddr,
  };
}

export async function maxSendableADA(
  request: {|
    publicDeriver: {
      networkId: number,
      utxos: IGetAllUtxosResponse,
      defaultTokenId: string,
      ...
    },
    absSlotNumber: BigNumber,
    receiver: string | null,
    tokens: Array<$ReadOnly<{|
      token: $ReadOnly<TokenRow>,
      shouldSendAll?: boolean,
      amount?: string,
    |}>>
  |}
): Promise<BigNumber> {
  try {
    const network = getNetworkById(request.publicDeriver.networkId);
    const config = getCardanoHaskellBaseConfig(network)
      .reduce((acc, next) => Object.assign(acc, next), {});

    const protocolParams = {
      keyDeposit: RustModule.WalletV4.BigNum.from_str(config.KeyDeposit),
      linearFee: RustModule.WalletV4.LinearFee.new(
        RustModule.WalletV4.BigNum.from_str(config.LinearFee.coefficient),
        RustModule.WalletV4.BigNum.from_str(config.LinearFee.constant),
      ),
      coinsPerUtxoWord: RustModule.WalletV4.BigNum.from_str(config.CoinsPerUtxoWord),
      poolDeposit: RustModule.WalletV4.BigNum.from_str(config.PoolDeposit),
      networkId: network.NetworkId,
    };

    const addressedUtxo = asAddressedUtxo(request.publicDeriver.utxos);
    const totalBalance = addressedUtxo
      .map(utxo => new BigNumber(utxo.amount))
      .reduce(
        (acc, amount) => acc.plus(amount),
        new BigNumber(0)
      );
    if (totalBalance.isZero()) {
      throw new NotEnoughMoneyToSendError();
    }

    const txBuilder = RustModule.WalletV4TxBuilder(protocolParams);
    txBuilder.set_ttl(request.absSlotNumber.plus(defaultTtlOffset).toNumber());

    if (request.receiver == null) {
      throw new Error(`${nameof(maxSendableADA)} requires wallet address.`);
    }
    const wasmReceiver = normalizeToAddress(request.receiver);
    if (wasmReceiver == null) {
      throw new Error(`${nameof(maxSendableADA)} receiver not a valid Shelley address`);
    }
    const isAssetsSelected = request.tokens.length >= 2 // [ada, ...tokens]
    if (isAssetsSelected) {
      const defaultToken = {
        defaultNetworkId: request.publicDeriver.networkId,
        defaultIdentifier: request.publicDeriver.defaultTokenId,
      };
      txBuilder.add_output(
        RustModule.WalletV4.TransactionOutput.new(
          wasmReceiver,
          cardanoValueFromMultiToken(builtSendTokenList(
            defaultToken,
            request.tokens,
            addressedUtxo.map(utxo => multiTokenFromRemote(utxo, protocolParams.networkId))
          )),
        )
      )
    }

    for (const input of addressedUtxo) {
      if (addUtxoInput(
        txBuilder,
        undefined,
        {
          amount: input.amount,
          receiver: input.receiver,
          tx_hash: input.tx_hash,
          tx_index: input.tx_index,
          utxo_id: input.utxo_id,
          assets: input.assets,
        },
        false,
        { networkId: network.NetworkId }
      ) === AddInputResult.OVERFLOW) {
        throw new AssetOverflowError();
      }
    }

    txBuilder.add_change_if_needed(wasmReceiver);
    const outputs = txBuilder.build().outputs();
    let adaLockedForAssets = 0;
    if (isAssetsSelected) {
      const adaStr = outputs.get(0).amount().coin().to_str();
      adaLockedForAssets = new BigNumber(adaStr);
    }

    for (let i = 0; i < outputs.len(); i++) {
      const output = outputs.get(i);
      const value = output.amount();
      const assets = value.multiasset();
      if (assets == null || assets.len() === 0) {
        return new BigNumber(value.coin().to_str()).plus(adaLockedForAssets);
      }
    }
    // No pure sendable ADA left
    if (isAssetsSelected) return new BigNumber(adaLockedForAssets);
    // Reaching this point means user has not enough pure ADA to send.
    throw new NotEnoughMoneyToSendError();
  } catch (e) {
    if (String(e).includes('Not enough ADA')) {
      throw new NotEnoughMoneyToSendError();
    }

    throw e;
  }
}

async function newAdaUnsignedTxFromUtxoForConnector(
  outputs: Array<TxOutput>,
  mint: Array<TxMint>,
  auxiliaryData: TxAuxiliaryData,
  changeAdaAddr: void | {| ...Address, ...Addressing |},
  mustIncludeUtxos: Array<[RemoteUnspentOutput, ?CardanoUtxoScriptWitness]>,
  coinSelectUtxos: Array<RemoteUnspentOutput>,
  absSlotNumber: BigNumber,
  validityStart: ?number,
  ttl: ?number,
  requiredSigners: ?Array<string>,
  protocolParams: {|
    linearFeeCoefficient: string,
    linearFeeConstant: string,
    coinsPerUtxoWord: string,
    poolDeposit: string,
    keyDeposit: string,
    networkId: number,
  |},
): Promise<V4UnsignedTxUtxoResponse> {
  await RustModule.load();
  setRuntime(RustModule.CrossCsl.init);

  const defaultNetworkConfig = {
    linearFee: {
      coefficient: protocolParams.linearFeeCoefficient,
      constant: protocolParams.linearFeeConstant,
    },
    coinsPerUtxoWord: protocolParams.coinsPerUtxoWord,
    poolDeposit: protocolParams.poolDeposit,
    keyDeposit: protocolParams.keyDeposit,
    maxValueSize: 5000,
    maxTxSize: 16384,
    memPriceFrom: 577,
    memPriceTo: 1000,
    stepPriceFrom: 721,
    stepPriceTo: 10000000,
  };

  const utxoSet = new LibUtxoSet(
    await Promise.all(
      coinSelectUtxos.map(toLibUTxO)
    )
  );

  const txBuilder = await TxBuilder.new(defaultNetworkConfig, utxoSet);

  await txBuilder.addRequiredInputs(
    await Promise.all(
      mustIncludeUtxos.map(async ([utxo, witness]) => {
        let taggedWitness;
        if (witness == null) {
          taggedWitness = [];
        } else if (witness.nativeScript) {
          taggedWitness = [{
            type: 'native',
            nativeScript: witness.nativeScript,
          }];
        } else if (witness.plutusScript) {
          taggedWitness = [{
            type: 'plutus',
            plutusScript: witness.plutusScript,
            datum: witness.datum,
            redeemer: witness.redeemer,
          }];
        } else {
          throw new Error('unxpected witness value');
        }
        return [await toLibUTxO(utxo), ...taggedWitness];
      })
    )
  );

  // must set TTL before specifying change address, otherwise the TX builder
  // miscalculate the tx fee by several bytes fewer
  if (ttl != null) {
    await txBuilder.setTtl(ttl);
  } else {
    await txBuilder.setTtl(absSlotNumber.plus(defaultTtlOffset).toNumber());
  }

  if (validityStart != null) {
    await txBuilder.setValidityStartInterval(validityStart);
  }
  if (requiredSigners != null) {
    await txBuilder.addRequiredSigners(requiredSigners);
  }
  const metadata = auxiliaryData.metadata ?? {};
  if (Object.keys(metadata).length > 0) {
    const record = {};
    for (const tag of Object.keys(metadata)) {
      record[parseInt(tag, 10)] = metadata[tag];
    }
    await txBuilder.withMetadata(record);
  }
  if (auxiliaryData.nativeScripts) {
    await txBuilder.addNativeScripts(auxiliaryData.nativeScripts);
  }

  await txBuilder.addMint(mint);

  const sendRequest = await SendRequest.from(outputs.map(output => {
    const defaultTokenAmount = output.amount.getDefaultEntry().amount.toString();
    const nondefaultTokens = output.amount.values.filter(
      ({ identifier }) => identifier !== outputs[0].amount.defaults.defaultIdentifier
    );

    return {
      receiver: output.address,
      value: new LibValue(
        new LibAmount(defaultTokenAmount),
        LibNativeAssets.from(
          nondefaultTokens.map(t => {
            const [policyId, assetName] = t.identifier.split('.');
            return {
              asset: {
                policy: Buffer.from(policyId, 'hex'),
                name: Buffer.from(assetName, 'hex'),
              },
              amount: new LibAmount(t.amount.toString()),
            };
          })
        ),
      ),
    };
  }));

  try {
    await txBuilder.withSendRequest(sendRequest);
  } catch (error) {
    if (error instanceof LibNotEnoughMoneyToSendError) {
      throw new NotEnoughMoneyToSendError();
    }
    if (String(error).includes('less than the minimum UTXO value')) {
      throw new CannotSendBelowMinimumValueError();
    }
    throw error;
  }

  await txBuilder.prepareForPlutus(
    protocolParams.networkId > 0 ? 'vasil' : 'default'
  );

  const changeAddress = changeAdaAddr &&
    await LibWalletAddress.from(
      changeAdaAddr.address,
      WalletType.Shelley,
      {
        path: changeAdaAddr.addressing.path,
        start: changeAdaAddr.addressing.startLevel,
      }
    );

  await txBuilder.addChangeAndFee(changeAddress);

  const unsignedTx = await txBuilder.build();

  const signRequestChangeAddr = [];
  if (unsignedTx.change) {
    signRequestChangeAddr.push({
      address: unsignedTx.change.address.hex,
      addressing: {
        path: unsignedTx.change.address.spendingKeyInfo.path,
        startLevel: unsignedTx.change.address.spendingKeyInfo.start,
      },
      values: libValueToMultiToken(
        unsignedTx.change.value,
        protocolParams.networkId,
        PRIMARY_ASSET_CONSTANTS.Cardano
      ),
    });
  }

  const utxosMap = new Map(
    [
      ...mustIncludeUtxos.map(([utxo, _])=>utxo),
      ...coinSelectUtxos
    ].map(u => [u.utxo_id, u])
  );
  return {
    senderUtxos: unsignedTx.inputs.asArray().map(u => utxosMap.get(u.tx + u.index)),
    txBuilder: unsignedTx.builder.wasm,
    changeAddr: signRequestChangeAddr,
  };
}

type UtxoOrAddressing = CardanoAddressedUtxo | {| ...Address, ...Addressing |};

export function signTransaction(
  senderUtxos: Array<CardanoAddressedUtxo>,
  unsignedTx:
    RustModule.WalletV4.TransactionBuilder |
    RustModule.WalletV4.TransactionBody |
    Buffer |
    Uint8Array,
  keyLevel: number,
  signingKey: RustModule.WalletV4.Bip32PrivateKey,
  stakingKeyWits: Set<string>,
  metadata: ?RustModule.WalletV4.AuxiliaryData,
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

  let txBody;
  let txHash;
  let txWitSet;
  if (unsignedTx instanceof RustModule.WalletV4.TransactionBuilder) {
    const tx = unsignedTx.build_tx();
    txBody = tx.body();
    txWitSet = tx.witness_set();
    txHash = RustModule.WalletV4.hash_transaction(txBody);
  } else if (unsignedTx instanceof RustModule.WalletV4.TransactionBody) {
    txBody = unsignedTx;
    txHash = RustModule.WalletV4.hash_transaction(txBody);
  } else if (unsignedTx instanceof Buffer || unsignedTx instanceof Uint8Array) {
    // note: we are calculating the tx hash from the raw tx body bytes, which
    // probably won't match the serialized `txBody`. But this happens only for
    // connector signing and only the witness will be returned so this is more
    // likely to match what the client expects.
    txBody = RustModule.WalletV4.TransactionBody.from_bytes(unsignedTx);
    txHash = RustModule.WalletV4.TransactionHash.from_bytes(
      blake2b(256 / 8).update(unsignedTx).digest('binary')
    );
  } else {
    throw new Error('unexpected tx body type');
  }

  const witnessSet = txWitSet ?? RustModule.WalletV4.TransactionWitnessSet.new();
  const vkeyWits = witnessSet.vkeys() ?? RustModule.WalletV4.Vkeywitnesses.new();
  const bootstrapWits = witnessSet.bootstraps() ?? RustModule.WalletV4.BootstrapWitnesses.new();

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
      throw new Error(`${nameof(genFilterSmallUtxo)} input not a valid Shelley address`);
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

function libValueToMultiToken(
  value: any,
  defaultNetworkId: number,
  defaultIdentifier: string,
): MultiToken {
  return new MultiToken(
    [
      {
        amount: new BigNumber(value.amount.toString()),
        identifier: defaultIdentifier,
        networkId: defaultNetworkId,
      },
      ...value.assets.asArray().map(([nativeAsset, amount]) => (
        {
          amount: new BigNumber(amount.toString()),
          identifier: nativeAsset.getHash(),
          networkId: defaultNetworkId,
        }
      )),
    ],
    {
      defaultIdentifier,
      defaultNetworkId,
    }
  );
}

export async function toLibUTxO(utxo: RemoteUnspentOutput): any {
  return {
    address: await LibAddress.from(utxo.receiver),
    tx: utxo.tx_hash,
    index: utxo.tx_index,
    value: new LibValue(
      new LibAmount(utxo.amount),
      LibNativeAssets.from(
        utxo.assets.map(asset => (
          {
            asset: {
              policy: Buffer.from(asset.policyId, 'hex'),
              name: Buffer.from(asset.name, 'hex'),
            },
            amount: new LibAmount(asset.amount),
          }
        ))
      )
    ),
  };
}
