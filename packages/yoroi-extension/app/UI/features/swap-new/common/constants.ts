import { Portfolio } from '@yoroi/types';

export const PRICE_PRECISION = 10;
export const PRICE_IMPACT_MODERATE_RISK = 1;
export const PRICE_IMPACT_HIGH_RISK = 10;

export const ASSET_DIRECTION_IN = 'in';
export const ASSET_DIRECTION_OUT = 'out';

export const MARKET_ORDER = 'market';
export const LIMIT_ORDER = 'limit';

export const undefinedToken: Portfolio.Token.Id = '.unknown';
export const USDA_TOKEN_ID = 'fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456.55534441';

export const DEX_ROUTING = {
  AUTO: 'auto',
  DEXHUNTER: 'dexhunter',
  MUESLISWAP: 'muesliswap',
  MINSWAP: 'minswap',
} as const;

export type Aggregator = typeof DEX_ROUTING.DEXHUNTER | typeof DEX_ROUTING.MUESLISWAP | typeof DEX_ROUTING.MINSWAP;
export type RoutingPref = typeof DEX_ROUTING.AUTO | Aggregator[];
