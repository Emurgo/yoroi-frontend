// @flow

// Handles creating transactions

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

  const wasmInputs = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(
    request.utxos.map(utxo => {
      return {
        boxId: utxo.boxId,
        value: Number.parseInt(utxo.amount, 10),
        ergoTree: utxo.ergoTree,
        assets: (utxo.assets ?? []).map(asset => ({
          amount: asset.amount,
          tokenId: asset.tokenId,
        })),
        creationHeight: utxo.creationHeight,
        additionalRegisters: utxo.additionalRegisters || Object.freeze({}),
        transactionId: utxo.tx_hash,
        index: utxo.tx_index,
      };
    })
  );

  const inputAmountSum = request.utxos.reduce(
    (prev, next) => prev.plus(next.amount),
    new BigNumber(0)
  );
  if (inputAmountSum.minus(request.txFee).lt(
    request.protocolParams.MinimumBoxValue
  )) {
    throw new NotEnoughMoneyToSendError();
  }

  const assets = getAssets(request.utxos);

  // recall: sendall is equivalent to sending all the ERG to the change address
  const change = (() => {
    const changeList = new RustModule.SigmaRust.ErgoBoxAssetsDataList();

    const tokens = new RustModule.SigmaRust.Tokens();
    for (const entry of assets.entries()) {
      tokens.add(new RustModule.SigmaRust.Token(
        RustModule.SigmaRust.TokenId.from_str(entry[0]),
        RustModule.SigmaRust.TokenAmount.from_i64(
          RustModule.SigmaRust.I64.from_str(entry[1].toString())
        )
      ));
    }
    const value = RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(
        inputAmountSum.minus(request.txFee).toString()
      )
    );
    changeList.add(
      new RustModule.SigmaRust.ErgoBoxAssetsData(
        value,
        tokens
      )
    );
    return changeList;
  })();

  const allUtxoSelection = new RustModule.SigmaRust.BoxSelection(
    wasmInputs,
    change
  );

  const txBuilder = RustModule.SigmaRust.TxBuilder.new(
    allUtxoSelection,
    RustModule.SigmaRust.ErgoBoxCandidates.empty(),
    request.currentHeight,
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.txFee.toString())
    ),
    RustModule.SigmaRust.Address.from_bytes(
      Buffer.from(request.protocolParams.FeeAddress, 'hex')
    ),
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.protocolParams.MinimumBoxValue.toString())
    ),
  );

  return {
    senderUtxos: request.utxos,
    unsignedTx: txBuilder,
    changeAddr: request.receiver.addressing
      ? [{
        addressing: request.receiver.addressing,
        address: request.receiver.address,
        value: new BigNumber(change.get(0).value().as_i64().to_str()),
        // TODO: add tokens
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
  if (request.utxos.length === 0) {
    // Ergo requires at least 1 input per transaction
    throw new NotEnoughMoneyToSendError();
  }

  const boxCandidates = (() => {
    let candidates = null;
    for (const output of request.outputs) {
      // TODO: currently we don't handle tokens in the output
      // so it all gets sent back as change
      const wasmOutput = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
        RustModule.SigmaRust.BoxValue.from_i64(
          RustModule.SigmaRust.I64.from_str(output.amount)
        ),
        RustModule.SigmaRust.Contract.pay_to_address(
          RustModule.SigmaRust.Address.from_bytes(
            Buffer.from(output.address, 'hex')
          )
        ),
        request.currentHeight
      );

      const candidate = wasmOutput.build();
      if (candidates == null) {
        candidates = new RustModule.SigmaRust.ErgoBoxCandidates(candidate);
      } else {
        candidates.add(candidate);
      }
    }
    if (candidates == null) {
      throw new Error(`${nameof(newErgoUnsignedTxFromUtxo)} Ergo txs require at least one output`);
    }
    return candidates;
  })();

  const outputs = request.outputs.reduce(
    (sum, next) => sum.plus(next.amount),
    new BigNumber(0),
  ).plus(request.txFee);

  const wasmInputs = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(
    request.utxos.map(utxo => {
      return {
        boxId: utxo.boxId,
        value: Number.parseInt(utxo.amount, 10),
        ergoTree: utxo.ergoTree,
        assets: (utxo.assets ?? []).map(asset => ({
          amount: asset.amount,
          tokenId: asset.tokenId,
        })),
        creationHeight: utxo.creationHeight,
        additionalRegisters: utxo.additionalRegisters || Object.freeze({}),
        transactionId: utxo.tx_hash,
        index: utxo.tx_index,
      };
    })
  );

  const selectedInputs = (() => {
    const boxSelectors = new RustModule.SigmaRust.SimpleBoxSelector();
    try {
      return boxSelectors.select(
        wasmInputs,
        RustModule.SigmaRust.BoxValue.from_i64(
          RustModule.SigmaRust.I64.from_str(outputs.toString())
        ),
        new RustModule.SigmaRust.Tokens() // TODO: handle tokens in output
      );
    } catch (e) {
      throw new NotEnoughMoneyToSendError();
    }
  })();

  const txBuilder = RustModule.SigmaRust.TxBuilder.new(
    selectedInputs,
    boxCandidates,
    request.currentHeight,
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.txFee.toString())
    ),
    RustModule.SigmaRust.Address.from_bytes(
      Buffer.from(request.changeAddr.address, 'hex')
    ),
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.protocolParams.MinimumBoxValue.toString())
    ),
  );

  const changeAddr = (() => {
    const result = [];
    const selectedChange = selectedInputs.change();
    for (let i = 0; i < selectedChange.len(); i++) {
      const change = selectedChange.get(i);
      // TODO: token information is dropped
      result.push({
        address: request.changeAddr.address,
        value: new BigNumber(change.value().as_i64().to_str()),
        addressing: request.changeAddr.addressing,
      });
    }
    return result;
  })();

  const includedBoxes = (() => {
    const selectedBoxes = selectedInputs.boxes();
    const idSet = new Set<string>();
    for (let i = 0; i < selectedBoxes.len(); i++) {
      const box = selectedBoxes.get(i);
      idSet.add(box.box_id().to_str());
    }
    return idSet;
  })();
  return {
    changeAddr,
    senderUtxos: request.utxos.filter(utxo => includedBoxes.has(utxo.boxId)),
    unsignedTx: txBuilder,
  };
}

export function signTransaction(request: {|
  signRequest: ErgoTxSignRequest,
  keyLevel: number,
  signingKey: BIP32PrivateKey
|}): $Diff<SignedRequest, BackendNetworkInfo> {
  if (request.signRequest.unsignedTx.data_inputs().len() > 0) {
    throw new Error(`${nameof(signTransaction)} data inputs not supported by sigma rust`);
  }

  const unsignedTx = request.signRequest.unsignedTx.build();

  const wasmKeys = generateKeys({
    senderUtxos: request.signRequest.senderUtxos,
    keyLevel: request.keyLevel,
    signingKey: request.signingKey,
  });

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
