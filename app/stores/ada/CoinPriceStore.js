// @flow

import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import type { CoinPriceResponse } from '../../api/ada/lib/state-fetch/types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export default class CoinPriceStore extends Store {
  @observable tickers: Array<{| from: string, to: string, price: number |}> = [];
  nextRereshDelay: number;
  expirePriceDataTimeoutId: ?number = null;

  setup() {
    this.nextRefreshTimeout = CONFIG.app.coinPriceRefreshInterval;
    this._refreshCoinPrice();
  }

  getCurrentPrice(from: string, to: string): ?number {
    if (Date.now() - this.lastUpdateTimestamp > CONFIG.app.coinPriceFreshnessThreshold) {
      return null;
    }
    const ticker = this.tickers.find(ticker => (
      (ticker.from.toUpperCase() === from.toUpperCase()) && 
      (ticker.to.toUpperCase() === to.toUpperCase())
    ));
    if (!ticker) {
      return null;
    }
    return ticker.price;
  }

  getTargetCurrencies(): Array<string> {
    return tickers.map(ticker => ticker.to);
  }

  @action _refreshCoinPrice = async (): Promise<void> => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    try {
      const response: CoinPriceResponse = await stateFetcher.getCoinPrice({
        time: 'current',
        from: 'ADA',
      });
      if (response.error !== null) {
        throw new Error('coin price backend error: '+response.error);
      }
      this.nextRefreshTimeout = CONFIG.app.coinPriceRefreshInterval;
      if (this.expirePriceDataTimeoutId) {
        clearTimeout(this.expirePriceDataTimeoutId);
      }
      this.expirePriceDataTimeoutId = setTimeout(this._expirePriceData, CONFIG.app.coinPriceFreshnessThreshold);
      this._updatePriceData(response.tickers);
    } catch (error) {
      Logger.error('CoinPriceStore::_refreshCoinPrice: ' + stringifyError(error));
      this.nextRefreshTimeout = CONFIG.app.coinPriceRequestRetryDelay;
    }
    setTimeout(this._refreshCoinPrice, this.nextRefreshTimeout);
  }

  @action _expirePriceData = (): void => {
    this.tickers.splice(0);
  }

  @action _updatePriceData = (tickers): void => {
    // This essential assigns `tickers` to `this.tickers` but retains the array object
    Array.prototype.splice.bind(this.tickers, 0, this.tickers.length).apply(null, tickers);
    this.lastUpdateTimestamp = Date.now();
  }
}
