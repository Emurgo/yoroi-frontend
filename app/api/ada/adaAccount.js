// @flow
import { Wallet } from 'rust-cardano-crypto';
import { getCryptoWalletFromSeed } from './lib/cardanoCrypto/cryptoWallet';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import type { WalletSeed } from './lib/cardanoCrypto/cryptoWallet';
import { saveCryptoAccount } from './adaLocalStorage';

const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */

export function newCryptoAccount(
  seed: WalletSeed,
  walletPassword: string
): CryptoAccount {
  const cryptoAccount = createCryptoAccount(seed, walletPassword);
  saveCryptoAccount(cryptoAccount);
  return cryptoAccount;
}

export function createCryptoAccount(
  seed: WalletSeed,
  walletPassword: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  const cryptoWallet = getCryptoWalletFromSeed(seed, walletPassword);
  // This Ok object is the crypto account
  const { Ok } = getOrFail(Wallet.newAccount(cryptoWallet, accountIndex));
  return Ok;
}
