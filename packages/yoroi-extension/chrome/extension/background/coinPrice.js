// @flow
import { getCommonStateFetcher } from './utils';
import LocalStorageApi from '../../../app/api/localStorage/index';
import type { ResponseTicker } from '../../../app/api/common/lib/state-fetch/types';
import { emitUpdateToSubscriptions, getSubscriptions } from './subscriptionManager';
import type { ConfigType } from '../../../config/config-types';
import type { HistoricalCoinPriceResponse, HistoricalCoinPricesRequest } from '../../../app/api/thunk';
import type { Ticker, PriceDataRow } from '../../../app/api/ada/lib/storage/database/prices/tables';
import { upsertPrices, getAllPrices } from '../../../app/api/common/lib/storage/bridge/prices';
import { getDb } from './state';

declare var CONFIG: ConfigType;

export function startPoll(): void {
  refreshCurrentCoinPrice('poll');
  setInterval(() => { refreshCurrentCoinPrice('poll'); }, CONFIG.app.coinPriceRefreshInterval);
}

const SOURCE_CURRENCY = 'ADA';
let currentPriceTicker: ResponseTicker | null = null;

export function refreshCurrentCoinPrice(why: 'UI' | 'poll'): void {
  (async () => {
    const localStorageApi = new LocalStorageApi();
    const unitOfAccountSetting = await localStorageApi.getUnitOfAccount();
    if (!unitOfAccountSetting.enabled) {
      return;
    }

    if (why === 'poll' && getSubscriptions().length === 0) {
      return;
    }

    const stateFetcher = await getCommonStateFetcher();

    if (Date.now() - (currentPriceTicker?.timestamp || 0) > CONFIG.app.coinPriceRefreshInterval / 2) {
      const from = SOURCE_CURRENCY;
      try {
        const response = await stateFetcher.getCurrentCoinPrice({
          from,
        });

        if (response.error != null) {
          console.error('coin price backend error: ' + response.error);
        }

        currentPriceTicker = response.ticker;
      } catch (error) {
        console.error('error when fetching price data for %s: %s', from, error);
      }
    }
    emitUpdateToSubscriptions({
      type: 'coin-price-update',
      params: {
        ticker: currentPriceTicker,
      },
    });
  })().catch(error => {
    console.error('error when refreshing current coin price', error);
  });
}

export async function getHistoricalCoinPrices(
  request: HistoricalCoinPricesRequest
): Promise<HistoricalCoinPriceResponse> {
  const priceMap: Map<number, Array<$ReadOnly<PriceDataRow>>> = new Map();

  const db = await getDb();
  const allRows = await getAllPrices({ db });
  if (allRows == null) throw new Error('Should never happen');

  for (const row of allRows) {
    const timestamp = row.Time.valueOf();
    const rows = priceMap.get(timestamp);
    if (rows) {
      rows.push(row);
    } else {
      priceMap.set(timestamp, [row]);
    }
  }

  const from = request.from === 'TADA' ? 'ADA' : request.from;

  const missingTimestamps = request.timestamps.filter(
    timestamp => priceMap.get(timestamp) == null
  );
  if (missingTimestamps.length) {
    const stateFetcher = await getCommonStateFetcher();

    const response = await stateFetcher.getHistoricalCoinPrice(
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
      const tickers: Array<Ticker> = Object.entries(
        ticker.prices
      ).map(([To, Price]) => (
        { From: response.tickers[i].from, To, Price: ((Price: any): number) }
      ));

      const rowsInDb = await upsertPrices({
        db,
        prices: tickers.map(singleTicker => ({
          ...singleTicker,
          Time: new Date(missingTimestamps[i]),
        })),
      });

      for (const row of rowsInDb) {
        const timestamp = row.Time.valueOf();
        const rows = priceMap.get(timestamp);
        if (rows) {
          rows.push(row);
        } else {
          priceMap.set(timestamp, [row]);
        }
      }
    }
  }

  return request.timestamps.flatMap(ts => priceMap.get(ts) /* should not happen */ || []);
}
