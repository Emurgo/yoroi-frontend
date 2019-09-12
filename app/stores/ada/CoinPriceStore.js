// @flow

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
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
import type { Ticker } from '../../types/unitOfAccountType';
import { getPrice } from '../../types/unitOfAccountType';
import { verifyTicker, verifyPubKeyDataReplacement } from '../../api/verify';
import type { ConfigType } from '../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export default class CoinPriceStore extends Store {
  @observable tickers: Array<{| from: string, to: string, price: number |}> = [];
  @observable lastUpdateTimestamp: number|null = null;;

  nextRefreshTimeout: number = 0;
  expirePriceDataTimeoutId: ?TimeoutID = null;
  // Cached public key to verify the price data.
  pubKeyData: ?RustModule.Wallet.PublicKey = null;

  setup() {
    this.nextRefreshTimeout = CONFIG.app.coinPriceRefreshInterval;
    this._refreshCoinPrice();
  }

  getCurrentPrice(from: string, to: string): ?number {
    if (this.lastUpdateTimestamp === null) {
      return null;
    }
    const lastUpdateTimestamp: number = this.lastUpdateTimestamp;
    if (Date.now() - lastUpdateTimestamp > CONFIG.app.coinPriceFreshnessThreshold) {
      return null;
    }
    const price = getPrice(from, to, this.tickers);
    if (!price) {
      return null;
    }
    return price;
  }

  _waitForRustModule = async (): Promise<void> => {
    await this.stores.loading.loadRustRequest.promise;
  }

  @action _refreshCoinPrice = async (): Promise<void> => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    try {
      const response: CurrentCoinPriceResponse = await stateFetcher.getCurrentCoinPrice({
        from: 'ADA',
      });

      if (response.error) {
        throw new Error('coin price backend error: ' + response.error);
      }

      await this._loadPubKeyData();
      if (response.pubKeyData && response.pubKeyDataSignature) {
        await this._replacePubKeyData(
          response.pubKeyData,
          response.pubKeyDataSignature
        );
      }
      if (!this.pubKeyData) {
        throw new Error('missing pubKeyData - should never happen');
      }
      if (!verifyTicker(response.ticker, this.pubKeyData)) {
        throw new Error('Invalid ticker signature: ' + JSON.stringify(response.ticker));
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
    const tickers: Array<Ticker> = Object.entries(response.ticker.prices).map(
      ([to, price]) => ({ from: response.ticker.from, to, price: ((price: any) : number)}));

    this.tickers.splice(0, this.tickers.length, ...tickers);
    this.lastUpdateTimestamp = response.ticker.timestamp;
  }

  async updateTransactionPriceData(transactions: Array<WalletTransaction>): Promise<void> {
    transactions = transactions.filter(tx => tx.tickers === null);
    if (!transactions.length) {
      return;
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const timestamps = transactions.map(tx => tx.date.valueOf());
    try {
      const response: HistoricalCoinPriceResponse = 
        await stateFetcher.getHistoricalCoinPrice({ from: 'ADA', timestamps });
      if (response.error) {
        throw new Error('historical coin price query error: ' + response.error);
      }
      if (response.tickers.length !== transactions.length) {
        throw new Error('historical coin price query error: data length mismatch');
      }

      await this._loadPubKeyData();
      transactions.forEach((tx, i) => {
        const ticker = response.tickers[i];
        if (!this.pubKeyData) {
          throw new Error('missing pubKeyData - should never happen');
        }
        if (!verifyTicker(ticker, this.pubKeyData)) {
          throw new Error('Invalid ticker signature: ' + JSON.stringify(ticker));
        }

        const tickers: Array<Ticker> = Object.entries(ticker.prices).map(([to, price]) =>
          ({ from: response.tickers[i].from, to, price: ((price: any): number) }));
        runInAction(() => {
          tx.tickers = tickers;
        });
        cachePriceData(tx.date.valueOf(), tickers); 
      });
    } catch (error) {
      Logger.error('CoinPriceStore::updateTransactionPriceData: ' + stringifyError(error))
    }
  }

  _loadPubKeyData = async (): Promise<void> => {
    if (this.pubKeyData) {
      return;
    }
    await this._waitForRustModule();
    const storedKey: ?string = await this.api.localStorage.getCoinPricePubKeyData();
    Logger.debug(`CoinPriceStore: stored pubKeyData ${storedKey || 'null'}`);    
    this.pubKeyData = RustModule.Wallet.PublicKey.from_hex(
      storedKey || CONFIG.app.pubKeyData
    );
  }

  _replacePubKeyData = async (pubKeyData: string, pubKeyDataSignature: string): Promise<void> => {
    if (!this.pubKeyData) {
      throw new Error('missing pubKeyData - should never happen');
    }
    if (this.pubKeyData.to_hex() === pubKeyData) {
      return;
    }
    Logger.debug(`CoinPriceStore: replace with pubKeyData ${pubKeyData} signature ${pubKeyDataSignature}.`);
    if (!verifyPubKeyDataReplacement(
      pubKeyData,
      pubKeyDataSignature,
      CONFIG.app.pubKeyMaster
    )) {
      Logger.debug('CoinPriceStore: new pubKeyData signature is invalid.;');
      return;
    }
    this.pubKeyData = RustModule.Wallet.PublicKey.from_hex(pubKeyData);
    await this.api.localStorage.setCoinPricePubKeyData(pubKeyData);
  }
}
