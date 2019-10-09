// @flow

import { dumpByVersion } from './index';
import { RustModule } from '../../cardanoCrypto/rustLoader';

/**
 * This file contains methods used to extract information
 * from the legacy database format
 * They should NOT be used for any purpose other than
 * to migrate to a new format
 */

export type LegacyAddressingInfo = {
  account: number,
  change: number,
  index: number,
};
export type LegacyAdaAmount = {
  getCCoin: string,
};
export type LegacyAdaAddress = {
  cadAmount: LegacyAdaAmount,
  cadId: string,
  cadIsUsed: boolean,
} & LegacyAddressingInfo;

type LegacyLocalStorageWallet = {
  adaWallet: AdaWallet,
  masterKey?: string, // unused in hardware wallets
  // this is a per-account setting but we only have 1 account per wallet in Yoroi
  lastReceiveAddressIndex: number
}

export type LegacyCryptoAccount = {
  account: number,
  // master public key
  root_cached_key: RustModule.Wallet.Bip44AccountPublic,
  derivation_scheme: string
}

type LegacyLocalStorageCryptoAccount = {
  account: number,
  root_cached_key: string, // MasterPublicKey
  derivation_scheme: string
}

export const getLegacyAddressesList = (): Array<LegacyAdaAddress> => {
  if (dumpByVersion.Addresses) {
    return dumpByVersion.Addresses;
  }
  return [];
};

export const resetLegacy = (): void => {
  for (const prop of Object.keys(dumpByVersion)) {
    delete dumpByVersion[prop];
  }
};
