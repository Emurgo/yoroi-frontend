// @flow

// Handles interfacing w/ ergo-ts to create transaction

import BigNumber from 'bignumber.js';
import type {
  ErgoUnsignedTxUtxoResponse,
  ErgoUnsignedTxAddressedUtxoResponse,
  ErgoAddressedUtxo,
} from './types';
import type {
  RemoteUnspentOutput,
  SignedRequest,
} from '../state-fetch/types';
import type {
  BackendNetworkInfo,
} from '../../../common/lib/state-fetch/types';
import {
  NotEnoughMoneyToSendError,
} from '../../../common/errors';

import {
  Bip44DerivationLevels,
} from '../../../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type {
  Address, Addressing,
} from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import {
  Address as ErgoAddress,
  ErgoBox,
  Transaction,
} from '@coinbarn/ergo-ts';
import { BIP32PrivateKey } from '../../../common/lib/crypto/keys/keyRepository';
import { deriveByAddressing } from '../../../common/lib/crypto/keys/utils';
import { ErgoTxSignRequest } from './ErgoTxSignRequest';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';

type TxOutput = {|
  ...Address,
  amount: string,
|};

export function sendAllUnsignedTx(request: {|
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  currentHeight: number,
  utxos: Array<ErgoAddressedUtxo>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
  |},
|}): ErgoUnsignedTxAddressedUtxoResponse {
  const addressingMap = new Map<RemoteUnspentOutput, ErgoAddressedUtxo>();
  for (const utxo of request.utxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      creationHeight: utxo.creationHeight,
      boxId: utxo.boxId,
      assets: utxo.assets,
      additionalRegisters: utxo.additionalRegisters,
      ergoTree: utxo.ergoTree,
    }, utxo);
  }
  const unsignedTxResponse = sendAllUnsignedTxFromUtxo({
    receiver: request.receiver,
    currentHeight: request.currentHeight,
    protocolParams: request.protocolParams,
    txFee: request.txFee,
    utxos: Array.from(addressingMap.keys()),
  });

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
    unsignedTx: unsignedTxResponse.unsignedTx,
    changeAddr: unsignedTxResponse.changeAddr,
  };
}

export function sendAllUnsignedTxFromUtxo(request: {|
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  currentHeight: number,
  utxos: Array<RemoteUnspentOutput>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
  |},
|}): ErgoUnsignedTxUtxoResponse {
  if (request.utxos.length === 0) {
    // Ergo requires at least 1 input per transaction
    throw new NotEnoughMoneyToSendError();
  }
  const inputs: Array<{|
    self: RemoteUnspentOutput,
    box: ErgoBox,
  |}> = [];
  let inputAmountSum = new BigNumber(0);
  for (const utxo of request.utxos) {
    inputs.push({
      self: utxo,
      box: new ErgoBox(
        utxo.boxId,
        Number.parseInt(utxo.amount, 10),
        utxo.creationHeight,
        ErgoAddress.fromBytes(
          Buffer.from(utxo.receiver, 'hex')
        ),
        utxo.assets == null
          ? undefined
          : utxo.assets.map(asset => ({ ...asset })),
        utxo.additionalRegisters
      )
    });
    inputAmountSum = inputAmountSum.plus(utxo.amount);
  }

  const outputSum = request.txFee
    .plus(request.protocolParams.MinimumBoxValue); // min value for the output

  if (inputAmountSum.lt(outputSum)) {
    throw new NotEnoughMoneyToSendError();
  }

  const fee = new ErgoBox(
    '',
    request.txFee.toNumber(),
    request.currentHeight,
    ErgoAddress.fromBytes(
      Buffer.from(request.protocolParams.FeeAddress, 'hex')
    ),
  );

  const output = new ErgoBox(
    '', // TODO: do we need this for outputs?
    inputAmountSum.minus(fee.value).toNumber(),
    request.currentHeight,
    ErgoAddress.fromBytes(
      Buffer.from(request.receiver.address, 'hex')
    ),
    // include all the tokens as well
    Array.from(
      getAssets(request.utxos).entries()
    )
      .map(entry => ({ tokenId: entry[0], amount: entry[1].toNumber(), }))
  );

  const unsignedTx = new Transaction(
    inputs.map(input => input.box.toInput()),
    [fee, output],
    [],
  );

  return {
    senderUtxos: inputs.map(input => input.self),
    unsignedTx,
    changeAddr: request.receiver.addressing
      ? [{
        addressing: request.receiver.addressing,
        address: request.receiver.address,
        value: new BigNumber(output.value),
      }]
      : [],
  };
}

