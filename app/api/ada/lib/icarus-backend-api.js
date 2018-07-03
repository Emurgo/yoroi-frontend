// @flow
import axios from 'axios';
import type Moment from 'moment';
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
  GetPendingTxsForAddressesApiError
} from '../errors';

export const transactionsLimit = 20;
export const addressesLimit = 50;

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;

// TODO: Refactor service call in order to re-use common parameters
// TODO: Map errors in a more specific way

export const getUTXOsForAddresses = (addresses: Array<string>) =>
  axios(`${backendUrl}/api/txs/utxoForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::getUTXOsForAddresses error: ' + stringifyError(error));
    throw new GetUtxosForAddressesApiError();
  });

export const getUTXOsSumsForAddresses = (addresses: Array<string>) =>
  axios(`${backendUrl}/api/txs/utxoSumForAddresses`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::getUTXOsSumsForAddresses error: ' + stringifyError(error));
    throw new GetUtxosSumsForAddressesApiError();
  });

export const getTransactionsHistoryForAddresses = (addresses: Array<string>,
  dateFrom: Moment, txHash: string) =>
  axios(`${backendUrl}/api/txs/history`,
    {
      method: 'post',
      data: {
        addresses,
        dateFrom,
        txHash
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::getTransactionsHistoryForAddresses error: ' + stringifyError(error));
    throw new GetTxHistoryForAddressesApiError();
  });

export const sendTx = (signedTx: string) =>
  axios(`${backendUrl}/api/txs/signed`,
    {
      method: 'post',
      data: {
        signedTx
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::sendTx error: ' + stringifyError(error));
    throw new SendTransactionApiError();
  });

export const checkAddressesInUse = (addresses: Array<string>) =>
  axios(`${backendUrl}/api/addresses/filterUsed`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::checkAddressesInUse error: ' + stringifyError(error));
    throw new CheckAdressesInUseApiError();
  });

export const getPendingTxsForAddresses = (addresses: Array<string>) =>
  axios(`${backendUrl}/api/txs/pending`,
    {
      method: 'post',
      data: {
        addresses
      }
    }
  ).then(response => response.data)
  .catch((error) => {
    Logger.error('icarus-backend-api::getPendingTxsForAddresses error: ' + stringifyError(error));
    throw new GetPendingTxsForAddressesApiError();
  });
