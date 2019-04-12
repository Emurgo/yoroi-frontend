// @flow

// Wrapper for creating "accounts" as defined by bip44

import { getCryptoWalletFromMasterKey } from './lib/cardanoCrypto/cryptoWallet';

import { RustModule } from './lib/cardanoCrypto/rustLoader';
import { HARD_DERIVATION_START } from '../../config/numbersConfig';
import type { CryptoAccount } from './adaLocalStorage';

const ACCOUNT_INDEX = 0; /* Currently we only provide a SINGLE account */

export function createCryptoAccount(
  encryptedMasterKey: string,
  walletPassword: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  const cryptoWallet = getCryptoWalletFromMasterKey(encryptedMasterKey, walletPassword);
  // create a hardened account
  const account = cryptoWallet.bip44_account(
    RustModule.Wallet.AccountIndex.new(accountIndex | HARD_DERIVATION_START)
  );
  const accountPublic = account.public();
  return {
    account: accountIndex,
    root_cached_key: accountPublic,
    derivation_scheme: 'V2'
  };
}

export function createHardwareWalletAccount(
  publicMasterKey: string,
  accountIndex: number = ACCOUNT_INDEX
): CryptoAccount {
  const pubKey = RustModule.Wallet.PublicKey.from_hex(publicMasterKey);
  const account = RustModule.Wallet.Bip44AccountPublic.new(
    pubKey,
    RustModule.Wallet.DerivationScheme.v2()
  );
  const cryptoAccount = {
    root_cached_key: account,
    derivation_scheme: 'V2',
    account: accountIndex
  };

  return cryptoAccount;
}
