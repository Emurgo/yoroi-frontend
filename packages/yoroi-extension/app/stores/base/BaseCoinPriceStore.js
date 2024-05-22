// @flow

import type { lf$Database } from 'lovefield';
import { debounce, } from 'lodash';
import { RustModule } from '../../api/ada/lib/cardanoCrypto/rustLoader';
import { action, observable, runInAction } from 'mobx';
import Store from './Store';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import Request from '../lib/LocalizedRequest';
import type {
  CurrentCoinPriceResponse,
  HistoricalCoinPriceResponse,
} from '../../api/common/lib/state-fetch/types';
import type { Ticker, PriceDataRow } from '../../api/ada/lib/storage/database/prices/tables';
import { getPrice, upsertPrices, getAllPrices, getPriceKey } from '../../api/common/lib/storage/bridge/prices';
import type { GetAllPricesFunc } from '../../api/common/lib/storage/bridge/prices';
import { verifyTicker, verifyPubKeyDataReplacement } from '../../api/verify';
import type { ConfigType } from '../../../config/config-types';
import BaseProfileActions from '../../actions/base/base-profile-actions';
import type { IFetcher } from '../../api/common/lib/state-fetch/IFetcher.types';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

const SOURCE_CURRENCIES = ['ADA'];

interface LoadingStore {
  getDatabase(): ?lf$Database
}
interface StateFetchStore {
  fetcher: IFetcher
}

