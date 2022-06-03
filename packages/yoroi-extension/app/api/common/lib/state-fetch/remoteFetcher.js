// @flow

import type {
  ServerStatusRequest, ServerStatusResponse,
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
  ServerStatusError,
  CurrentCoinPriceError,
  HistoricalCoinPriceError,
} from '../../errors';
import { networks } from '../../../ada/lib/storage/database/prepackaged/networks';

import type { ConfigType } from '../../../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;
const priceBackendUrl = (() => {
  const endpoint = networks.CardanoTestnet.Backend.BackendService;
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

  checkServerStatus: ServerStatusRequest => Promise<ServerStatusResponse> = (_body) => (
    axios(
      `${getEndpoint()}/api/status`,
      {
        method: 'get',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
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
        method: 'get',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
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
        method: 'get',
        timeout: 2 * CONFIG.app.walletRefreshInterval,
        headers: {
          'yoroi-version': this.getLastLaunchVersion(),
          'yoroi-locale': this.getCurrentLocale()
        }
      }).then(response => response.data)
      .catch(error => {
        Logger.error('RemoteFetcher::getHistoricalCoinPrice error: ' + stringifyError(error));
        throw new HistoricalCoinPriceError();
      })
  )

}