/**
 * we send all UTXO associated with an address.
 * This maximizes privacy.
 * The address will not be part of the input if it has no UTXO in it
 */
export function newErgoUnsignedTx(request: {|
  outputs: Array<TxOutput>,
  currentHeight: number,
  changeAddr: {| ...Address, ...Addressing |},
  utxos: Array<ErgoAddressedUtxo>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
  |},
|}): ErgoUnsignedTxAddressedUtxoResponse {
  const addressingMap = new Map<RemoteUnspentOutput, ErgoAddressedUtxo>();
  for (const utxo of request.utxos) {
    addressingMap.set({
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      creationHeight: utxo.creationHeight,
      boxId: utxo.boxId,
      assets: utxo.assets,
      additionalRegisters: utxo.additionalRegisters,
      ergoTree: utxo.ergoTree,
    }, utxo);
  }
  const unsignedTxResponse = newErgoUnsignedTxFromUtxo({
    outputs: request.outputs,
    currentHeight: request.currentHeight,
    changeAddr: request.changeAddr,
    utxos: Array.from(addressingMap.keys()),
    txFee: request.txFee,
    protocolParams: request.protocolParams,
  });

  const addressedUtxos = unsignedTxResponse.senderUtxos.map(
    utxo => {
      const addressedUtxo = addressingMap.get(utxo);
      if (addressedUtxo == null) {
        throw new Error(`${nameof(newErgoUnsignedTx)} utxo reference was changed. Should not happen`);
      }
      return addressedUtxo;
    }
  );

  return {
    senderUtxos: addressedUtxos,
    unsignedTx: unsignedTxResponse.unsignedTx,
    changeAddr: unsignedTxResponse.changeAddr,
  };
}

function getAssets(
  utxos: Array<RemoteUnspentOutput>,
): Map<string, BigNumber> {
  const finalAssets = new Map();
  for (const utxo of utxos) {
    const { assets } = utxo;
    if (assets == null) {
      continue;
    }
    for (const asset of assets) {
      const currVal = finalAssets.get(asset.tokenId) || new BigNumber(0);
      finalAssets.set(asset.tokenId, currVal.plus(asset.amount));
    }
  }
  return finalAssets;
}

/**
 * This function operates on UTXOs without a way to generate the private key for them
 * Private key needs to be added afterwards either through
 * A) Addressing
 * B) Having the key provided externally
 */
export function newErgoUnsignedTxFromUtxo(request: {|
  outputs: Array<TxOutput>,
  currentHeight: number,
  changeAddr: {| ...Address, ...Addressing |},
  utxos: Array<RemoteUnspentOutput>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
  |},
|}): ErgoUnsignedTxUtxoResponse {
  const explicitOutputs = request.outputs.reduce(
    (sum, next) => sum.plus(next.amount),
    new BigNumber(0),
  );

  const inputs: Array<{|
    self: RemoteUnspentOutput,
    box: ErgoBox,
  |}> = [];
  let inputAmountSum = new BigNumber(0);
  const outputSum =
    explicitOutputs
      .plus(request.txFee)
      .plus(request.protocolParams.MinimumBoxValue); // note: always need to create change box

  // input selection
  for (const utxo of request.utxos) {
    inputs.push({
      self: utxo,
      box: new ErgoBox(
        utxo.boxId,
        Number.parseInt(utxo.amount, 10),
        utxo.creationHeight,
        ErgoAddress.fromBytes(
          Buffer.from(utxo.receiver, 'hex')
        ),
        utxo.assets == null
          ? undefined
          : utxo.assets.map(asset => ({ ...asset })),
        utxo.additionalRegisters
      )
    });
    inputAmountSum = inputAmountSum.plus(utxo.amount);

    if (inputAmountSum.gte(outputSum)) break;
  }

  if (inputAmountSum.lt(outputSum)) {
    throw new NotEnoughMoneyToSendError();
  }
  if (inputs.length === 0) {
    // Ergo requires at least 1 input per transaction
    throw new NotEnoughMoneyToSendError();
  }

  const outputs = request.outputs.map(output => new ErgoBox(
    '', // TODO: do we need this for outputs?
    Number.parseInt(output.amount, 10),
    request.currentHeight,
    ErgoAddress.fromBytes(
      Buffer.from(output.address, 'hex')
    )
  ));

  // note: when explicitly adding the fee
  // ergo-ts will not re-add the fee automatically (it checks if the fee is present)
  // we explicitly add the fee since ergo-ts is hardcoded to set the fee as a mainnet fee
  // but we want to support the testnet also
  outputs.push(
    new ErgoBox(
      '',
      request.txFee.toNumber(),
      request.currentHeight,
      ErgoAddress.fromBytes(
        Buffer.from(request.protocolParams.FeeAddress, 'hex')
      ),
    )
  );

  // note: this does input selection for you & adds fee + change also
  // warning: if you don't have enough for the min UTXO value, it won't create a change
  // this is dangerous since it could burn any multi-asset tokens
  // we avoid this happening by making sure we have enough for the change min utxo value
  // when doing the input selection above
  // warning: this is hardcoded for mainnet
  const unsignedTx = Transaction.fromOutputs(
    inputs.map(input => input.box),
    outputs,
    request.txFee.toNumber(),
  );

  // warning: this assumes the following behavior from ergo-ts:
  //  inputs are added in the following order
  //  1) explicit outputs
  //  2) one box for the fee
  //  3) any change boxes (or none)
  const changeBoxIndex = outputs.length;
  const changeBox = unsignedTx.outputs[changeBoxIndex];
  // throw if no change address was added since this could be burning multi-asset tokens
  if (changeBox == null) {
    throw new Error(`${nameof(newErgoUnsignedTxFromUtxo)} no change was found`);
  }

  // ergo-ts always sends the change to the first input in the list
  // but we want to instead send it to whatever address specified
  unsignedTx.outputs[changeBoxIndex] = new ErgoBox(
    '', // TODO: do we need this for outputs?
    changeBox.value,
    changeBox.creationHeight,
    ErgoAddress.fromBytes(
      Buffer.from(request.changeAddr.address, 'hex')
    ),
    changeBox.assets,
    changeBox.additionalRegisters
  );

  return {
    changeAddr: [{
      address: request.changeAddr.address,
      value: new BigNumber(changeBox.value),
      addressing: request.changeAddr.addressing,
    }],
    senderUtxos: inputs.map(input => input.self),
    unsignedTx,
  };
}