export default class BaseCoinPriceStore
  <
    TStores: {
      +loading: LoadingStore,
      +stateFetchStore: StateFetchStore,
      +profile: {
        get unitOfAccount(): UnitOfAccountSettingType,
        getUnitOfAccountBlock(): Promise<UnitOfAccountSettingType>,
        ...,
      },
      ...,
    },
    TActions: { +profile: BaseProfileActions, ... }
  >
  extends Store<TStores, TActions>
{
  @observable currentPriceTickers: Array<{| From: string, To: string, Price: number |}> = [];
  @observable lastUpdateTimestamp: number|null = null;
  ON_VISIBLE_DEBOUNCE_WAIT: number = 1000;

  expirePriceDataTimeoutId: ?TimeoutID = null;
  // Cached public key to verify the price data.
  @observable pubKeyData: ?RustModule.WalletV4.PublicKey = null;

  @observable getAllPrices: Request<GetAllPricesFunc>
    = new Request<GetAllPricesFunc>(getAllPrices);

  @observable refreshCurrentUnit: Request<void => Promise<void>>
    = new Request<void => Promise<void>>(this.updatePricesForWallet.bind(this));


  @observable // mobx can only use string keys for observable maps
  priceMap: Map<string, $ReadOnly<PriceDataRow>> = new Map();

  setup(): void {
  }

  startPoll(): void {
    this._pollRefresh();
    setInterval(this._pollRefresh, CONFIG.app.coinPriceRefreshInterval);
    document.addEventListener(
      'visibilitychange',
      debounce((_e) => this._pollRefresh(), this.ON_VISIBLE_DEBOUNCE_WAIT)
    );
  }

  @action
  loadFromStorage: void => Promise<void> = async () => {
    // note: only need to care about persistent storage
    // since this is called only once when the app launches
    // so there should be no transient storage when the app loads anyway
    const db = this.stores.loading.getDatabase();
    if (db == null) throw new Error(`${nameof(BaseCoinPriceStore)}::${nameof(this.loadFromStorage)} called before storage was initialized`);
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
    this.loadPubKeyData();
  }

  @action
  loadPubKeyData: void => Promise<void> = async () => {
    await RustModule.load();
    const storedKey: ?string = await this.api.localStorage.getCoinPricePubKeyData();
    Logger.debug(`${nameof(BaseCoinPriceStore)}: stored pubKeyData ${storedKey == null ? 'null' : storedKey}`);
    runInAction(() => {
      this.pubKeyData = RustModule.WalletV4.PublicKey.from_bytes(Buffer.from(
        storedKey != null ? storedKey : CONFIG.app.pubKeyData,
        'hex'
      ));
    });
  }

  /**
   * TODO: this should connect to the tokenInfoStore somehow
   * Since a ticker isn't enough to know which currency to to lookup
   * Since multiple tokens can have the same ticker
   */
  getCurrentPrice: (from: string, to: string) => ?string = (
    from: string, to: string
  ) => {
    if (this.lastUpdateTimestamp === null) {
      return null;
    }
    const lastUpdateTimestamp: number = this.lastUpdateTimestamp;
    if (Date.now() - lastUpdateTimestamp > CONFIG.app.coinPriceFreshnessThreshold) {
      return null;
    }
    const normalizedFrom = from === 'TADA' ? 'ADA' : from;
    const price = getPrice(normalizedFrom, to, this.currentPriceTickers);
    if (price == null) {
      return price;
    }
    return String(price);
  }

  getHistoricalPrice: (from: string, to: string, timestamp: number) => ?string = (
    from: string, to: string, timestamp: number,
  ) => {
    const normalizedFrom = from === 'TADA' ? 'ADA' : from;
    const price = this.priceMap.get(
      getPriceKey(normalizedFrom, to, new Date(timestamp))
    );
    if (price == null) {
      return undefined;
    }
    return String(price.Price);
  }

  _pollRefresh: void => Promise<void> = async () => {
    // Do not update if screen not active
    // TODO: use visibilityState instead
    if (!document.hidden) {
      // note: don't need to await since UI will handle this

      // Note: this is maybe not ideal
      // since it means on screens where no wallet selected, prices won't update
      this.updatePricesForWallet();
    }
  };

  @action refreshCurrentCoinPrice: () => Promise<void> = async () => {
    const unitOfAccount= await this.stores.profile.getUnitOfAccountBlock();
    if (!unitOfAccount.enabled) return;

    const stateFetcher = this.stores.stateFetchStore.fetcher;
    for (const from of SOURCE_CURRENCIES) {
      try {
        const response: CurrentCoinPriceResponse = await stateFetcher.getCurrentCoinPrice({
          from,
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
        Logger.error(`${nameof(BaseCoinPriceStore)}::${nameof(this.refreshCurrentCoinPrice)} ` + stringifyError(error));
      }
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

    for (const ticker of tickers) {
      const index = this.currentPriceTickers.findIndex(
        ({ From, To }) => From === ticker.From && To === ticker.To
      );
      if (index === -1) {
        this.currentPriceTickers.push(ticker);
      } else {
        this.currentPriceTickers[index].Price = ticker.Price;
      }
    }
    this.lastUpdateTimestamp = response.ticker.timestamp;
  }

  async updatePricesForWallet(): ?Promise<void> {
    throw new Error(`${nameof(BaseCoinPriceStore)}::${nameof(this.updatePricesForWallet)} child needs to override this function`);
  }

  updateTransactionPriceData: {|
    db: lf$Database,
    timestamps: Array<number>,
    defaultToken: string,
  |} => Promise<void> = async (request) => {
    const { unitOfAccount } = this.stores.profile;
    if (!unitOfAccount.enabled) return;

    const { timestamps } = request;

    const from = request.defaultToken === 'TADA' ? 'ADA' : request.defaultToken;

    const missingTimestamps = timestamps.filter(
      timestamp => this.priceMap.get(
        getPriceKey(from, unitOfAccount.currency, new Date(timestamp))
      ) == null
    );
    if (!missingTimestamps.length) {
      return;
    }
    const stateFetcher = this.stores.stateFetchStore.fetcher;
    try {
      const response: HistoricalCoinPriceResponse =
        await stateFetcher.getHistoricalCoinPrice(
          { from, timestamps: missingTimestamps }
        );
      if (response.error != null) {
        throw new Error('historical coin price query error: ' + response.error);
      }
      if (response.tickers.length !== missingTimestamps.length) {
        throw new Error('historical coin price query error: data length mismatch');
      }

      for (let i = 0; i < missingTimestamps.length; i++) {
        const ticker = response.tickers[i];
        if (ticker == null) {
          continue
        }
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
            Time: new Date(missingTimestamps[i]),
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
      Logger.error(`${nameof(BaseCoinPriceStore)}::${nameof(this.updateTransactionPriceData)}: ` + stringifyError(error));
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
    Logger.debug(`${nameof(BaseCoinPriceStore)}: replace with pubKeyData ${pubKeyData} signature ${pubKeyDataSignature}.`);
    if (!verifyPubKeyDataReplacement(
      pubKeyData,
      pubKeyDataSignature,
      CONFIG.app.pubKeyMaster
    )) {
      Logger.debug(`${nameof(BaseCoinPriceStore)}: new pubKeyData signature is invalid.;`);
      return;
    }
    runInAction(() => {
      this.pubKeyData = RustModule.WalletV4.PublicKey.from_bytes(Buffer.from(pubKeyData, 'hex'));
    });
    await this.api.localStorage.setCoinPricePubKeyData(pubKeyData);
  }
}
