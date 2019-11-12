// @flow
import BigNumber from 'bignumber.js';

export const LOVELACES_PER_ADA = new BigNumber('1 000 000'.replace(/ /g, ''), 10);
export const TOTAL_SUPPLY = new BigNumber('45 000 000 000'.replace(/ /g, ''), 10).times(LOVELACES_PER_ADA);
export const MAX_INTEGER_PLACES_IN_ADA = 11;
export const DECIMAL_PLACES_IN_ADA = 6;
export const MAX_ADA_WALLETS_COUNT = 1;

export const HARD_DERIVATION_START = 0x80000000;
export const CARDANO_COINTYPE = HARD_DERIVATION_START + 1815;
export const BIP44_PURPOSE = HARD_DERIVATION_START + 44;
export const CIP_1852_PURPOSE = HARD_DERIVATION_START + 1852;

/** Defined by bip44
   * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit */
export const BIP44_SCAN_SIZE =  20;

export const EXTERNAL = 0;
export const INTERNAL = 1;

/**
 * Constant K as defined in Ouroboros Classic
 * which says no reorg should be longer than 2160 slots
 */
export const STABLE_SIZE = 2160;
