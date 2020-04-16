// @flow
import BigNumber from 'bignumber.js';

export const LOVELACES_PER_ADA = new BigNumber('1 000 000'.replace(/ /g, ''), 10);
export const TOTAL_SUPPLY = new BigNumber('45 000 000 000'.replace(/ /g, ''), 10).times(LOVELACES_PER_ADA);
export const MAX_INTEGER_PLACES_IN_ADA = 11;
export const DECIMAL_PLACES_IN_ADA = 6;
export const MAX_ADA_WALLETS_COUNT = 1;

export const EPOCH_REWARD_DENOMINATOR = new BigNumber(10).pow(6);

export const HARD_DERIVATION_START: 2147483648 = 0x80000000;

export const WalletTypePurpose = Object.freeze({
  BIP44: 2147483692, // HARD_DERIVATION_START + 44;
  CIP1852: 2147485500, // HARD_DERIVATION_START + 1852;
});
export type WalletTypePurposeT = $Values<typeof WalletTypePurpose>;
export const CoinTypes = Object.freeze({
  CARDANO: 2147485463, // HARD_DERIVATION_START + 1812;
});

/**
 * Defined by bip44
 * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
 */
export const BIP44_SCAN_SIZE = 20;

export const ChainDerivations = Object.freeze({
  EXTERNAL: 0,
  INTERNAL: 1,
  CHIMERIC_ACCOUNT: 2,
});

export const STAKING_KEY_INDEX = 0;

/**
 * Constant K as defined in Ouroboros Classic
 * which says no reorg should be longer than 2160 slots
 * TODO: value for Ouroboros Genesis
 */
export const STABLE_SIZE = 2160;
