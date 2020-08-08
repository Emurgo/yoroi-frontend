// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  AccountStateRequest, AccountStateResponse,
  RewardHistoryRequest, RewardHistoryResponse,
  BestBlockRequest, BestBlockResponse,
  SignedRequest, SignedResponse,
  PoolInfoRequest, PoolInfoResponse,
  SignedRequestInternal,
  RemoteTransaction,
} from './types';
import type {
  FilterUsedRequest, FilterUsedResponse,
} from '../../../common/lib/state-fetch/currencySpecificTypes';

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
  GetRewardHistoryApiError,
  GetPoolInfoApiError,
  GetAccountStateApiError,
  GetBestBlockError,
  SendTransactionApiError,
  CheckAddressesInUseApiError,
  InvalidWitnessError,
  RollbackApiError,
} from '../../../common/errors';

import type { ConfigType } from '../../../../../config/config-types';
import { fromWords, decode, } from 'bech32';

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-graphql-migration-backend
 */
export class RemoteFetcher implements IFetcher {

  getLastLaunchVersion: () => string;
  getCurrentLocale: () => string;
  getPlatform: () => string;

  constructor(
    getLastLaunchVersion: () => string,
    getCurrentLocale: () => string,
    getPlatform: () => string,
  ) {
    this.getLastLaunchVersion = getLastLaunchVersion;
    this.getCurrentLocale = getCurrentLocale;
    this.getPlatform = getPlatform;
  }

  getUTXOsForAddresses: AddressUtxoRequest => Promise<AddressUtxoResponse> = (body) => (
    axios(
      `${backendUrl}/api/txs/utxoForAddresses`,
      {
        method: 'post',
        data: {
          addresses: body.addresses
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getUTXOsForAddresses)} error: ` + stringifyError(error));
        throw new GetUtxosForAddressesApiError();
      })
  )

  getTxsBodiesForUTXOs: TxBodiesRequest => Promise<TxBodiesResponse> = (body) => (
    axios(
      `${backendUrl}/api/txs/txBodies`,
      {
        method: 'post',
        data: {
          txsHashes: body.txsHashes
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getTxsBodiesForUTXOs)} error: ` + stringifyError(error));
        throw new GetTxsBodiesForUTXOsApiError();
      })
  )

  getUTXOsSumsForAddresses: UtxoSumRequest => Promise<UtxoSumResponse> = (body) => (
    axios(
      `${backendUrl}/api/txs/utxoSumForAddresses`,
      {
        method: 'post',
        data: {
          addresses: body.addresses
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getUTXOsSumsForAddresses)} error: ` + stringifyError(error));
        throw new GetUtxosSumsForAddressesApiError();
      })
  )

  getTransactionsHistoryForAddresses: HistoryRequest => Promise<HistoryResponse> = (body) => (
    axios(
      `${backendUrl}/api/v2/txs/history`,
      {
        method: 'post',
        data: body,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => {
      return response.data.map((resp: RemoteTransaction) => {
        if (resp.type === 'shelley') {
          // unfortunately the backend returns Shelley addresses as bech32
          // this is a bad idea, and so we manually change them to raw payload
          for (const input of resp.inputs) {
            try {
              const payload = fromWords(decode(input.address, 1000).words);
              // $FlowExpectedError[cannot-write]
              input.address = Buffer.from(payload).toString('hex');
            } catch (_e) { /* expected not to work for base58 addresses */ }
          }
          for (const output of resp.outputs) {
            try {
              const payload = fromWords(decode(output.address, 1000).words);
              // $FlowExpectedError[cannot-write]
              output.address = Buffer.from(payload).toString('hex');
            } catch (_e) { /* expected not to work for base58 addresses */ }
          }
        }
        if (resp.height != null) {
          return resp;
        }
        // $FlowExpectedError[prop-missing] remove if we rename the field in the backend-service
        const height = resp.block_num;
        // $FlowExpectedError[prop-missing] remove if we rename the field in the backend-service
        delete resp.block_num;
        return {
          ...resp,
          height,
        };
      });
    })
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getTransactionsHistoryForAddresses)} error: ` + stringifyError(error));
        if (
          error?.response === 'REFERENCE_BLOCK_MISMATCH' ||
          error?.response === 'REFERENCE_TX_NOT_FOUND' ||
          error?.response === 'REFERENCE_BEST_BLOCK_MISMATCH'
        ) {
          throw new RollbackApiError();
        }
        throw new GetTxHistoryForAddressesApiError();
      })
  )

  getRewardHistory: RewardHistoryRequest => Promise<RewardHistoryResponse> = (body) => (
    // axios(
    //   `${backendUrl}/api/v2/account/rewards`,
    //   {
    //     method: 'post',
    //     data: body,
    //     headers: {
    //       'yoroi-version': this.getLastLaunchVersion(),
    //       'yoroi-locale': this.getCurrentLocale()
    //     }
    //   }
    // ).then(response => response.data)
    //   .catch((error) => {
    //     Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getRewardHistory)} error: ` + stringifyError(error));
    //     throw new GetRewardHistoryApiError();
    //   })
    Promise.resolve({ [body.addresses[0]]: [] }) // TODO: enable once supported by the backend
  )

  getBestBlock: BestBlockRequest => Promise<BestBlockResponse> = (_body) => (
    axios(
      `${backendUrl}/api/v2/bestblock`,
      {
        method: 'get',
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getBestBlock)} error: ` + stringifyError(error));
        throw new GetBestBlockError();
      })
  )

  sendTx: SignedRequest => Promise<SignedResponse> = (body) => {
    const signedTx64 = Buffer.from(body.encodedTx).toString('base64');
    return axios(
      `${backendUrl}/api/txs/signed`,
      {
        method: 'post',
        data: ({
          signedTx: signedTx64
        }: SignedRequestInternal),
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(() => ({
      txId: body.id
    }))
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.sendTx)} error: ` + stringifyError(error));
        if (error.request.response.includes('Invalid witness')) {
          throw new InvalidWitnessError();
        }
        throw new SendTransactionApiError();
      });
  }

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (body) => (
    axios(
      `${backendUrl}/api/v2/addresses/filterUsed`,
      {
        method: 'post',
        data: {
          addresses: body.addresses
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.checkAddressesInUse)} error: ` + stringifyError(error));
        throw new CheckAddressesInUseApiError();
      })
  )

  getAccountState: AccountStateRequest => Promise<AccountStateResponse> = (body) => (
    axios(
      `${backendUrl}/api/getAccountState`,
      {
        method: 'post',
        data: {
          addresses: body.addresses
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getAccountState)} error: ` + stringifyError(error));
        throw new GetAccountStateApiError();
      })
  )

  getPoolInfo: PoolInfoRequest => Promise<PoolInfoResponse> = (body) => (
    axios(
      `${backendUrl}/api/getPoolInfo`,
      {
        method: 'post',
        data: {
          ids: body.ids
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => {
      // backend returns some weird response if the pool doesn't exist
      // I change this to be just "null"
      const newResult: PoolInfoResponse = {};
      for (const key of Object.keys(response.data)) {
        const backendValue = response.data[key];
        if (backendValue === null) { // future proof in case API changes to return null
          newResult[key] = null;
          continue;
        }
        if (backendValue?.history.length === 0 && backendValue?.info?.pledge_address === null) {
          newResult[key] = null;
          continue;
        }
        newResult[key] = backendValue;
      }
      return newResult;
    })
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getPoolInfo)} error: ` + stringifyError(error));
        throw new GetPoolInfoApiError();
      })
  )
}
