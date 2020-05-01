// @flow

import type { Ticker, PriceDataInsert, PriceDataRow } from '../database/prices/tables';
import type { lf$Database } from 'lovefield';
import {
  getAllSchemaTables,
  raii,
} from '../database/utils';
import { GetPriceData } from '../database/prices/api/read';
import { ModifyPriceData } from '../database/prices/api/write';


export function getPriceKey(
  fromCurrency: string,
  toCurrency: string,
  time: Date
): string {
  return JSON.stringify({
    From: fromCurrency,
    To: toCurrency,
    Time: time
  });
}

export function getPrice(
  fromCurrency: string,
  toCurrency: string,
  tickers: ?Array<Ticker>
): number|null {
  if (!tickers) {
    return null;
  }

  const ticker = tickers.find(t => (t.From === fromCurrency) && (t.To === toCurrency));
  if (!ticker) {
    return null;
  }
  return ticker.Price;
}

// upsertPrice

export type UpsertPriceRequest = {|
  db: lf$Database,
  prices: $ReadOnlyArray<PriceDataInsert | PriceDataRow>,
|};
export type UpsertPriceResponse = $ReadOnlyArray<PriceDataRow>;
export type UpsertPriceFunc = (
  request: UpsertPriceRequest
) => Promise<UpsertPriceResponse>;

// getAllPrices

export type GetAllPricesRequest = {|
  db: lf$Database,
|};
export type GetAllPricesResponse = $ReadOnlyArray<PriceDataRow>;
export type GetAllPricesFunc = (
  request: GetAllPricesRequest
) => Promise<GetAllPricesResponse>;

export async function upsertPrices(
  request: UpsertPriceRequest
): Promise<UpsertPriceResponse> {
  const deps = Object.freeze({
    ModifyPriceData
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii(
    request.db,
    depTables,
    async tx => deps.ModifyPriceData.upsertPrices(
      request.db, tx,
      request.prices
    )
  );
}

export async function getAllPrices(
  request: GetAllPricesRequest
): Promise<GetAllPricesResponse> {
  const deps = Object.freeze({
    GetPriceData
  });
  const depTables = Object
    .keys(deps)
    .map(key => deps[key])
    .flatMap(table => getAllSchemaTables(request.db, table));
  return await raii(
    request.db,
    depTables,
    async tx => deps.GetPriceData.getAllPrices(
      request.db, tx,
    )
  );
}
