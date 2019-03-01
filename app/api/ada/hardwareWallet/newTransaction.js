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
  BroadcastLedgerSignedTxResponse
} from '../../common';
import type {
  TrezorInput,
  TrezorOutput,
  TrezorSignTxPayload,
  LedgerSignTxPayload,
} from '../../../domain/HWSignTx';
// TODO [LEDGER] replace types of yoroi-extension-ledger-bridge with npm package
import type {
  BIP32Path,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
  SignTransactionResponse as LedgerSignTxResponse,
  Witness
} from 'yoroi-extension-ledger-bridge';
import { makeCardanoBIP44Path } from 'yoroi-extension-ledger-bridge';

import type { ConfigType } from '../../../../config/config-types';
import Config from '../../../config';

declare var CONFIG: ConfigType;

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
  const txsBodies = await txsBodiesForInputs(txExt.inputs);

  // Network
  const network = CONFIG.network.trezorNetwork;

  return {
    // TODO [TREZOR] change (network -> protocol_magic)
    network,
    transactions: txsBodies,
    inputs: trezorInputs,
    outputs: trezorOutputs,
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
export async function txsBodiesForInputs(
  inputs: Array<TxInput>
): Promise<Array<string>> {
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
      .then(groupsOfTxBodies => (
        groupsOfTxBodies.reduce((acc, groupOfTxBodies) => acc.concat(groupOfTxBodies), [])
      ));
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
  const txDataHexList = await txsBodiesForInputs(txExt.inputs);

  // Inputs
  const ledgerInputs: Array<InputTypeUTxO> =
    _transformToLedgerInputs(txExt.inputs, txDataHexList);

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
  txDataHexList: Array<string>
): Array<InputTypeUTxO> {
  return inputs.map((input: TxInput, idx: number) => ({
    txDataHex: txDataHexList[idx],
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
export async function broadcastLedgerSignedTx(
  ledgerSignTxResp: LedgerSignTxResponse,
  changeAdaAddr: AdaAddress,
): Promise<BroadcastLedgerSignedTxResponse> {
  try {
    Logger.debug('newTransaction::broadcastLedgerSignedTx: called');

    // Since Ledger only provide witness signature
    // need to make full broadcastable signed Tx
    const signedTx: string = prepareLedgerSignedTxBody(ledgerSignTxResp, changeAdaAddr);

    // We assume a change address is used. Currently, there is no way to perfectly match the tx.
    // tentatively assume that the transaction will succeed,
    // so we save the change address to the wallet
    await saveAdaAddress(changeAdaAddr, 'Internal');
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    Logger.debug('newTransaction::broadcastLedgerSignedTx: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('newTransaction::broadcastLedgerSignedTx error: ' + stringifyError(sendTxError));

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
  changeAdaAddr: AdaAddress,
): string {

  // serialize signed transaction for submission
  const txWitnesses = ledgerSignTxResp.witnesses.map((witness) => prepareWitness(witness));

  // prepareBody
  // return cbor.encode(SignedTransactionStructured(unsignedTx, txWitnesses)).toString('hex')
  // https://github.com/vacuumlabs/adalite/blob/f14899d7a7bab2b6d55f607b94529cc65587e9ed/app/frontend/wallet/cardano-ledger-crypto-provider.js#L77

  return '';
}

function prepareWitness(witness: Witness): any {
  // get extended public key

  // make TxWitness(extendedPublicKey, Buffer.from(witness.witnessSignatureHex, 'hex'))
  // https://github.com/vacuumlabs/adalite/blob/f14899d7a7bab2b6d55f607b94529cc65587e9ed/app/frontend/wallet/cardano-ledger-crypto-provider.js#L73
}
