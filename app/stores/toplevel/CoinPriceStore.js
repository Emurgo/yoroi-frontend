// @flow

import type { lf$Database } from 'lovefield';
import { debounce, } from 'lodash';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { action, observable, runInAction } from 'mobx';
import Store from '../base/Store';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Request from '../lib/LocalizedRequest';
import type {
  CurrentCoinPriceResponse,
  HistoricalCoinPriceResponse,
} from '../../api/common/lib/state-fetch/types';
import WalletTransaction from '../../domain/WalletTransaction';
import type { Ticker, PriceDataRow } from '../../api/ada/lib/storage/database/prices/tables';
import { getPrice, upsertPrices, getAllPrices, getPriceKey } from '../../api/ada/lib/storage/bridge/prices';
import type { GetAllPricesFunc } from '../../api/ada/lib/storage/bridge/prices';
import { verifyTicker, verifyPubKeyDataReplacement } from '../../api/verify';
import type { ConfigType } from '../../../config/config-types';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export default class CoinPriceStore extends Store {
  @observable currentPriceTickers: Array<{| From: string, To: string, Price: number |}> = [];
  @observable lastUpdateTimestamp: number|null = null;
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  expirePriceDataTimeoutId: ?TimeoutID = null;
  // Cached public key to verify the price data.
  @observable pubKeyData: ?RustModule.WalletV3.PublicKey = null;

  @observable getAllPrices: Request<GetAllPricesFunc>
    = new Request<GetAllPricesFunc>(getAllPrices);

  @observable refreshCurrentUnit: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(async () => {
      await this.stores.coinPriceStore.refreshCurrentCoinPrice();
      const { selected } = this.stores.wallets;
      if (selected) {
        const { allRequest } = this.stores.transactions
          .getTxRequests(selected).requests;
        const transactions = allRequest.result?.transactions;
        if (allRequest.wasExecuted && transactions != null) {
          await this.stores.coinPriceStore.updateTransactionPriceData({
            db: selected.getDb(),
            transactions,
          });
        }
      }
    });


  @observable // mobx can only use string keys for observable maps
  priceMap: Map<string, $ReadOnly<PriceDataRow>> = new Map();

  setup(): void {
    setInterval(this._pollRefresh, CONFIG.app.coinPriceRefreshInterval);
    // $FlowExpectedError[incompatible-call] built-in types can't handle visibilitychange
    document.addEventListener('visibilitychange', debounce(this._pollRefresh, this.ON_VISIBLE_DEBOUNCE_WAIT));
  }

  @action
  loadFromStorage: void => Promise<void> = async () => {
    // note: only need to care about persistent storage
    // since this is called only once when the app launches
    // so there should be no transient storage when the app loads anyway
    const db = this.stores.loading.loadPersitentDbRequest.result;
    if (db == null) throw new Error(`${nameof(CoinPriceStore)}::${nameof(this.loadFromStorage)} called before storage was initialized`);
    const allPrices = await this.getAllPrices.execute({
      db,
    }).promise;
    if (allPrices == null) throw new Error('Should never happen');
    runInAction(() => {
      for (const price of allPrices) {
        const key = getPriceKey(price.From, price.To, price.Time);
        this.priceMap.set(key, price);
      }
    });

    const storedKey: ?string = await this.api.localStorage.getCoinPricePubKeyData();
    Logger.debug(`${nameof(CoinPriceStore)}: stored pubKeyData ${storedKey == null ? 'null' : storedKey}`);
    runInAction(() => {
      this.pubKeyData = RustModule.WalletV3.PublicKey.from_bytes(Buffer.from(
        storedKey != null ? storedKey : CONFIG.app.pubKeyData,
        'hex'
      ));
    });
  }

  getCurrentPrice(from: string, to: string): ?number {
    if (this.lastUpdateTimestamp === null) {
      return null;
    }
    const lastUpdateTimestamp: number = this.lastUpdateTimestamp;
    if (Date.now() - lastUpdateTimestamp > CONFIG.app.coinPriceFreshnessThreshold) {
      return null;
    }
    return getPrice(from, to, this.currentPriceTickers);
  }

  _pollRefresh: void => Promise<void> = async () => {
    // Do not update if screen not active
    // TODO: use visibilityState instead
    if (!document.hidden) {
      const { hasAnyWallets } = this.stores.wallets;
      if (hasAnyWallets) {
        // note: don't need to await since UI will handle this
        this.refreshCurrentCoinPrice();
      }
    }
  };

  @action refreshCurrentCoinPrice: void => Promise<void> = async () => {
    const { unitOfAccount } = this.stores.profile;
    if (!unitOfAccount.enabled) return;

    const stateFetcher = this.stores.stateFetchStore.fetcher;
    try {
      const response: CurrentCoinPriceResponse = await stateFetcher.getCurrentCoinPrice({
        from: 'ADA',
      });

      if (response.error != null) {
        throw new Error('coin price backend error: ' + response.error);
      }

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

      // if we got here before the timeout expired, clear the timeout
      if (this.expirePriceDataTimeoutId) {
        clearTimeout(this.expirePriceDataTimeoutId);
      }
      // then recreate the timeout (similar to resetting it to 0)
      this.expirePriceDataTimeoutId = setTimeout(
        this._expirePriceData, CONFIG.app.coinPriceFreshnessThreshold
      );

      this._updatePriceData(response, unitOfAccount.currency);
    } catch (error) {
      Logger.error(`${nameof(CoinPriceStore)}::${nameof(this.refreshCurrentCoinPrice)} ` + stringifyError(error));
    }
  }

  @action _expirePriceData: void => void = () => {
    this.currentPriceTickers.splice(0);
  }

  @action _updatePriceData: (CurrentCoinPriceResponse, string) => void = (response, currency) => {
    const tickers: Array<Ticker> = Object.entries(response.ticker.prices).map(
      ([To, Price]) => (
        { From: response.ticker.from, To, Price: ((Price: any) : number) }
      )
    ).filter(ticker => ticker.To === currency);

    this.currentPriceTickers.splice(0, this.currentPriceTickers.length, ...tickers);
    this.lastUpdateTimestamp = response.ticker.timestamp;
  }

  updateTransactionPriceData: {|
    db: lf$Database,
    transactions: Array<WalletTransaction>
  |} => Promise<void> = async (request) => {
    const { unitOfAccount } = this.stores.profile;
    if (!unitOfAccount.enabled) return;

    const timestamps = Array.from(new Set(request.transactions.map(tx => tx.date.valueOf())));
    const missingPrices = timestamps.filter(
      timestamp => this.priceMap.get(
        getPriceKey('ADA', unitOfAccount.currency, new Date(timestamp))
      ) == null
    );
    if (!missingPrices.length) {
      return;
    }

    const stateFetcher = this.stores.stateFetchStore.fetcher;
    try {
      const response: HistoricalCoinPriceResponse =
        await stateFetcher.getHistoricalCoinPrice({ from: 'ADA', timestamps });
      if (response.error != null) {
        throw new Error('historical coin price query error: ' + response.error);
      }
      if (response.tickers.length !== missingPrices.length) {
        throw new Error('historical coin price query error: data length mismatch');
      }

      for (let i = 0; i < missingPrices.length; i++) {
        const ticker = response.tickers[i];
        if (!this.pubKeyData) {
          throw new Error('missing pubKeyData - should never happen');
        }
        if (!verifyTicker(ticker, this.pubKeyData)) {
          throw new Error('Invalid ticker signature: ' + JSON.stringify(ticker));
        }

        const tickers: Array<Ticker> =
          Object.entries(ticker.prices)
            .map(([To, Price]) => (
              { From: response.tickers[i].from, To, Price: ((Price: any): number) }
            ))
            .filter(entry => entry.To === unitOfAccount.currency);
        const rowsInDb = await upsertPrices({
          db: request.db,
          prices: tickers.map(singleTicker => ({
            ...singleTicker,
            Time: new Date(missingPrices[i]),
          })),
        });
        runInAction(() => {
          rowsInDb.map(row => this.priceMap.set(
            getPriceKey(row.From, row.To, row.Time),
            row
          ));
        });
      }
    } catch (error) {
      Logger.error(`${nameof(CoinPriceStore)}::${nameof(this.updateTransactionPriceData)}: ` + stringifyError(error));
    }
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
    Logger.debug(`${nameof(CoinPriceStore)}: replace with pubKeyData ${pubKeyData} signature ${pubKeyDataSignature}.`);
    if (!verifyPubKeyDataReplacement(
      pubKeyData,
      pubKeyDataSignature,
      CONFIG.app.pubKeyMaster
    )) {
      Logger.debug(`${nameof(CoinPriceStore)}: new pubKeyData signature is invalid.;`);
      return;
    }
    runInAction(() => {
      this.pubKeyData = RustModule.WalletV3.PublicKey.from_bytes(Buffer.from(pubKeyData, 'hex'));
    });
    await this.api.localStorage.setCoinPricePubKeyData(pubKeyData);
  }
}
