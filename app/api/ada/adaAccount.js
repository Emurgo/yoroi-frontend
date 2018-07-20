// @flow
import { Wallet } from 'rust-cardano-crypto';
import { getCryptoWalletFromMasterKey } from './lib/cardanoCrypto/cryptoWallet';
import { getOrFail } from './lib/cardanoCrypto/cryptoUtils';
import {
  getFromStorage,
  saveInStorage
} from './lib/utils';
import type { WalletMasterKey } from './lib/cardanoCrypto/cryptoWallet';

const ACCOUNT_KEY = 'ACCOUNT'; // single wallet atm
const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */

export function newCryptoAccount(
  masterKey: WalletMasterKey,
  walletPassword: string
): CryptoAccount {
  const cryptoAccount = createCryptoAccount(masterKey, walletPassword);
  saveCryptoAccount(cryptoAccount);
  return cryptoAccount;
}

export function createCryptoAccount(
  masterKey: WalletMasterKey,
  walletPassword: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, walletPassword);
  const result = getOrFail(Wallet.newAccount(cryptoWallet, accountIndex));
  return Object.assign({ account: accountIndex }, result);
}

export function saveCryptoAccount(
  ca: CryptoAccount
): void {
  saveInStorage(ACCOUNT_KEY, ca);
}

export function getSingleCryptoAccount(): CryptoAccount {
  return getFromStorage(ACCOUNT_KEY);
}
