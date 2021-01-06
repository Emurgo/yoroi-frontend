// @flow

import type {
  AddressUtxoRequest, AddressUtxoResponse,
  TxBodiesRequest, TxBodiesResponse,
  UtxoSumRequest, UtxoSumResponse,
  HistoryFunc, HistoryRequest, HistoryResponse,
  BestBlockRequest, BestBlockResponse,
  SignedRequest, SignedResponse,
  AssetInfoRequest, AssetInfoResponse,
} from './types';
import type {
  FilterFunc, FilterUsedRequest, FilterUsedResponse,
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
  GetBestBlockError,
  SendTransactionApiError,
  GetAssetInfoApiError,
  CheckAddressesInUseApiError,
  InvalidWitnessError,
  RollbackApiError,
} from '../../../common/errors';

import type { ConfigType } from '../../../../../config/config-types';

import { decode, encode } from 'bs58';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

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

  getUTXOsForAddresses: AddressUtxoRequest => Promise<AddressUtxoResponse> = async (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getUTXOsForAddresses)} missing backend url`);
    return await axios(
      `${BackendService}/api/txs/utxoForAddresses`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: {
          addresses: body.addresses.map(addr => encode(Buffer.from(addr, 'hex')))
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data.map((resp: ElementOf<AddressUtxoResponse>) => ({
      ...resp,
      receiver: decode(resp.receiver).toString('hex'),
    })))
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getUTXOsForAddresses)} error: ` + stringifyError(error));
        throw new GetUtxosForAddressesApiError();
      });
  }

  getTxsBodiesForUTXOs: TxBodiesRequest => Promise<TxBodiesResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getTxsBodiesForUTXOs)} missing backend url`);
    return axios(
      `${BackendService}/api/txs/txBodies`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: {
          txsHashes: body.txHashes
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
      });
  }

  getUTXOsSumsForAddresses: UtxoSumRequest => Promise<UtxoSumResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getUTXOsSumsForAddresses)} missing backend url`);
    return axios(
      `${BackendService}/api/txs/utxoSumForAddresses`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: {
          addresses: body.addresses.map(addr => encode(Buffer.from(addr, 'hex')))
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
      });
  }

  getTransactionsHistoryForAddresses: HistoryRequest => Promise<HistoryResponse> = (request) => {
    const { network, ...rest } = request;
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getTransactionsHistoryForAddresses)} missing backend url`);

    return fixHistoryFunc(async body => {
      return axios(
        `${BackendService}/api/v2/txs/history`,
        {
          method: 'post',
          timeout: 2 * CONFIG.app.walletRefreshInterval,
          data: {
            ...rest,
            addresses: body.addresses,
          },
          headers: {
            'yoroi-version': this.getLastLaunchVersion(),
            'yoroi-locale': this.getCurrentLocale()
          }
        }
      ).then(response => {
        const data: HistoryResponse = response.data;
        for (const datum of data) {
          for (let i = 0; i < datum.inputs.length; i++) {
            // TODO: remove this once this ticket is merged
            // https://github.com/ergoplatform/explorer-backend/issues/92
            if (datum.inputs[i].assets == null) {
              datum.inputs[i].assets = [];
            }
          }
        }
        return data;
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
        });
    })(request);
  }

  getBestBlock: BestBlockRequest => Promise<BestBlockResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getBestBlock)} missing backend url`);
    return axios(
      `${BackendService}/api/v2/bestblock`,
      {
        method: 'get',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getBestBlock)} error: ` + stringifyError(error));
        throw new GetBestBlockError();
      });
  }

  sendTx: SignedRequest => Promise<SignedResponse> = (body) => {
    const { network, ...rest } = body;
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.sendTx)} missing backend url`);
    return axios(
      `${BackendService}/api/txs/signed`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: rest,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => ({
      txId: response.data.id,
    }))
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.sendTx)} error: ` + stringifyError(error));
        if (error.request.response.includes('Invalid witness')) {
          throw new InvalidWitnessError();
        }
        throw new SendTransactionApiError();
      });
  }

  getAssetInfo: AssetInfoRequest => Promise<AssetInfoResponse> = (request) => {
    const { BackendService } = request.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getAssetInfo)} missing backend url`);
    return axios(
      `${BackendService}/api/assets/info`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: {
          assetIds: request.assetIds
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getAssetInfo)} error: ` + stringifyError(error));
        throw new GetAssetInfoApiError();
      });
  }

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (request) => {
    const { BackendService } = request.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.checkAddressesInUse)} missing backend url`);
    return fixFilterFunc(body => {
      return axios(
        `${BackendService}/api/v2/addresses/filterUsed`,
        {
          method: 'post',
          timeout: 2 * CONFIG.app.walletRefreshInterval,
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
