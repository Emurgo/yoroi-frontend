// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse
} from './types';

import type { IFetcher } from './IFetcher';

import axios from 'axios';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';
import {
  GetTxsBodiesForUTXOsApiError,
  GetUtxosForAddressesApiError,
  GetUtxosSumsForAddressesApiError,
  GetTxHistoryForAddressesApiError,
  SendTransactionApiError,
  CheckAdressesInUseApiError,
  InvalidWitnessError,
} from '../../errors';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
 */
export class RemoteFetcher implements IFetcher {
  getUTXOsForAddresses = (body: AddressUtxoRequest): Promise<AddressUtxoResponse> => (
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
        Logger.error('RemoteFetcher::getUTXOsForAddresses error: ' + stringifyError(error));
        throw new GetUtxosForAddressesApiError();
      })
  )

  getTxsBodiesForUTXOs = (body: TxBodiesRequest): Promise<TxBodiesResponse> => (
    axios(
      `${backendUrl}/api/txs/txBodies`,
      {
        method: 'post',
        data: {
          txsHashes: body.txsHashes
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error('RemoteFetcher::getTxsBodiesForUTXOs error: ' + stringifyError(error));
        throw new GetTxsBodiesForUTXOsApiError();
      })
  )

  getUTXOsSumsForAddresses = (body: UtxoSumRequest): Promise<UtxoSumResponse> => (
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
        Logger.error('RemoteFetcher::getUTXOsSumsForAddresses error: ' + stringifyError(error));
        throw new GetUtxosSumsForAddressesApiError();
      })
  )

  getTransactionsHistoryForAddresses = (body: HistoryRequest): Promise<HistoryResponse> => (
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
        Logger.error('RemoteFetcher::getTransactionsHistoryForAddresses error: ' + stringifyError(error));
        throw new GetTxHistoryForAddressesApiError();
      })
  )

  sendTx = (body: SignedRequest): Promise<SignedResponse> => {
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
        Logger.error('RemoteFetcher::sendTx error: ' + stringifyError(error));
        if (error.request.response.includes('Invalid witness')) {
          throw new InvalidWitnessError();
        }
        throw new SendTransactionApiError();
      });
  }

  checkAddressesInUse = (body: FilterUsedRequest): Promise<FilterUsedResponse> => (
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
        Logger.error('RemoteFetcher::checkAddressesInUse error: ' + stringifyError(error));
        throw new CheckAdressesInUseApiError();
      })
  )
}
