// @flow

// This file makes the actual HTTP requests to the yoroi-backend-service
// https://github.com/Emurgo/yoroi-backend-service/

import axios from 'axios';
import _ from 'lodash';
import type { ConfigType } from '../../../../config/config-types';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  GetAllUTXOsForAddressesError,
  GetTxsBodiesForUTXOsApiError,
  GetUtxosForAddressesApiError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
  SendTransactionApiError,
  SendTransactionError,
  CheckAdressesInUseApiError,
  InvalidWitnessError,
} from '../errors';
import type {
  UTXO,
  Transaction
} from '../adaTypes';

import { RustModule } from './cardanoCrypto/rustLoader';

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;

export type UtxoForAddressesRequest = {
  addresses: Array<string>
};
export type UtxoForAddressesResponse = Array<UTXO>;

export const getUTXOsForAddresses = (
  body: UtxoForAddressesRequest
): Promise<UtxoForAddressesResponse> => (
  axios(
    `${backendUrl}/api/txs/utxoForAddresses`,
    {
      method: 'post',
      data: {
        addresses: body.addresses
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::getUTXOsForAddresses error: ' + stringifyError(error));
      throw new GetUtxosForAddressesApiError();
    })
);

export type UtxoSumForAddressessRequest = { addresses: Array<string> };
export type UtxoSumForAddressesResponse = {
  sum: ?string
};

export const getTxsBodiesForUTXOs = (
  txsHashes: Array<string>
): Promise<{[key: string]:string}> => (
  axios(
    `${backendUrl}/api/txs/txBodies`,
    {
      method: 'post',
      data: {
        txsHashes
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::getTxsBodiesForUTXOs error: ' + stringifyError(error));
      throw new GetTxsBodiesForUTXOsApiError();
    })
);

export const getUTXOsSumsForAddresses = (
  body: UtxoSumForAddressessRequest
): Promise<UtxoSumForAddressesResponse> => (
  axios(
    `${backendUrl}/api/txs/utxoSumForAddresses`,
    {
      method: 'post',
      data: {
        addresses: body.addresses
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::getUTXOsSumsForAddresses error: ' + stringifyError(error));
      throw new GetUtxosSumsForAddressesApiError();
    })
);

/** Sum up the UTXO for a list of addresses by batching backend requests */
export async function getAllUTXOsForAddresses(
  addresses: Array<string>
): Promise<Array<UTXO>> {
  try {
    // split up all addresses into chunks of equal size
    const groupsOfAddresses = _.chunk(addresses, CONFIG.app.addressRequestSize);

    // convert chunks into list of Promises that call the backend-service
    const promises = groupsOfAddresses
      .map(groupOfAddresses => getUTXOsForAddresses(
        { addresses: groupOfAddresses }
      ));

    // Sum up all the utxo
    return Promise.all(promises)
      .then(groupsOfUTXOs => (
        groupsOfUTXOs.reduce((acc, groupOfUTXOs) => acc.concat(groupOfUTXOs), [])
      ));
  } catch (getUtxosError) {
    Logger.error('yoroi-backend-api:::getAllUTXOsForAddresses error: ' +
      stringifyError(getUtxosError));
    throw new GetAllUTXOsForAddressesError();
  }
}

export type HistoryRequest = {
  addresses: Array<string>,
  dateFrom: Date
};
export type HistoryResponse = Array<Transaction>;

export const getTransactionsHistoryForAddresses = (
  body: HistoryRequest
): Promise<HistoryResponse> => (
  axios(
    `${backendUrl}/api/txs/history`,
    {
      method: 'post',
      data: {
        addresses: body.addresses,
        dateFrom: body.dateFrom
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::getTransactionsHistoryForAddresses error: ' + stringifyError(error));
      throw new GetTxHistoryForAddressesApiError();
    })
);

export type SignedRequest = {
  signedTx: RustModule.Wallet.SignedTransaction
};
export type SignedResponse = {
  txId: string
};

export const sendTx = (
  body: SignedRequest
): Promise<SignedResponse> => {
  const signedTxHex = Buffer.from(
    body.signedTx.to_hex(),
    'hex'
  );
  const signedTx64 = Buffer.from(signedTxHex).toString('base64');
  return axios(
    `${backendUrl}/api/txs/signed`,
    {
      method: 'post',
      data: {
        signedTx: signedTx64
      }
    }
  ).then(() => ({
    txId: body.signedTx.id()
  }))
    .catch((error) => {
      Logger.error('yoroi-backend-api::sendTx error: ' + stringifyError(error));
      if (error.request.response.includes('Invalid witness')) {
        throw new InvalidWitnessError();
      }
      throw new SendTransactionApiError();
    });
};

export async function sendFinalizedTx(
  signedTx: RustModule.Wallet.SignedTransaction
): Promise<SignedResponse> {
  try {
    return await sendTx({ signedTx });
  } catch (sendTxError) {
    Logger.error('adaNewTransactions::newAdaTransaction error: ' +
      stringifyError(sendTxError));
    if (sendTxError instanceof InvalidWitnessError) {
      throw new InvalidWitnessError();
    }
    throw new SendTransactionError();
  }
}

export type FilterUsedRequest = {
  addresses: Array<string>
};
export type FilterUsedResponse = Array<string>;

export const checkAddressesInUse = (
  body: FilterUsedRequest
): Promise<FilterUsedResponse> => (
  axios(
    `${backendUrl}/api/addresses/filterUsed`,
    {
      method: 'post',
      data: {
        addresses: body.addresses
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::checkAddressesInUse error: ' + stringifyError(error));
      throw new CheckAdressesInUseApiError();
    })
);