export function signTransaction(request: {|
  signRequest: ErgoTxSignRequest,
  keyLevel: number,
  signingKey: BIP32PrivateKey
|}): $Diff<SignedRequest, BackendNetworkInfo> {
  const unsignedTx = request.signRequest.unsignedTx.build();

  const wasmKeys = generateKeys({
    senderUtxos: request.signRequest.senderUtxos,
    keyLevel: request.keyLevel,
    signingKey: request.signingKey,
  });

  if (request.signRequest.unsignedTx.data_inputs().len() > 0) {
    throw new Error(`${nameof(signTransaction)} data inputs not supported by sigma rust`);
  }

  const signedTx = RustModule.SigmaRust.Wallet
    .from_secrets(wasmKeys)
    .sign_transaction(
      RustModule.SigmaRust.ErgoStateContext.dummy(), // TODO ?
      unsignedTx,
      request.signRequest.unsignedTx.box_selection().boxes(),
      RustModule.SigmaRust.ErgoBoxes.from_boxes_json([]), // TODO: not supported by sigma-rust
    );

  const json = signedTx.to_json();
  return {
    inputs: json.inputs,
    dataInputs: json.dataInputs,
    outputs: json.outputs.map(output => ({
      value: output.value,
      ergoTree: output.ergoTree,
      creationHeight: output.creationHeight,
      assets: output.assets,
      additionalRegisters: output.additionalRegisters,
    })),
  };
}

function generateKeys(request: {|
  senderUtxos: Array<ErgoAddressedUtxo>,
  keyLevel: number,
  signingKey: BIP32PrivateKey
|}): RustModule.SigmaRust.SecretKeys {
  const secretKeys = new RustModule.SigmaRust.SecretKeys();

  for (const utxo of request.senderUtxos) {
    const lastLevelSpecified = utxo.addressing.startLevel + utxo.addressing.path.length - 1;
    if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
      throw new Error(`${nameof(generateKeys)} incorrect addressing size`);
    }
    const key = deriveByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: request.keyLevel,
        key: request.signingKey,
      }
    });
    const privateKey = key.key.privateKey;
    if (privateKey == null) {
      throw new Error(`${nameof(generateKeys)} private key not found (should never happen)`);
    }

    const wasmKey = RustModule.SigmaRust.SecretKey.dlog_from_bytes(
      privateKey
    );
    // recall: duplicates are fine
    secretKeys.add(wasmKey);
  }

  return secretKeys;
}
