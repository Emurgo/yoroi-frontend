// @flow

import type {
  ServerStatusRequest, ServerStatusResponse,
  CurrentCoinPriceRequest, CurrentCoinPriceResponse,
  HistoricalCoinPriceRequest, HistoricalCoinPriceResponse,
} from './types';

import type { IFetcher } from './IFetcher.types';
import {
  Logger,
  stringifyError
} from '../../../../utils/logging';
import {
  ServerStatusError,
  CurrentCoinPriceError,
  HistoricalCoinPriceError,
} from '../../errors';
import { networks } from '../../../ada/lib/storage/database/prepackaged/networks';

import type { ConfigType } from '../../../../../config/config-types';

import { environment } from '../../../../environment';
import { makeTimeoutAbortSignal, fetchAndEnsureSuccess } from '../../../utils';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const priceBackendUrl = (() => {
  let endpoint;
  if (environment.isNightly()) {
    endpoint = networks.CardanoPreprodTestnet.Backend.BackendService;
  } else {
    endpoint = networks.CardanoMainnet.Backend.BackendService;
  }
  if (endpoint == null) {
    throw new Error();
  }
  return endpoint;
})();

function getEndpoint(): string {
  // TODO: some currency-independent endpoint
  const endpoint = networks.CardanoMainnet.Backend.BackendService;
  if (endpoint == null) {
    throw new Error();
  }
  return endpoint;
}

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

  checkServerStatus: ServerStatusRequest => Promise<ServerStatusResponse> = (param) => (
    fetchAndEnsureSuccess(
      `${param.backend || getEndpoint()}/api/status`,
      {
        method: 'GET',
        signal: makeTimeoutAbortSignal(CONFIG.app.walletRefreshInterval),
        headers: {
          'yoroi-version': `${this.getPlatform()} / ${this.getLastLaunchVersion()}`,
          'yoroi-locale': this.getCurrentLocale(),
        }
      }
    ).then(response => response.json())
      .catch((error) => {
        Logger.error(`${nameof(RemoteFetcher)}::${nameof(this.checkServerStatus)} error: ` + stringifyError(error));
        throw new ServerStatusError();
      })
  )

  getCurrentCoinPrice: CurrentCoinPriceRequest => Promise<CurrentCoinPriceResponse> = (body) => (
    fetchAndEnsureSuccess(`${priceBackendUrl}/api/price/${body.from}/current`,
      {
        method: 'GET',
        signal: makeTimeoutAbortSignal(2 * CONFIG.app.walletRefreshInterval),
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }).then(response => response.json())
      .catch(error => {
        Logger.error('RemoteFetcher::getCurrentCoinPrice error: ' + stringifyError(error));
        throw new CurrentCoinPriceError();
      })
  )

  getHistoricalCoinPrice: HistoricalCoinPriceRequest => Promise<HistoricalCoinPriceResponse> = (
    body
  ) => (
    fetchAndEnsureSuccess(`${priceBackendUrl}/api/price/${body.from}/${body.timestamps.join(',')}`,
      {
        method: 'GET',
        signal: makeTimeoutAbortSignal(2 * CONFIG.app.walletRefreshInterval),
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }).then(response => response.json())
      .catch(error => {
        Logger.error('RemoteFetcher::getHistoricalCoinPrice error: ' + stringifyError(error));
        throw new HistoricalCoinPriceError();
      })
  )

}
