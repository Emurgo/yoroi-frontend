// @flow

// This file makes the actual HTTP requests to the yoroi-backend-service
// https://github.com/Emurgo/yoroi-backend-service/

import axios from 'axios';
import type { ConfigType } from '../../../../config/config-types';
import {
  Logger,
  stringifyError
} from '../../../utils/logging';
import {
  GetUtxosForAddressesApiError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
  SendTransactionApiError,
  CheckAdressesInUseApiError,
  InvalidWitnessError
} from '../errors';
import type {
  UTXO,
  Transaction
} from '../adaTypes';

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;

export type txsUtxoForAddressesInput = {
  addresses: Array<string>
};
export type txsUtxoForAddressesOutput = Array<UTXO>;

export const getUTXOsForAddresses = (
  body: txsUtxoForAddressesInput
): Promise<txsUtxoForAddressesOutput> => (
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

export type txsUtxoSumForAddressessInput = { addresses: Array<string> };
export type txsUtxoSumForAddressesOutput = {
  sum: ?string
};
export const getUTXOsSumsForAddresses = (
  body: txsUtxoSumForAddressessInput
): Promise<txsUtxoSumForAddressesOutput> => (
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

export type txsHistoryInput = {
  addresses: Array<string>,
  dateFrom: Date
};
export type txsHistoryOutput = Array<Transaction>;

export const getTransactionsHistoryForAddresses = (
  body: txsHistoryInput
): Promise<txsHistoryOutput> => (
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

export type txsSignedInput = {
  signedTx: string
};
export type txsSignedOutput = Array<void>;

export const sendTx = (
  body: txsSignedInput
): Promise<txsSignedOutput> => (
  axios(
    `${backendUrl}/api/txs/signed`,
    {
      method: 'post',
      data: {
        signedTx: body.signedTx
      }
    }
  ).then(response => response.data)
    .catch((error) => {
      Logger.error('yoroi-backend-api::sendTx error: ' + stringifyError(error));
      if (error.request.response.includes('Invalid witness')) {
        throw new InvalidWitnessError();
      }
      throw new SendTransactionApiError();
    })
);

export type addressesFilterUsedInput = {
  addresses: Array<string>
};
export type addressesFilterUsedOutput = Array<string>;

export const checkAddressesInUse = (
  body: addressesFilterUsedInput
): Promise<addressesFilterUsedOutput> => (
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
