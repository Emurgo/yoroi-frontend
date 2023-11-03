// @flow

import type {
  AddressUtxoRequest,
  AddressUtxoResponse,
  AssetInfoRequest,
  AssetInfoResponse,
  BestBlockRequest,
  BestBlockResponse,
  HistoryFunc,
  HistoryRequest,
  HistoryResponse,
  SignedRequest,
  SignedResponse,
  TxBodiesRequest,
  TxBodiesResponse,
  UtxoSumRequest,
  UtxoSumResponse,
} from './types';
import type {
  FilterFunc,
  FilterUsedRequest,
  FilterUsedResponse,
} from '../../../common/lib/state-fetch/currencySpecificTypes';

import type { IFetcher } from './IFetcher';

import axios from 'axios';
import { Logger, stringifyError } from '../../../../utils/logging';
import {
  CheckAddressesInUseApiError,
  GetAssetInfoApiError,
  GetBestBlockError,
  GetTxHistoryForAddressesApiError,
  GetTxsBodiesForUTXOsApiError,
  GetUtxosForAddressesApiError,
  GetUtxosSumsForAddressesApiError,
  InvalidWitnessError,
  RollbackApiError,
  SendTransactionApiError,
} from '../../../common/errors';

import type { ConfigType } from '../../../../../config/config-types';
import { fixUtxoToStringValues } from '../../index';

import { decode, encode } from 'bs58';
import JSONBigInt from 'json-bigint';
import cloneDeep from 'lodash/cloneDeep'
import BigNumber from 'bignumber.js';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

function errClass(Err: Function): (* => Function) {
  return _ => new Err();
}

type AxiosGet<T> = {|
  responseMapper?: Object => T,
  callerName: string,
  errorFactory: (error: any) => Function,
|};
type AxiosPost<T> = {|
  data?: any,
  ...AxiosGet<T>,
|};
type AxiosParams<T> = AxiosGet<T> | AxiosPost<T>;
type AxiosMethod = 'get' | 'post';
type AxiosFunc<T> = (string, AxiosParams<T>) => Promise<T>

