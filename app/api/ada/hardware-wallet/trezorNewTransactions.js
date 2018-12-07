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
  TrezorOutput
} from '../../../domain/TrezorSignTx';

import type { ConfigType } from '../../../../config/config-types';
import Config from '../../../config';

declare var CONFIG: ConfigType;

// TODO: add trezor payload format. Maybe as a README in the same folder?
/** Generate a payload for Trezor */
export async function createTrezorSignTxData(
  receiver: string,
  amount: BigNumber,
  fee: number,
): Promise<CreateTrezorSignTxDataResponse> {
  // Inputs
  const senders = await getAdaAddressesList();
  const [inputs, utxos] = await getAdaTransactionInputsAndUtxos(senders);
  const trezorInputs = _transformToTrezorInputs(inputs, utxos);

  // Outputs
  const changedAddress = await getAdaTransactionChangeAddr();
  const changedAmount = _calculateChange(utxos, fee, amount);
  const trezorOutputs = _generateTrezorOutputs(receiver, amount, changedAddress, changedAmount);

  // Transactions
  const txsBodies = await txsBodiesForUTXOs(utxos);

  // Network
  const network = CONFIG.network.trezorNetwork;

  return {
    trezorSignTxPayload: {
      network,
      transactions: txsBodies,
      inputs: trezorInputs,
      outputs: trezorOutputs,
    },
    changedAddress: changedAddress,
  };
}

/** List of Body hashes for a list of utxos by batching backend requests */
export async function txsBodiesForUTXOs(
  utxos: Array<UTXO>
): Promise<Array<string>> {
  if (utxos == null) return [];
  try {
    const txsHashes = utxos.map((utxo) => utxo.tx_hash);

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

function _transformToTrezorInputs(inputs: Array<TxInput>, utxos: Array<UTXO>): Array<TrezorInput> {
  return _
    .zip(inputs, utxos)
    .map(([input, utxo]) => ({
      path: _derivePath(input.addressing.change, input.addressing.index),
      prev_hash: utxo.tx_hash,
      prev_index: utxo.tx_index,
      type: 0
    }));
}

function _generateTrezorOutputs(
  outputAddress: string,
  outputAmount: BigNumber,
  changeAdaAddr: AdaAddress,
  changeAmount: BigNumber,
): Array<TrezorOutput> {
  return [
    {
      address: outputAddress,
      amount: outputAmount.toString()
    }, {
      // TODO: Smaller tx (fee wise) with `path: "m/44'/1815'/0'/X/X"`
      address: changeAdaAddr.cadId,
      amount: changeAmount.toString()
    }
  ];
}

function _calculateChange(utxos: Array<UTXO>, fee: number, outputAmount: BigNumber): BigNumber {
  const totalInput: BigNumber = utxos.reduce((acc, current) => (
    new BigNumber(current.amount).plus(acc)
  ), new BigNumber(0));

  const change = totalInput.minus(outputAmount).minus(new BigNumber(fee));
  return change;
}
