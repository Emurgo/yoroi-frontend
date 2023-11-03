// @flow

// Handles creating transactions

import BigNumber from 'bignumber.js';
import JSONBigInt from 'json-bigint';
import type { ErgoAddressedUtxo, ErgoUnsignedTxAddressedUtxoResponse, ErgoUnsignedTxUtxoResponse, } from './types';
import type { RemoteUnspentOutput, SignedRequest, } from '../state-fetch/types';
import type { BackendNetworkInfo, } from '../../../common/lib/state-fetch/types';
import { NotEnoughMoneyToSendError, } from '../../../common/errors';

import { Bip44DerivationLevels, } from '../../../ada/lib/storage/database/walletTypes/bip44/api/utils';
import type { Address, Addressing, Value, } from '../../../ada/lib/storage/models/PublicDeriver/interfaces';
import { BIP32PrivateKey } from '../../../common/lib/crypto/keys/keyRepository';
import { deriveByAddressing } from '../../../common/lib/crypto/keys/utils';
import { ErgoTxSignRequest } from './ErgoTxSignRequest';
import { RustModule } from '../../../ada/lib/cardanoCrypto/rustLoader';
import { PRIMARY_ASSET_CONSTANTS } from '../../../ada/lib/storage/database/primitives/enums';
import { MultiToken, } from '../../../common/lib/MultiToken';
import { toErgoBoxJSON } from './utils';

const SIGMA_CONSTANT_ADDRESS_PK_MATCHER_REG = /^08cd([0-9a-fA-F]+)$/;

type TxOutput = {|
  ...Address,
  amount: MultiToken,
|};

