import { ASSET_DIRECTION_IN, ASSET_DIRECTION_OUT, LIMIT_ORDER, MARKET_ORDER } from './constants';

export type AssetDirectionType = typeof ASSET_DIRECTION_IN | typeof ASSET_DIRECTION_OUT;

export type MarketOrderType = typeof MARKET_ORDER | typeof LIMIT_ORDER;
