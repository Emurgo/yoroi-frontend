// @flow

import { action, observable, runInAction } from 'mobx';
import Store from './Store';
import {
  Logger,
  stringifyError
} from '../../utils/logging';
import type { Ticker, PriceDataRow } from '../../api/ada/lib/storage/database/prices/tables';
import { getPrice, getPriceKey } from '../../api/common/lib/storage/bridge/prices';
import type { ConfigType } from '../../../config/config-types';
import BaseProfileActions from '../../actions/base/base-profile-actions';
import type { UnitOfAccountSettingType } from '../../types/unitOfAccountType';
import { listenForCoinPriceUpdate, getHistoricalCoinPrices, refreshCurrentCoinPrice } from '../../api/thunk';

// populated by ConfigWebpackPlugin
declare var CONFIG: ConfigType;

export default class BaseCoinPriceStore
  <
    TStores: {
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
  expirePriceDataTimeoutId: ?TimeoutID = null;

  @observable // mobx can only use string keys for observable maps
  priceMap: Map<string, $ReadOnly<PriceDataRow>> = new Map();

  setup(): void {
  }

  @action
  loadFromStorage: void => Promise<void> = async () => {
    listenForCoinPriceUpdate(({ ticker }) => {
      runInAction(() => {
        const tickers: Array<Ticker> = Object.entries(ticker.prices).map(
          ([To, Price]) => (
            { From: ticker.from, To, Price: ((Price: any) : number) }
          )
        );

        for (const t of tickers) {
          const index = this.currentPriceTickers.findIndex(
            ({ From, To }) => From === t.From && To === t.To
          );
          if (index === -1) {
            this.currentPriceTickers.push(t);
          } else {
            this.currentPriceTickers[index].Price = t.Price;
          }
        }
        this.lastUpdateTimestamp = ticker.timestamp;
      });
    });
    refreshCurrentCoinPrice();
  }

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

  updateTransactionPriceData: {|
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

    try {
      const rows = await getHistoricalCoinPrices({ from, timestamps: missingTimestamps });

      rows.forEach(row => this.priceMap.set(
        getPriceKey(row.From, row.To, row.Time),
        row
      ));
    } catch (error) {
      Logger.error(`${nameof(BaseCoinPriceStore)}::${nameof(this.updateTransactionPriceData)}: ` + stringifyError(error));
    }
  }

  @action _expirePriceData: void => void = () => {
    this.currentPriceTickers.splice(0);
  }

}
