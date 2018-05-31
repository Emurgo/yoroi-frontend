// @flow
import { Wallet } from 'cardano-crypto';
import { getCryptoWalletFromSeed } from './lib/crypto-wallet';
import type { WalletSeed } from './lib/crypto-wallet';

// FIXME: This shouldn't be exported
export const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */

export function getSingleCryptoAccount(
  seed: WalletSeed,
  walletPassword: ?string
): CryptoAccount {
  const cryptoWallet = getCryptoWalletFromSeed(seed, walletPassword);
  return getCryptoAccount(cryptoWallet, ACCOUNT_INDEX);
}

/* TODO: crypto account should be stored in the localstorage
   in order to avoid insert password each time the user creates a new address
   (implement method: saveCryptoAccount)
*/
export function getCryptoAccount(
  w: CryptoWallet,
  accountIndex: number
): CryptoAccount {
  return Wallet.newAccount(w, accountIndex).result.Ok;
}
