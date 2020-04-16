// @flow

import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { action, observable, runInAction } from 'mobx';
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
import type { Ticker } from '../../api/ada/lib/storage/database/prices/tables';
import { getPrice, upsertPrices, getAllPrices } from '../../api/ada/lib/storage/bridge/prices';
import { verifyTicker, verifyPubKeyDataReplacement } from '../../api/verify';
import { PublicDeriver } from '../../api/ada/lib/storage/models/PublicDeriver/index';
import type { ConfigType } from '../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export default class CoinPriceStore extends Store {
  @observable tickers: Array<{| From: string, To: string, Price: number |}> = [];
  @observable lastUpdateTimestamp: number|null = null;

  nextRefreshTimeout: number = 0;
  expirePriceDataTimeoutId: ?TimeoutID = null;
  // Cached public key to verify the price data.
  pubKeyData: ?RustModule.WalletV3.PublicKey = null;

  setup(): void {
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
    return getPrice(from, to, this.tickers);
  }

  _waitForRustModule: void => Promise<void> = async () => {
    await this.stores.loading.loadRustRequest.promise;
  }

  @action _refreshCoinPrice: void => Promise<void> = async () => {
    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    try {
      const response: CurrentCoinPriceResponse = await stateFetcher.getCurrentCoinPrice({
        from: 'ADA',
      });

      if (response.error != null) {
        throw new Error('coin price backend error: ' + response.error);
      }

      await this._loadPubKeyData();
      if (response.pubKeyData != null && response.pubKeyDataSignature != null) {
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
      this.expirePriceDataTimeoutId = setTimeout(
        this._expirePriceData, CONFIG.app.coinPriceFreshnessThreshold
      );

      this._updatePriceData(response);
    } catch (error) {
      Logger.error('CoinPriceStore::_refreshCoinPrice: ' + stringifyError(error));
      this.nextRefreshTimeout = CONFIG.app.coinPriceRequestRetryDelay;
    }
    setTimeout(this._refreshCoinPrice, this.nextRefreshTimeout);
  }

  @action _expirePriceData: void => void = () => {
    this.tickers.splice(0);
  }

  @action _updatePriceData: CurrentCoinPriceResponse => void = (response) => {
    const tickers: Array<Ticker> = Object.entries(response.ticker.prices).map(
      ([To, Price]) => (
        { From: response.ticker.from, To, Price: ((Price: any) : number) }
      )
    );

    this.tickers.splice(0, this.tickers.length, ...tickers);
    this.lastUpdateTimestamp = response.ticker.timestamp;
  }

  updateTransactionPriceData: {|
    publicDeriver: PublicDeriver<>,
    transactions: Array<WalletTransaction> // TODO: don't want this
  |} => Promise<void> = async (request) => {
    const filteredTxs = request.transactions.filter(tx => tx.tickers === null);
    if (!filteredTxs.length) {
      return;
    }

    const stateFetcher = this.stores.substores[environment.API].stateFetchStore.fetcher;
    const timestamps = filteredTxs.map(tx => tx.date.valueOf());
    try {
      const response: HistoricalCoinPriceResponse =
        await stateFetcher.getHistoricalCoinPrice({ from: 'ADA', timestamps });
      if (response.error != null) {
        throw new Error('historical coin price query error: ' + response.error);
      }
      if (response.tickers.length !== filteredTxs.length) {
        throw new Error('historical coin price query error: data length mismatch');
      }

      await this._loadPubKeyData();
      filteredTxs.forEach((tx, i) => {
        const ticker = response.tickers[i];
        if (!this.pubKeyData) {
          throw new Error('missing pubKeyData - should never happen');
        }
        if (!verifyTicker(ticker, this.pubKeyData)) {
          throw new Error('Invalid ticker signature: ' + JSON.stringify(ticker));
        }

        const tickers: Array<Ticker> =
          Object.entries(ticker.prices).map(([To, Price]) => (
            { From: response.tickers[i].from, To, Price: ((Price: any): number) }));
        runInAction(() => {
          tx.tickers = tickers;
        });
        upsertPrices({
          db: request.publicDeriver.getDb(),
          prices: tickers.map(singleTicker => ({
            ...singleTicker,
            Time: tx.date,
          })),
        });
      });
    } catch (error) {
      Logger.error('CoinPriceStore::updateTransactionPriceData: ' + stringifyError(error));
    }
  }

  _loadPubKeyData: void => Promise<void> = async () => {
    if (this.pubKeyData) {
      return;
    }
    await this._waitForRustModule();
    const storedKey: ?string = await this.api.localStorage.getCoinPricePubKeyData();
    Logger.debug(`CoinPriceStore: stored pubKeyData ${storedKey == null ? 'null' : storedKey}`);
    this.pubKeyData = RustModule.WalletV3.PublicKey.from_bytes(Buffer.from(
      storedKey != null ? storedKey : CONFIG.app.pubKeyData,
      'hex'
    ));
  }

  _replacePubKeyData: (string, string) => Promise<void> = async (
    pubKeyData,
    pubKeyDataSignature
  ) => {
    if (!this.pubKeyData) {
      throw new Error('missing pubKeyData - should never happen');
    }
    if (Buffer.from(this.pubKeyData.as_bytes()).toString('hex') === pubKeyData) {
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
    this.pubKeyData = RustModule.WalletV3.PublicKey.from_bytes(Buffer.from(pubKeyData, 'hex'));
    await this.api.localStorage.setCoinPricePubKeyData(pubKeyData);
  }
}
