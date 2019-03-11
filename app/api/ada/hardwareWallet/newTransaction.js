// @flow
import _ from 'lodash';

import {
  Logger,
  stringifyError,
  stringifyData
} from '../../../utils/logging';
import {
  saveAdaAddress,
  removeAdaAddress,
} from '../adaAddress';
import type {
  AdaAddress,
} from '../adaTypes';
import {
  sendTx,
  getTxsBodiesForUTXOs
} from '../lib/yoroi-backend-api';
import {
  SendTransactionError,
  InvalidWitnessError,
  GetTxsBodiesForUTXOsError
} from '../errors';
import type {
  BroadcastTrezorSignedTxResponse,
  PrepareAndBroadcastLedgerSignedTxResponse
} from '../../common';
import type {
  TrezorInput,
  TrezorOutput,
  TrezorSignTxPayload,
  LedgerSignTxPayload,
  LedgerUnsignedOutput,
  LedgerUnsignedUtxo,
} from '../../../domain/HWSignTx';
import type {
  BIP32Path,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
  SignTransactionResponse as LedgerSignTxResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano';
import { makeCardanoBIP44Path } from 'yoroi-extension-ledger-bridge';
import bs58 from 'bs58';

import type { ConfigType } from '../../../../config/config-types';
import Config from '../../../config';

// Probably this needs to be moved somewhere else
import { getSingleCryptoAccount } from '../adaLocalStorage';
import cbor from 'cbor';
import { HdWallet } from 'rust-cardano-crypto';
import { CborIndefiniteLengthArray } from '../lib/utils';
import { blake2b } from 'cardano-crypto.js';

declare var CONFIG: ConfigType;

export type UnsignedLedgerTx = {inputs: Array<any>, outputs: Array<any>, attributes: {}};

// ==================== TREZOR ==================== //
/** Generate a payload for Trezor SignTx */
export async function createTrezorSignTxPayload(
  txExt: UnsignedTransactionExt
): Promise<TrezorSignTxPayload> {

  // Inputs
  const trezorInputs = _transformToTrezorInputs(txExt.inputs);

  // Outputs
  const trezorOutputs = _generateTrezorOutputs(txExt.outputs);

  // Transactions
  const txsBodiesMap = await txsBodiesForInputs(txExt.inputs);
  const txsBodies = txExt.inputs.map((x: TxInput) => txsBodiesMap[x.ptr.id]);

  return {
    inputs: trezorInputs,
    outputs: trezorOutputs,
    transactions: txsBodies,
    protocol_magic: CONFIG.network.protocolMagic,
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
export async function txsBodiesForInputs(
  inputs: Array<TxInput>
): Promise<{[key: string]:string}> {
  if (!inputs) return [];
  try {

    // Map inputs to UNIQUE tx hashes (there might be multiple inputs from the same tx)
    const txsHashes = [...new Set(inputs.map(x => x.ptr.id))];

    // split up all addresses into chunks of equal size
    const groupsOfTxsHashes = _.chunk(txsHashes, CONFIG.app.txsBodiesRequestSize);

    // convert chunks into list of Promises that call the backend-service
    const promises = groupsOfTxsHashes
      .map(groupOfTxsHashes => getTxsBodiesForUTXOs(groupOfTxsHashes));

    // Sum up all the utxo
    return Promise.all(promises)
      .then(groupsOfTxBodies => {
        const bodies = groupsOfTxBodies
          .reduce((acc, groupOfTxBodies) => Object.assign(acc, groupOfTxBodies), {});
        if (txsHashes.length !== Object.keys(bodies).length) {
          throw new GetTxsBodiesForUTXOsError();
        }
        return bodies;
      });
  } catch (getTxBodiesError) {
    Logger.error('newTransaction::txsBodiesForInputs error: ' +
      stringifyError(getTxBodiesError));
    throw new GetTxsBodiesForUTXOsError();
  }
}

/** Send a transaction and save the new change address */
export async function broadcastTrezorSignedTx(
  signedTxHex: string,
  changeAdaAddr: AdaAddress,
): Promise<BroadcastTrezorSignedTxResponse> {
  Logger.debug('newTransaction::broadcastTrezorSignedTx: called');
  const signedTx: string = Buffer.from(signedTxHex, 'hex').toString('base64');

  // We assume a change address is used. Currently, there is no way to perfectly match the tx.
  // tentatively assume that the transaction will succeed,
  // so we save the change address to the wallet
  await saveAdaAddress(changeAdaAddr, 'Internal');

  try {
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    Logger.debug('newTransaction::broadcastTrezorSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('newTransaction::broadcastTrezorSignedTx error: ' + stringifyError(sendTxError));
    // On failure, we have to remove the change address we eagerly added
    // Note: we don't await on this
    removeAdaAddress(changeAdaAddr);
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

function _derivePathAsString(chain: number, addressIndex: number): string {
  // Assumes this is only for Cardano and Web Yoroi (only one account).
  return `${Config.wallets.BIP44_CARDANO_FIRST_ACCOUNT_SUB_PATH}/${chain}/${addressIndex}`;
}

function _transformToTrezorInputs(inputs: Array<TxInput>): Array<TrezorInput> {
  return inputs.map((input: TxInput) => ({
    path: _derivePathAsString(input.addressing.change, input.addressing.index),
    prev_hash: input.ptr.id,
    prev_index: input.ptr.index,
    type: 0
  }));
}

function _generateTrezorOutputs(outputs: Array<TxOutput>): Array<TrezorOutput> {
  return outputs.map(x => ({
    amount: x.value.toString(),
    ..._outputAddressOrPath(x)
  }));
}

function _outputAddressOrPath(
  txOutput: TxOutput
): { path: string } | { address: string } {
  if (txOutput.isChange) {
    const fullAddress: ?AdaAddress = txOutput.fullAddress;
    if (fullAddress) {
      return { path: _derivePathAsString(fullAddress.change, fullAddress.index) };
    }
    Logger.debug(`newTransaction::_outputAddressOrPath:[WEIRD] Trezor got a change output without a full 'Ada Address': ${stringifyData(txOutput)}`);
  }

  return { address: txOutput.address };
}

// ==================== LEDGER ==================== //
/** Generate a payload for Ledger SignTx */
export async function createLedgerSignTxPayload(
  txExt: UnsignedTransactionExt
): Promise<LedgerSignTxPayload> {

  // Transactions Hash
  const txDataHexMap = await txsBodiesForInputs(txExt.inputs);

  // Inputs
  const ledgerInputs: Array<InputTypeUTxO> =
    _transformToLedgerInputs(txExt.inputs, txDataHexMap);

  // Outputs
  const ledgerOutputs: Array<OutputTypeAddress | OutputTypeChange> =
    _transformToLedgerOutputs(txExt.outputs);

  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
  };
}

function _derivePathAsBIP32Path(
  chain: number,
  addressIndex: number
): BIP32Path {
  // Assumes this is only for Cardano and Web Yoroi (only one account).
  return makeCardanoBIP44Path(0, chain, addressIndex);
}

function _transformToLedgerInputs(
  inputs: Array<TxInput>,
  txDataHexMap: {[key: string]:string}
): Array<InputTypeUTxO> {
  return inputs.map((input: TxInput) => ({
    txDataHex: txDataHexMap[input.ptr.id],
    outputIndex: input.ptr.index,
    path: _derivePathAsBIP32Path(input.addressing.change, input.addressing.index),
  }));
}

function _transformToLedgerOutputs(
  txOutputs: Array<TxOutput>
): Array<OutputTypeAddress | OutputTypeChange> {
  return txOutputs.map(txOutput => ({
    amountStr: txOutput.value.toString(),
    ..._ledgerOutputAddress58OrPath(txOutput)
  }));
}

function _ledgerOutputAddress58OrPath(
  txOutput: TxOutput
): { address58: string } | { path: BIP32Path }  {
  if (txOutput.isChange) {
    const fullAddress: ?AdaAddress = txOutput.fullAddress;
    if (fullAddress) {
      return { path: _derivePathAsBIP32Path(fullAddress.change, fullAddress.index) };
    }
    Logger.debug(`newTransaction::_ledgerOutputAddressOrPath:[WEIRD] Ledger got a change output without a full 'Ada Address': ${stringifyData(txOutput)}`);
  }

  return { address58: txOutput.address };
}

/** Send a transaction and save the new change address */
export async function prepareAndBroadcastLedgerSignedTx(
  ledgerSignTxResp: LedgerSignTxResponse,
  changeAdaAddr: AdaAddress,
  unsignedTx: any,
  txExt: UnsignedTransactionExt
): Promise<PrepareAndBroadcastLedgerSignedTxResponse> {
  try {
    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: called');

    // Since Ledger only provide witness signature
    // need to make full broadcastable signed Tx
    Logger.debug(`newTransaction::prepareAndBroadcastLedgerSignedTx unsignedTx: ${stringifyData(unsignedTx)}`);
    const signedTxHex: string = await prepareLedgerSignedTxBody(
      ledgerSignTxResp,
      unsignedTx,
      txExt
    );

    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: called');
    const signedTx: string = Buffer.from(signedTxHex, 'hex').toString('base64');

    // We assume a change address is used. Currently, there is no way to perfectly match the tx.
    // tentatively assume that the transaction will succeed,
    // so we save the change address to the wallet
    await saveAdaAddress(changeAdaAddr, 'Internal');
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    Logger.debug('newTransaction::prepareAndBroadcastLedgerSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('newTransaction::prepareAndBroadcastLedgerSignedTx error: ' + stringifyError(sendTxError));

    // On failure, we have to remove the change address we eagerly added
    // Note: we don't await on this
    removeAdaAddress(changeAdaAddr);
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    } else {
      throw new SendTransactionError();
    }
  }
}

function prepareLedgerSignedTxBody(
  ledgerSignTxResp: LedgerSignTxResponse,
  unsignedTx: any,
  txExt: UnsignedTransactionExt
): string {
  // TODO: add type to unsignedTx

  const txAux = TxAux(
    txExt.inputs
      .map(input => {
        const transformedInput = InputToLedgerUnsignedFormat(input);
        Logger.debug(`newTransaction::transformedInput: ${stringifyData(transformedInput)}`);
        return TxInputFromUtxo(transformedInput);
      }),
    txExt.outputs
      .map(output => {
        const transformedOutput = OutputToLedgerUnsignedFormat(output);
        Logger.debug(`newTransaction::transformedOutput: ${stringifyData(transformedOutput)}`);
        return LedgerTxOutput(transformedOutput);
      }),
    {} // attributes
  );

  const txWitnesses = ledgerSignTxResp.witnesses.map((witness) => prepareWitness(witness));
  Logger.debug(`newTransaction::prepareLedgerSignedTxBody txWitnesses: ${stringifyData(txWitnesses)}`);

  const txBody = prepareBody(txAux, txWitnesses);
  Logger.debug(`newTransaction::prepareLedgerSignedTxBody txBody: ${stringifyData(txBody)}`);

  return txBody;
}

function InputToLedgerUnsignedFormat(txInput: TxInput): LedgerUnsignedUtxo {
  return {
    txHash: txInput.ptr.id,
    address: txInput.value.address,
    coins: Number(txInput.value.value),
    outputIndex: txInput.ptr.index
  };
}

function OutputToLedgerUnsignedFormat(output: TxOutput): LedgerUnsignedOutput {
  // TODO: when does this actually happen
  const isChange = !!output.isChange;
  return {
    address: output.address,
    coins: Number(output.value),
    isChange
  };
}
/* Stuff from VacuumLabs */

function TxInputFromUtxo(utxo: LedgerUnsignedUtxo) {
  // default input type
  const type = 0;
  const coins = utxo.coins;
  const txHash = utxo.txHash;
  const outputIndex = utxo.outputIndex;

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      type,
      new cbor.Tagged(24, cbor.encode([Buffer.from(txHash, 'hex'), outputIndex])),
    ]);
  }

  return {
    coins,
    txHash,
    outputIndex,
    utxo,
    encodeCBOR,
  };
}

function AddressCborWrapper(address: string) {
  function encodeCBOR(encoder) {
    return encoder.push(bs58.decode(address));
  }

  return {
    address,
    encodeCBOR,
  };
}
function LedgerTxOutput(output: LedgerUnsignedOutput) {
  function encodeCBOR(encoder) {
    return encoder.pushAny([AddressCborWrapper(output.address), output.coins]);
  }

  return {
    address: output.address,
    coins: output.coins,
    isChange: output.isChange,
    encodeCBOR,
  };
}

function prepareWitness(witness) {
  const cryptoAccount = getSingleCryptoAccount();
  const masterXPubAccount0 = cryptoAccount.root_cached_key;

  const deriveXpub = function XPubFactory(absDerivationPath: Array<number>) {
    const masterXPubAccount0Buffer = Buffer.from(masterXPubAccount0, 'hex');
    const changeXpub = HdWallet.derivePublic(masterXPubAccount0Buffer, [absDerivationPath[3]]);
    const addressXpub = HdWallet.derivePublic(changeXpub, [absDerivationPath[4]]);
    return addressXpub;
  };

  const extendedPublicKey = deriveXpub(witness.path);
  Logger.debug(`newTransaction::prepareWitness extendedPublicKey: ${stringifyData(extendedPublicKey)}`);
  return TxWitness(extendedPublicKey, Buffer.from(witness.witnessSignatureHex, 'hex'));
}

function TxWitness(extendedPublicKey, signature) {
  // default - PkWitness
  const type = 0;

  function encodeCBOR(encoder) {
    return encoder.pushAny(
      [type, new cbor.Tagged(24, cbor.encode([extendedPublicKey, signature]))]
    );
  }

  return {
    extendedPublicKey,
    signature,
    encodeCBOR,
  };
}

function prepareBody(txAux, txWitnesses) {
  return cbor.encode(SignedTransactionStructured(txAux, txWitnesses)).toString('hex');
}

function TxAux(inputs: Array<any>, outputs: Array<any>, attributes: any) {
  function getId() {
    return blake2b(cbor.encode(TxAux(inputs, outputs, attributes)), 32).toString('hex');
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([
      new CborIndefiniteLengthArray(inputs),
      new CborIndefiniteLengthArray(outputs),
      attributes,
    ]);
  }

  return {
    getId,
    inputs,
    outputs,
    attributes,
    encodeCBOR,
  };
}

function SignedTransactionStructured(txAux, witnesses) {
  function getId() {
    return txAux.getId();
  }

  function encodeCBOR(encoder) {
    return encoder.pushAny([txAux, witnesses]);
  }

  return {
    getId,
    witnesses,
    txAux,
    encodeCBOR,
  };
}
