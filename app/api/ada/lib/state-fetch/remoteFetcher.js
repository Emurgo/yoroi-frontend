// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryRequest, HistoryResponse,
  RewardHistoryRequest, RewardHistoryResponse,
  BestBlockRequest, BestBlockResponse,
  SignedRequest, SignedResponse,
  FilterUsedRequest, FilterUsedResponse,
  ServerStatusRequest, ServerStatusResponse,
  ReputationRequest, ReputationResponse,
  AccountStateRequest, AccountStateResponse,
  PoolInfoRequest, PoolInfoResponse,
  SignedRequestInternal,
  RemoteTransaction,
  CurrentCoinPriceRequest, CurrentCoinPriceResponse,
  HistoricalCoinPriceRequest, HistoricalCoinPriceResponse,
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
  GetRewardHistoryApiError,
  GetBestBlockError,
  SendTransactionApiError,
  CheckAdressesInUseApiError,
  InvalidWitnessError,
  ServerStatusError,
  GetAccountStateApiError,
  GetPoolInfoApiError,
  GetReputationError,
  RollbackApiError,
  CurrentCoinPriceError,
  HistoricalCoinPriceError,
} from '../../errors';

import type { ConfigType } from '../../../../../config/config-types';

declare var CONFIG: ConfigType;
const backendUrl = CONFIG.network.backendUrl;
const priceBackendUrl = CONFIG.network.priceBackendUrl;

/**
 * Makes calls to Yoroi backend service
 * https://github.com/Emurgo/yoroi-backend-service/
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
        for (const input of resp.inputs) {
          // backend stores inputs as numbers but outputs as strings
          // we solve this mismatch locally
          input.amount = input.amount.toString();
        }
        if (resp.height != null) {
          return resp;
        }
        // There can only ever be one certificate per tx but our backend returns an array
        // $FlowFixMe remove this if we ever fix this
        if (resp.certificates != null && resp.certificates.length > 0) {
          resp.certificate = resp.certificates[0];
          // $FlowFixMe remove this if we ever fix this
          delete resp.certificates;
        }
        // $FlowFixMe remove this if we ever rename the field in the backend-service
        const height = resp.block_num;
        // $FlowFixMe remove this if we ever rename the field in the backend-service
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
    axios(
      `${backendUrl}/api/v2/account/rewards`,
      {
        method: 'post',
        data: body,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getRewardHistory)} error: ` + stringifyError(error));
        throw new GetRewardHistoryApiError();
      })
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
        throw new CheckAdressesInUseApiError();
      })
  )

  getAccountState: AccountStateRequest => Promise<AccountStateResponse> = (body) => (
    axios(
      `${backendUrl}/api/v2/account/state`,
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
    ).then(response => {
      const mapped = {};
      for (const key of Object.keys(response.data)) {
        // Jormungandr returns '' when the address is valid but it hasn't appeared in the blockchain
        // edit: Jormungandr can now also return a description error whe not in the blockchain
        if (response.data[key] === '' || response.data[key] === 'Account does not exist') {
          mapped[key] = {
            delegation: { pools: [], },
            value: 0,
            counter: 0,
          };
        } else {
          mapped[key] = response.data[key];
        }
      }
      return mapped;
    })
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getAccountState)} error: ` + stringifyError(error));
        throw new GetAccountStateApiError();
      })
  )

  getPoolInfo: PoolInfoRequest => Promise<PoolInfoResponse> = (body) => (
    axios(
      `${backendUrl}/api/v2/pool/info`,
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
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getPoolInfo)} error: ` + stringifyError(error));
        throw new GetPoolInfoApiError();
      })
  )

  getReputation: ReputationRequest => Promise<ReputationResponse> = (_body) => (
    axios(
      `${backendUrl}/api/v2/pool/reputation`,
      {
        method: 'get',
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getReputation)} error: ` + stringifyError(error));
        throw new GetReputationError();
      })
  )

  checkServerStatus: ServerStatusRequest => Promise<ServerStatusResponse> = (_body) => (
    axios(
      `${backendUrl}/api/status`,
      {
        method: 'get',
        headers: {
          'yoroi-version': `${this.getPlatform()} / ${this.getLastLaunchVersion()}`,
          'yoroi-locale': this.getCurrentLocale(),
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.checkServerStatus)} error: ` + stringifyError(error));
        throw new ServerStatusError();
      })
  )

  getCurrentCoinPrice: CurrentCoinPriceRequest => Promise<CurrentCoinPriceResponse> = (body) => (
    axios(`${priceBackendUrl}/price/${body.from}/current`,
      {
        method: 'get'
      }).then(response => response.data)
      .catch(error => {
        Logger.error('RemoteFetcher::getCurrentCoinPrice error: ' + stringifyError(error));
        throw new CurrentCoinPriceError();
      })
  )

  getHistoricalCoinPrice: HistoricalCoinPriceRequest => Promise<HistoricalCoinPriceResponse> = (
    body
  ) => (
    axios(`${priceBackendUrl}/price/${body.from}/${body.timestamps.join(',')}`,
      {
        method: 'get'
      }).then(response => response.data)
      .catch(error => {
        Logger.error('RemoteFetcher::getHistoricalCoinPrice error: ' + stringifyError(error));
        throw new HistoricalCoinPriceError();
      })
  )

}
