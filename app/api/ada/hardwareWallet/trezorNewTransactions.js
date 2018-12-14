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
import type { SendTrezorSignedTxResponse } from '../../common';
import type {
  TrezorInput,
  TrezorOutput,
  TrezorSignTxPayload
} from '../../../domain/TrezorSignTx';

import type { ConfigType } from '../../../../config/config-types';
import Config from '../../../config';

declare var CONFIG: ConfigType;

// TODO: [TREZOR] add trezor payload format. Maybe as a README in the same folder?

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
    Logger.error('trezorNewTransactions::txsBodiesForInputs error: ' +
      stringifyError(getTxBodiesError));
    throw new GetTxsBodiesForUTXOsError();
  }
}

/** Send a transaction and save the new change address */
export async function newTrezorTransaction(
  signedTxHex: string,
  changeAdaAddr: AdaAddress,
): Promise<SendTrezorSignedTxResponse> {
  Logger.debug('trezorNewTransactions::newTrezorTransaction error: called');
  const signedTx: string = Buffer.from(signedTxHex, 'hex').toString('base64');

  // We assume a change address is used. Currently, there is no way to perfectly match the tx.
  // tentatively assume that the transaction will succeed,
  // so we save the change address to the wallet
  await saveAdaAddress(changeAdaAddr, 'Internal');

  try {
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    Logger.debug('trezorNewTransactions::newTrezorTransaction error: success');

    return backendResponse;
  } catch (sendTxError) {
    Logger.error('trezorNewTransactions::newTrezorTransaction error: ' + stringifyError(sendTxError));
    // On failure, we have to remove the change address we eagerly added
    // Note: we don't await on this
    removeAdaAddress(changeAdaAddr);
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

function _derivePath(change: number, index: number): string {
  // Assumes this is only for Cardano and Web Yoroi (only one account).
  return `${Config.trezor.DEFAULT_CARDANO_PATH}/${change}/${index}`;
}

function _transformToTrezorInputs(inputs: Array<TxInput>): Array<TrezorInput> {
  return inputs.map((input: TxInput) => ({
    path: _derivePath(input.addressing.change, input.addressing.index),
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

function _outputAddressOrPath(out: TxOutput) {
  if (out.isChange) {
    const fullAddress: ?AdaAddress = out.fullAddress;
    if (fullAddress) {
      return { path: _derivePath(fullAddress.change, fullAddress.index) };
    }
    Logger.debug('trezorNewTransactions::_outputAddressOrPath: ' +
      `[WEIRD] Trezor got a change output without a full 'Ada Address': ${stringifyData(out)}`);
  }
  return { address: out.address };
}
