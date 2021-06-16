// @flow
import BigNumber from 'bignumber.js';

// This is the precision of the yearly return percentage
// ex: 1.00000000% return per year, 1.23456789% return per year are all 8 digit precision
export const EPOCH_REWARD_DENOMINATOR: BigNumber = new BigNumber(10).pow(8);

export const HARD_DERIVATION_START: 2147483648 = 0x80000000;

export const WalletTypePurpose = Object.freeze({
  BIP44: 2147483692, // HARD_DERIVATION_START + 44;
  CIP1852: 2147485500, // HARD_DERIVATION_START + 1852;
});
export type WalletTypePurposeT = $Values<typeof WalletTypePurpose>;
export const CoinTypes = Object.freeze({
  CARDANO: 2147485463, // HARD_DERIVATION_START + 1815;
  ERGO: 2147484077, // HARD_DERIVATION_START + 429;
});
export type CoinTypesT = $Values<typeof CoinTypes>;

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
 * which says no reorg should be longer than 2160 blocks
 * TODO: value for Ouroboros Genesis
 */
export const CARDANO_STABLE_SIZE = 2160;

/**
 * no safe reorg size of PoW cryptocurrencies
 */
export const ERGO_STABLE_SIZE = Number.MAX_SAFE_INTEGER / 2;

// Catalyst fund 4 *technically* requires > 450 ADA to participate
// However, the official min amount is 500 ADA
export const CATALYST_MIN_AMOUNT: BigNumber = new BigNumber(450 * 1_000_000);
export const CATALYST_DISPLAYED_MIN_AMOUNT: BigNumber = new BigNumber(500 * 1_000_000);