export function sendAllUnsignedTx(request: {|
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  currentHeight: number,
  utxos: Array<ErgoAddressedUtxo>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
    NetworkId: number,
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

function changeToModel(
  boxList: RustModule.SigmaRust.ErgoBoxAssetsDataList,
  addressing: $PropertyType<Addressing, 'addressing'>,
  address: string,
  networkId: number,
): Array<{| ...Address, ...Value, ...Addressing |}> {
  const changeBoxes = [];
  for (let i = 0; i < boxList.len(); i++) {
    const asset = boxList.get(i);
    const boxAsset = new MultiToken(
      [],
      {
        defaultNetworkId: networkId,
        defaultIdentifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      }
    );
    boxAsset.add({
      identifier: PRIMARY_ASSET_CONSTANTS.Ergo,
      amount: new BigNumber(asset.value().as_i64().to_str()),
      networkId,
    });
    const assets = asset.tokens();
    for (let j = 0; j < assets.len(); j++) {
      const token = assets.get(j);
      boxAsset.add({
        identifier: token.id().to_str(),
        amount: new BigNumber(token.amount().as_i64().to_str()),
        networkId,
      });
    }
    changeBoxes.push({
      addressing,
      address,
      values: boxAsset,
    });
  }
  return changeBoxes;
}

export function sendAllUnsignedTxFromUtxo(request: {|
  receiver: {| ...Address, ...InexactSubset<Addressing> |},
  currentHeight: number,
  utxos: Array<RemoteUnspentOutput>,
  txFee: BigNumber,
  protocolParams: {|
    FeeAddress: string,
    MinimumBoxValue: string,
    NetworkId: number,
  |},
|}): ErgoUnsignedTxUtxoResponse {
  if (request.utxos.length === 0) {
    // Ergo requires at least 1 input per transaction
    throw new NotEnoughMoneyToSendError();
  }

  const wasmInputs = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(
    request.utxos.map(toErgoBoxJSON)
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
  const changeWasm = (() => {
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
    changeWasm
  );

  const txBuilder = RustModule.SigmaRust.TxBuilder.new(
    allUtxoSelection,
    // no output since it gets considered as change at the tx builder level
    RustModule.SigmaRust.ErgoBoxCandidates.empty(),
    request.currentHeight,
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.txFee.toString())
    ),
    RustModule.SigmaRust.Address.from_bytes(
      Buffer.from(request.receiver.address, 'hex')
    ),
    RustModule.SigmaRust.BoxValue.from_i64(
      RustModule.SigmaRust.I64.from_str(request.protocolParams.MinimumBoxValue.toString())
    ),
  );

  const changeAddr = (() => {
    if (request.receiver.addressing == null) return [];
    const { addressing } = request.receiver;
    return changeToModel(
      changeWasm, addressing,
      request.receiver.address,
      request.protocolParams.NetworkId
    );
  })();

  return {
    senderUtxos: request.utxos,
    unsignedTx: txBuilder,
    changeAddr,
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
    NetworkId: number,
    DefaultIdentifier: string,
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
    NetworkId: number,
    DefaultIdentifier: string,
  |},
|}): ErgoUnsignedTxUtxoResponse {
  if (request.utxos.length === 0) {
    // Ergo requires at least 1 input per transaction
    throw new NotEnoughMoneyToSendError();
  }

  const boxCandidates = (() => {
    let candidates = null;
    for (const output of request.outputs) {
      const wasmOutput = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(
        RustModule.SigmaRust.BoxValue.from_i64(
          RustModule.SigmaRust.I64.from_str(output.amount.getDefaultEntry().amount.toString())
        ),
        RustModule.SigmaRust.Contract.pay_to_address(
          RustModule.SigmaRust.Address.from_bytes(
            Buffer.from(output.address, 'hex')
          )
        ),
        request.currentHeight
      );
      for (const token of output.amount.nonDefaultEntries()) {
        wasmOutput.add_token(
          RustModule.SigmaRust.TokenId.from_str(token.identifier),
          RustModule.SigmaRust.TokenAmount.from_i64(
            RustModule.SigmaRust.I64.from_str(token.amount.toString())
          )
        );
      }

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

  const wasmInputs = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(
    request.utxos.map(toErgoBoxJSON)
  );

  const selectedInputs = (() => {
    const boxSelectors = new RustModule.SigmaRust.SimpleBoxSelector();
    try {
      const outputs = request.outputs.reduce(
        (sum, next) => sum.joinAddCopy(next.amount),
        new MultiToken([], {
          defaultIdentifier: request.protocolParams.DefaultIdentifier,
          defaultNetworkId: request.protocolParams.NetworkId,
        }),
      );
      outputs.add({
        amount: request.txFee,
        identifier: request.protocolParams.DefaultIdentifier,
        networkId: request.protocolParams.NetworkId,
      });

      const tokens = new RustModule.SigmaRust.Tokens();
      for (const token of outputs.nonDefaultEntries()) {
        tokens.add(new RustModule.SigmaRust.Token(
          RustModule.SigmaRust.TokenId.from_str(token.identifier),
          RustModule.SigmaRust.TokenAmount.from_i64(
            RustModule.SigmaRust.I64.from_str(token.amount.toString())
          )
        ));
      }
      return boxSelectors.select(
        wasmInputs,
        RustModule.SigmaRust.BoxValue.from_i64(
          RustModule.SigmaRust.I64.from_str(outputs.getDefaultEntry().amount.toString())
        ),
        tokens
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
    const selectedChange = selectedInputs.change();
    return changeToModel(
      selectedChange,
      request.changeAddr.addressing,
      request.changeAddr.address,
      request.protocolParams.NetworkId,
    );
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

  const json = JSONBigInt.parse(signedTx.to_json());
  return {
    inputs: json.inputs,
    dataInputs: json.dataInputs,
    outputs: json.outputs.map(output => ({
      value: output.value.toString(),
      ergoTree: output.ergoTree,
      creationHeight: output.creationHeight,
      assets: output.assets?.map(asset => ({
        tokenId: asset.tokenId, // hex
        amount: asset.amount.toString(),
      })),
      additionalRegisters: output.additionalRegisters,
    }))
  };
}

export function generateKey(request: {|
  +addressing: { ...Addressing, ... },
  +keyLevel: number,
  +signingKey: BIP32PrivateKey
|}): RustModule.SigmaRust.SecretKey {
  const { addressing: { addressing }, keyLevel, signingKey } = request;
  const lastLevelSpecified = addressing.startLevel + addressing.path.length - 1;
  if (lastLevelSpecified !== Bip44DerivationLevels.ADDRESS.level) {
    throw new Error(`${nameof(generateKeys)} incorrect addressing size`);
  }
  const key = deriveByAddressing({
    addressing,
    startingFrom: {
      level: keyLevel,
      key: signingKey,
    }
  });
  const privateKey = key.key.privateKey;
  if (privateKey == null) {
    throw new Error(`${nameof(generateKeys)} private key not found (should never happen)`);
  }
  return RustModule.SigmaRust.SecretKey.dlog_from_bytes(
    privateKey
  );
}

export function generateKeys(request: {|
  senderUtxos: $ReadOnlyArray<ErgoAddressedUtxo>,
  keyLevel: number,
  signingKey: BIP32PrivateKey
|}): RustModule.SigmaRust.SecretKeys {
  const { keyLevel, signingKey } = request;
  const secretKeys = new RustModule.SigmaRust.SecretKeys();
  for (const utxo of request.senderUtxos) {
    // recall: duplicates are fine
    secretKeys.add(generateKey({ addressing: utxo, keyLevel, signingKey }));
  }
  return secretKeys;
}

function extractWalletPkFromHexConstant(hexConstant: string): ?string {
  const matched = SIGMA_CONSTANT_ADDRESS_PK_MATCHER_REG.exec(hexConstant);
  return matched ? matched[1] : null;
}

export function extractP2sKeysFromErgoBox(box: ErgoBoxJson): Set<string> {
  const res = new Set();
  if (box.ergoTree != null && box.ergoTree.length > 0) {
    const tree = RustModule.SigmaRust.ErgoTree.from_base16_bytes(box.ergoTree);
    const constantsLen = tree.constants_len();
    for (let i = 0; i < constantsLen; i++) {
      const hex = tree.get_constant(i).encode_to_base16();
      const walletPk: ?string = extractWalletPkFromHexConstant(hex);
      if (walletPk != null) {
        res.add(walletPk);
      }
    }
  }
  if (box.additionalRegisters != null) {
    for (const registerHex of Object.values(box.additionalRegisters)) {
      const walletPk: ?string = extractWalletPkFromHexConstant(String(registerHex));
      if (walletPk != null) {
        res.add(walletPk);
      }
    }
  }
  return res;
}
