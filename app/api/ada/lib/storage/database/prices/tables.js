// @flow

import { Type, } from 'lovefield';
import type { lf$schema$Builder } from 'lovefield';

export type Ticker = {|
  From: string, // source currency symbol
  To: string,   // target currency symbol
  Price: number,
|};

export type PriceDataInsert = {|
  ...Ticker,
  Time: Date,
|};
export type PriceDataRow = {|
  ...PriceDataInsert,
|};
export const PriceDataSchema: {|
  name: 'PriceData',
  properties: $ObjMapi<PriceDataRow, ToSchemaProp>,
|} = {
  name: 'PriceData',
  properties: {
    From: 'From',
    To: 'To',
    Time: 'Time',
    Price: 'Price',
  }
};

export const populatePricesDb: lf$schema$Builder => void = (schemaBuilder) => {
  schemaBuilder.createTable(PriceDataSchema.name)
    .addColumn(PriceDataSchema.properties.From, Type.NUMBER)
    .addColumn(PriceDataSchema.properties.To, Type.STRING)
    .addColumn(PriceDataSchema.properties.Time, Type.DATE_TIME)
    .addColumn(PriceDataSchema.properties.Price, Type.NUMBER)
    .addPrimaryKey(([
      PriceDataSchema.properties.From,
      PriceDataSchema.properties.To,
      PriceDataSchema.properties.Time,
    ]: Array<string>));
};
