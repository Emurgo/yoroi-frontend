// @flow

import type {
  AccountStateRequest,
  AccountStateResponse,
  AddressUtxoRequest,
  AddressUtxoResponse,
  BestBlockRequest,
  BestBlockResponse,
  HistoryRequest,
  HistoryResponse,
  PoolInfoRequest,
  PoolInfoResponse,
  RemoteTransaction,
  RewardHistoryRequest,
  RewardHistoryResponse,
  SignedRequest,
  SignedRequestInternal,
  SignedResponse,
  TokenInfoRequest,
  TokenInfoResponse,
  TxBodiesRequest,
  TxBodiesResponse,
  UtxoSumRequest,
  UtxoSumResponse,
  CatalystRoundInfoRequest,
  CatalystRoundInfoResponse,
} from './types';
import type { FilterUsedRequest, FilterUsedResponse, } from '../../../common/lib/state-fetch/currencySpecificTypes';

import type { IFetcher } from './IFetcher';

import axios from 'axios';
import { Logger, stringifyError } from '../../../../utils/logging';
import {
  CheckAddressesInUseApiError,
  GetAccountStateApiError,
  GetBestBlockError,
  GetPoolInfoApiError,
  GetCatalystRoundInfoApiError,
  GetRewardHistoryApiError,
  GetTxHistoryForAddressesApiError,
  GetTxsBodiesForUTXOsApiError,
  GetUtxosForAddressesApiError,
  GetUtxosSumsForAddressesApiError,
  InvalidWitnessError,
  RollbackApiError,
  SendTransactionApiError,
} from '../../../common/errors';
import { RustModule } from '../cardanoCrypto/rustLoader';

import type { ConfigType } from '../../../../../config/config-types';
import { bech32, } from 'bech32';

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
    const result: AddressUtxoResponse = await axios(
      `${BackendService}/api/txs/utxoForAddresses`,
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
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getUTXOsForAddresses)} error: ` + stringifyError(error));
        throw new GetUtxosForAddressesApiError();
      });
    return result.map(utxo => {
      if (utxo.receiver.startsWith('addr')) {
        const fixedAddr = Buffer.from(
          RustModule.WalletV4.Address.from_bech32(utxo.receiver).to_bytes()
        ).toString('hex');
        return {
          ...utxo,
          receiver: fixedAddr,
        };
      }
      return utxo;
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
          addresses: body.addresses
        },
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => {
      const result: UtxoSumResponse = response.data;
      if (result.assets == null) {
        // replace non-existent w/ empty array to handle Allegra -> Mary transition
        // $FlowExpectedError[cannot-write]
        result.assets = [];
      }
      return result;
    })
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getUTXOsSumsForAddresses)} error: ` + stringifyError(error));
        throw new GetUtxosSumsForAddressesApiError();
      });
  }

  getTransactionsHistoryForAddresses: HistoryRequest => Promise<HistoryResponse> = (body) => {
    const { network, ...rest } = body;
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getTransactionsHistoryForAddresses)} missing backend url`);
    return axios(
      `${BackendService}/api/v2/txs/history`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: rest,
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
            // replace non-existent w/ empty array to handle Allegra -> Mary transition
            // $FlowExpectedError[cannot-write]
            input.assets = input.assets ?? [];
            try {
              const payload = bech32.fromWords(bech32.decode(input.address, 1000).words);
              // $FlowExpectedError[cannot-write]
              input.address = Buffer.from(payload).toString('hex');
            } catch (_e) { /* expected not to work for base58 addresses */ }
          }
          for (const output of resp.outputs) {
            // replace non-existent w/ empty array to handle Allegra -> Mary transition
            // $FlowExpectedError[cannot-write]
            output.assets = output.assets ?? [];
            try {
              const payload = bech32.fromWords(bech32.decode(output.address, 1000).words);
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
        const errorMessage = error?.response?.data?.error?.response;
        if (
          errorMessage === 'REFERENCE_BLOCK_MISMATCH' ||
          errorMessage === 'REFERENCE_TX_NOT_FOUND' ||
          errorMessage === 'REFERENCE_BEST_BLOCK_MISMATCH'
        ) {
          throw new RollbackApiError();
        }
        throw new GetTxHistoryForAddressesApiError();
      });
  }

  getRewardHistory: RewardHistoryRequest => Promise<RewardHistoryResponse> = (body) => {
    const { network, ...rest } = body;
    const { BackendService } = network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getRewardHistory)} missing backend url`);
    return axios(
      `${BackendService}/api/account/rewardHistory`,
      {
        method: 'post',
        data: rest,
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getRewardHistory)} error: ` + stringifyError(error));
        throw new GetRewardHistoryApiError();
      });
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
    const signedTx64 = Buffer.from(body.encodedTx).toString('base64');
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.sendTx)} missing backend url`);
    return axios(
      `${BackendService}/api/txs/signed`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
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

  checkAddressesInUse: FilterUsedRequest => Promise<FilterUsedResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.checkAddressesInUse)} missing backend url`);
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
  }

  getAccountState: AccountStateRequest => Promise<AccountStateResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getAccountState)} missing backend url`);
    return axios(
      `${BackendService}/api/account/state`,
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
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getAccountState)} error: ` + stringifyError(error));
        throw new GetAccountStateApiError();
      });
  }

  getPoolInfo: PoolInfoRequest => Promise<PoolInfoResponse> = (body) => {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getPoolInfo)} missing backend url`);
    return axios(
      `${BackendService}/api/pool/info`,
      {
        method: 'post',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        data: {
          poolIds: body.poolIds
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
      });
  }

  getTokenInfo: TokenInfoRequest => Promise<TokenInfoResponse> = async (body) => {
    const { TokenInfoService } = body.network.Backend;
    if (TokenInfoService == null) return {};
    const promises = body.tokenIds.map(id => axios(
      `${TokenInfoService}/metadata/${id}`,
      {
        method: 'get',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
      }
    ).then(response => response.data)
      .catch((error) => {
        if (error.response.status) {
          Logger.info(`${nameof(RemoteFetcher)}::${nameof(this.getTokenInfo)} 404: no token meta found for subject: ` + id);
        } else {
          Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getTokenInfo)} error: ` + stringifyError(error));
        }
        return null;
      }));
    return (await Promise.all(promises)).reduce((res, resp) => {
      if (resp?.subject) {
        const v = {};
        if (resp.name?.value) {
          v.name = resp.name.value;
        }
        if (resp.decimals?.value) {
          v.decimals = resp.decimals.value;
        }
        if (resp.ticker?.value) {
          v.ticker = resp.ticker.value;
        }
        if (v.name || v.decimals || v.ticker) {
          res[resp.subject] = v;
        }

      }
      return res;
    }, {});
  }

  getCatalystRoundInfo: CatalystRoundInfoRequest =>
    Promise<CatalystRoundInfoResponse> = async (body) =>
  {
    const { BackendService } = body.network.Backend;
    if (BackendService == null) throw new Error(`${nameof(this.getCatalystRoundInfo)} missing backend url`);
    return await axios(
      `${BackendService}/api/v0/catalyst/fundInfo`,
      {
        method: 'get',
      }
    ).then(response => response.data)
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.getCatalystRoundInfo)} error: ` + stringifyError(error));
        throw new GetCatalystRoundInfoApiError();
      });
  }
}