function axiosRequest<T>(fetcher: RemoteFetcher, method: AxiosMethod): AxiosFunc<T> {
  return (url, params) => {
    const debug = (s: string, p: any) => {
      // eslint-disable-next-line no-console
      console.debug(`AXIOS[${method}][${url}] ${s} > `, cloneDeep(p));
    };
    debug('CALLING', params);
    return axios(url, {
      method,
      timeout: 2 * CONFIG.app.walletRefreshInterval,
      headers: {
        'yoroi-version': fetcher.getLastLaunchVersion(),
        'yoroi-locale': fetcher.getCurrentLocale()
      },
      transformResponse: resp => {
        debug('RSPRAW', resp);
        return JSONBigInt.parse(resp);
      },
      transformRequest: (data, headers) => {
        if (!data) {
          return data;
        }
        const res = JSONBigInt.stringify(data);
        debug('REQFIX', res);
        if (headers) {
          headers['Content-Type'] = 'application/json';
        }
        return res;
      },
      ...(params.data ? { data: params.data } : {}),
    }).then(response => {
      debug('RSP', response);
      const mapper: ?(Object => T) = params.responseMapper;
      const data = response.data;
      if (!mapper) {
        // forcing the type, since the mapper has not been specified
        const t: T = data;
        return t;
      }
      const res: T = mapper(data);
      debug('RSPMAP', res);
      return res;
    }).catch((error) => {
      debug('ERR', error);
      Logger.error(`${nameof(RemoteFetcher)}::${params.callerName} error: ` + stringifyError(error));
      throw (params.errorFactory(error) ?? error);
    });
  };
}

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

  axiosGet: <T>(string, {|
    responseMapper?: Object => T,
    callerName: string,
    errorFactory: (error: any) => Function,
  |}) => Promise<T> = axiosRequest(this, 'get');

  axiosPost: <T>(string, {|
    data: any,
    responseMapper?: Object => T,
    callerName: string,
    errorFactory: (error: any) => Function,
  |}) => Promise<T> = axiosRequest(this, 'post');


  getUTXOsForAddresses: AddressUtxoRequest => Promise<AddressUtxoResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getUTXOsForAddresses)} missing backend url`);
    return this.axiosPost(`${BackendService}/api/txs/utxoForAddresses`, {
      data: { addresses: body.addresses.map(addr => encode(Buffer.from(addr, 'hex'))) },
      callerName: nameof(this.getUTXOsForAddresses),
      errorFactory: errClass(GetUtxosForAddressesApiError),
      responseMapper: data => {
        return data.map((resp: ElementOf<AddressUtxoResponse>) => ({
          ...fixUtxoToStringValues(resp),
          receiver: decode(resp.receiver).toString('hex'),
        }))
      }
    });
  }

  getTxsBodiesForUTXOs: TxBodiesRequest => Promise<TxBodiesResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getTxsBodiesForUTXOs)} missing backend url`);
    return this.axiosPost(`${BackendService}/api/txs/txBodies`, {
      data: { txHashes: body.txHashes },
      callerName: nameof(this.getTxsBodiesForUTXOs),
      errorFactory: errClass(GetTxsBodiesForUTXOsApiError),
      responseMapper: data => {
        // $FlowFixMe[incompatible-use]
        Object.values(data).forEach(({ inputs, outputs }) => {
          outputs.forEach(o => fixUtxoToStringValues(o));
          inputs.forEach(i => {
            i.assets = i.assets ?? [];
            fixUtxoToStringValues(i);
          });
        });
        return data;
      }
    });
  }

  getUTXOsSumsForAddresses: UtxoSumRequest => Promise<UtxoSumResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getUTXOsSumsForAddresses)} missing backend url`);
    return this.axiosPost(`${BackendService}/api/txs/utxoSumForAddresses`, {
      data: { addresses: body.addresses.map(addr => encode(Buffer.from(addr, 'hex'))) },
      callerName: nameof(this.getUTXOsSumsForAddresses),
      errorFactory: errClass(GetUtxosSumsForAddressesApiError),
    });
  }

  getTransactionsHistoryForAddresses: HistoryRequest => Promise<HistoryResponse> = (request) => {
    const { network, ...rest } = request;
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getTransactionsHistoryForAddresses)} missing backend url`);

    const self = this;
    return fixHistoryFunc(async body => {
      return await self.axiosPost(`${BackendService}/api/v2/txs/history`, {
        data: { ...rest, addresses: body.addresses },
        callerName: nameof(this.getTransactionsHistoryForAddresses),
        errorFactory: error => {
          const errorMessage = error.response.data.error;
          if (
            errorMessage === 'REFERENCE_BLOCK_MISMATCH' ||
            errorMessage === 'REFERENCE_TX_NOT_FOUND' ||
            errorMessage === 'REFERENCE_BEST_BLOCK_MISMATCH'
          ) {
            return new RollbackApiError();
          }
          return new GetTxHistoryForAddressesApiError();
        },
        responseMapper: (data: HistoryResponse) => {
          for (const datum of data) {
            datum.outputs.forEach(o => fixUtxoToStringValues(o));
            datum.inputs.forEach(i => {
              i.assets = i.assets ?? [];
              fixUtxoToStringValues(i);
            })
          }
          return data;
        },
      });
    })(request);
  }

  getBestBlock: BestBlockRequest => Promise<BestBlockResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getBestBlock)} missing backend url`);
    return this.axiosGet(`${BackendService}/api/v2/bestblock`, {
      callerName: nameof(this.getBestBlock),
      errorFactory: errClass(GetBestBlockError),
    });
  }

  sendTx: SignedRequest => Promise<SignedResponse> = (body) => {
    const { network, ...rest } = cloneDeep(body);
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.sendTx)} missing backend url`);
    rest.outputs.forEach(o => {
      // $FlowFixMe[incompatible-type]
      o.value = new BigNumber(o.value);
      o.assets?.forEach(a => {
        // $FlowFixMe[cannot-write]
        a.amount = new BigNumber(a.amount);
      })
    });
    return this.axiosPost(`${BackendService}/api/txs/signed`, {
      data: rest,
      callerName: nameof(this.sendTx),
      errorFactory: error => {
        if (error.request.response.includes('Invalid witness')) {
          return new InvalidWitnessError();
        }
        return new SendTransactionApiError();
      },
      responseMapper: ({ id }) => ({ txId: id }),
    });
  }

  getAssetInfo: AssetInfoRequest => Promise<AssetInfoResponse> = (request) => {
    const { BackendService } = request.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getAssetInfo)} missing backend url`);
    return this.axiosPost(`${BackendService}/api/assets/info`, {
      data: { assetIds: request.assetIds },
      callerName: nameof(this.getAssetInfo),
      errorFactory: errClass(GetAssetInfoApiError),
    });
  }

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (request) => {
    const { BackendService } = request.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.checkAddressesInUse)} missing backend url`);
    const self = this;
    return fixFilterFunc(body => {
      return self.axiosPost(`${BackendService}/api/v2/addresses/filterUsed`, {
        data: { addresses: body.addresses },
        callerName: nameof(this.checkAddressesInUse),
        errorFactory: errClass(CheckAddressesInUseApiError),
      });
    })(request);
  }
}

export function fixHistoryFunc(func: HistoryFunc): HistoryFunc {
  return async (request) => {
    const fixedAddresses = request.addresses.map(addr => encode(Buffer.from(addr, 'hex')));

    const result = await func({
      network: request.network,
      addresses: fixedAddresses,
      untilBlock: request.untilBlock,
      ...(request.after ? { after: request.after } : null)
    });

    return result.map(resp => ({
      ...resp,
      inputs: resp.inputs.map(input => ({
        ...input,
        address: decode(input.address).toString('hex'),
      })),
      dataInputs: resp.dataInputs.map(input => ({
        ...input,
        address: decode(input.address).toString('hex'),
      })),
      outputs: resp.outputs.map(output => ({
        ...output,
        address: decode(output.address).toString('hex'),
      })),
    }));
  };
}

export function fixFilterFunc(func: FilterFunc): FilterFunc {
  return async (request) => {
    const fixedAddresses = request.addresses.map(addr => encode(Buffer.from(addr, 'hex')));

    const result = await func({
      network: request.network,
      addresses: fixedAddresses,
    });

    return result.map(resp => decode(resp).toString('hex'));
  };
}
