// @flow
import BigNumber from 'bignumber.js';
import _ from 'lodash';

import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  saveAdaAddress,
  removeAdaAddress,
  getAdaAddressesList
} from '../adaAddress';
import type {
  AdaAddress,
  UTXO
} from '../adaTypes';
import {
  sendTx,
  getTxsBodiesForUTXOs
} from '../lib/yoroi-backend-api';
import {
  getAdaTransactionInputsAndUtxos,
  getAdaTransactionChangeAddr,
} from '../adaTransactions/adaNewTransactions';
import {
  SendTransactionError,
  InvalidWitnessError,
  GetTxsBodiesForUTXOsError
} from '../errors';
import type { CreateTrezorSignTxDataResponse } from '../index.js';
import type {
  TrezorInput,
  TrezorOutput, TrezorSignTxPayload
} from '../../../domain/TrezorSignTx';

import type { ConfigType } from '../../../../config/config-types';
import Config from '../../../config';
import type {TxInput, UnsignedTransactionExt} from "../../../../flow/declarations/CardanoCrypto";

declare var CONFIG: ConfigType;

// TODO: add trezor payload format. Maybe as a README in the same folder?
/** Generate a payload for Trezor */
export async function createTrezorSignTxData(
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
    Logger.error('trezorNewTransactions::getTxsBodiesForUTXOs error: ' +
      stringifyError(getTxBodiesError));
    throw new GetTxsBodiesForUTXOsError();
  }
}

/** Send a transaction and save the new change address */
export async function newTrezorTransaction(
  signedTxHex: string,
  changeAdaAddr: AdaAddress,
): Promise<Array<void>> {
  const signedTx: string = Buffer.from(signedTxHex, 'hex').toString('base64');

  // TODO: delete this. Only for debugging
  console.log('newTrezorTransaction::SignedTx: ', signedTx);

  // We assume a change address is used. Currently, there is no way to perfectly match the tx.
  // tentatively assume that the transaction will succeed,
  // so we save the change address to the wallet
  await saveAdaAddress(changeAdaAddr, 'Internal');

  try {
    const body = { signedTx };
    const backendResponse = await sendTx(body);
    return backendResponse;
  } catch (sendTxError) {
    // On failure, we have to remove the change address we eagerly added
    // Note: we don't await on this
    removeAdaAddress(changeAdaAddr);
    Logger.error('trezorNewTransactions::newAdaTransaction error: ' +
      stringifyError(sendTxError));
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
    address: x.address,
    amount: x.value
  }))
}

function _calculateChange(utxos: Array<UTXO>, fee: number, outputAmount: BigNumber): BigNumber {
  const totalInput: BigNumber = utxos.reduce((acc, current) => (
    new BigNumber(current.amount).plus(acc)
  ), new BigNumber(0));

  const change = totalInput.minus(outputAmount).minus(new BigNumber(fee));
  return change;
}
