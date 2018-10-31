// @flow
import { Wallet } from 'rust-cardano-crypto';
import { getCryptoWalletFromMasterKey } from './lib/cardanoCrypto/cryptoWallet';
import { getResultOrFail } from './lib/cardanoCrypto/cryptoUtils';
import { saveCryptoAccount } from './adaLocalStorage';

const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */

export function newCryptoAccount(
  masterKey: string,
  walletPassword: string
): CryptoAccount {
  const cryptoAccount = createCryptoAccount(masterKey, walletPassword);
  saveCryptoAccount(cryptoAccount);
  return cryptoAccount;
}

export function createCryptoAccount(
  masterKey: string,
  walletPassword: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  const cryptoWallet = getCryptoWalletFromMasterKey(masterKey, walletPassword);
  const result = getResultOrFail(Wallet.newAccount(cryptoWallet, accountIndex));
  return Object.assign({ account: accountIndex }, result);
}

export function createCryptoHardwareBackedAccount(
  masterKey: string,
  walletPassword: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  // FIXME : if possible call rust-cardano-crypto
  const cryptoAccount = {
    root_cached_key: masterKey,
    derivation_scheme: 'V2',
    account: accountIndex
  };

  return cryptoAccount;
}