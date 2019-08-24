// @flow

import { action, observable, computed, runInAction } from 'mobx';
import Store from '../base/Store';
import environment from '../../environment';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import type { 
  CurrentCoinPriceResponse,
  HistoricalCoinPriceResponse,
} from '../../api/ada/lib/state-fetch/types';
import WalletTransaction from '../../domain/WalletTransaction';
import {
  cachePriceData
} from '../../api/ada/lib/storage/lovefieldDatabase.js';
import type { Ticker } from '../../types/coinPriceType';
import { getPrice } from '../../types/coinPriceType';
import { verifyTicker } from '../../api/verify';

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
    const price = getPrice(from, to, this.tickers);
    if (!price) {
      return null;
    }
    return price;
  }

  getTargetCurrencies(): Array<string> {
    return tickers.map(ticker => ticker.to);
  }

  _waitForRustModule = async (): void => {
    await this.stores.loading.loadRustRequest.promise;
  }

  @action _refreshCoinPrice = async (): Promise<void> => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    try {
      const response: CurrentCoinPriceResponse = await stateFetcher.getCurrentCoinPrice({
        from: 'ADA',
      });

      if (response.error !== null) {
        throw new Error('coin price backend error: '+response.error);
      }

      // Must wait for the asynchronous loading of the Rust module before calling verifyTicker
      await this._waitForRustModule();
      if (!verifyTicker(response.ticker)) {
        throw new Error('Invalid ticker signature: '+JSON.stringify(reponse.ticker));
      }

      this.nextRefreshTimeout = CONFIG.app.coinPriceRefreshInterval;
      if (this.expirePriceDataTimeoutId) {
        clearTimeout(this.expirePriceDataTimeoutId);
      }
      this.expirePriceDataTimeoutId = setTimeout(this._expirePriceData, CONFIG.app.coinPriceFreshnessThreshold);

      this._updatePriceData(response);
    } catch (error) {
      Logger.error('CoinPriceStore::_refreshCoinPrice: ' + stringifyError(error));
      this.nextRefreshTimeout = CONFIG.app.coinPriceRequestRetryDelay;
    }
    setTimeout(this._refreshCoinPrice, this.nextRefreshTimeout);
  }

  @action _expirePriceData = (): void => {
    this.tickers.splice(0);
  }

  @action _updatePriceData = (response: CurrentCoinPriceResponse): void => {
    const tickers = Object.entries(response.ticker.prices).map(
      ([to, price]) => ({ from: response.ticker.from, to, price }));

    this.tickers.splice(0, this.tickers.length, ...tickers);
    this.lastUpdateTimestamp = response.ticker.timestamp;
  }

  async updateTransactionPriceData(transactions: Array<WalletTransaction>): void {
    transactions = transactions.filter(tx => tx.tickers === null);
    if (!transactions.length) {
      return;
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const timestamps = transactions.map(tx => tx.date.valueOf());
    try {
      const response: HistoricalCoinPriceResponse = 
        await stateFetcher.getHistoricalCoinPrice({ from: 'ADA', timestamps });
      if (response.error !== null) {
        throw new Error('historical coin price query error: '+response.error);
      }
      if (response.tickers.length !== transactions.length) {
        throw new Error('historical coin price query error: data length mismatch');
      }

      // Must wait for the asynchronous loading of the Rust module before calling verifyTicker
      await this._waitForRustModule();
      transactions.forEach((tx, i) => {
        const ticker = response.tickers[i];
        if (!verifyTicker(ticker)) {
          throw new Error('Invalid ticker signature: '+JSON.stringify(ticker));
        }

        const tickers = Object.entries(ticker.prices).map(([to, price]) =>
          ({ from: response.tickers[i].from, to, price }));
        runInAction(() => {
          tx.tickers = tickers;
        });
        cachePriceData(tx.date.valueOf(), tickers); 
      });
    } catch (error) {
      Logger.error('CoinPriceStore::updateTransactionPriceData: ' + stringifyError(error))
    }
  }

}
